"""
Record-level content quality analysis with pandas.
Complements the SQL KPI queries with detection logic that needs row-by-row /
fuzzy comparison rather than simple aggregation:
  - Missing-value profiling per record and per field
  - Duplicate listing detection (geo-proximity + fuzzy name match)
  - Rule-based anomaly detection
  - Inconsistent-value standardization check
  - Statistical outlier detection for locations (z-score vs each market's
    own baseline, not just a raw global ranking)
"""
import re
from difflib import SequenceMatcher

import numpy as np
import pandas as pd

pd.set_option("display.width", 120)

df = pd.read_csv("/home/claude/hotel_project/hotel_content_data.csv", parse_dates=["last_updated"])
SNAPSHOT_DATE = pd.Timestamp("2026-08-15")
CORE_FIELDS = ["description", "amenities", "primary_image_url", "phone",
               "email", "website", "number_of_rooms", "check_in_time"]

# =============================================================================
# 1. MISSING-VALUE PROFILE
# =============================================================================
field_missing = df[CORE_FIELDS].isna().mean().sort_values(ascending=False) * 100
df["content_completeness_pct"] = df[CORE_FIELDS].notna().mean(axis=1) * 100
print("Field-level missing rate (%):")
print(field_missing.round(1).to_string())
print(f"\nOverall record completeness: {df['content_completeness_pct'].mean():.1f}%")
print(f"Records with 3+ missing core fields: "
      f"{(df[CORE_FIELDS].isna().sum(axis=1) >= 3).sum():,} "
      f"({(df[CORE_FIELDS].isna().sum(axis=1) >= 3).mean()*100:.1f}%)")

# =============================================================================
# 2. DUPLICATE DETECTION — geo bucket + fuzzy name match (no ground truth used)
# =============================================================================
def norm_name(s):
    return re.sub(r"[^a-z0-9]", "", str(s).lower())

df["_lat_bucket"] = df["latitude"].round(2)  # ~1.1km grid: wide enough to survive
df["_lon_bucket"] = df["longitude"].round(2)  # cross-vendor geocoding drift
df["_name_norm"] = df["hotel_name"].map(norm_name)

dup_pairs = []
for (_, _), g in df.groupby(["_lat_bucket", "_lon_bucket"]):
    if len(g) < 2:
        continue
    idxs = g.index.tolist()
    for i in range(len(idxs)):
        for j in range(i + 1, len(idxs)):
            a, b = df.loc[idxs[i]], df.loc[idxs[j]]
            sim = SequenceMatcher(None, a["_name_norm"], b["_name_norm"]).ratio()
            if sim >= 0.90:
                dup_pairs.append((a["hotel_id"], b["hotel_id"], round(sim, 2)))

dup_df = pd.DataFrame(dup_pairs, columns=["hotel_id_a", "hotel_id_b", "name_similarity"])
detected_ids = set(dup_df["hotel_id_a"]).union(dup_df["hotel_id_b"])
print(f"\nLikely duplicate listings detected (geo + fuzzy name match): {len(dup_pairs):,} pairs, "
      f"{len(detected_ids):,} records involved")

# --- Method validation (dev-only) -------------------------------------------
# hotel_content_data.csv ships with no "this record is a duplicate" label --
# a real content feed wouldn't have one; finding duplicates is the point of
# this step. To still be able to quote a recall/precision figure for the
# matching method, a small held-out label file was produced *only* during
# synthetic data generation (dev_duplicate_validation_labels.csv) and is not
# part of the production dataset. If present, use it purely to benchmark the
# detector already built above; it plays no role in the detection itself.
try:
    labels = pd.read_csv("/home/claude/hotel_project/dev_duplicate_validation_labels.csv")
    true_dupe_ids = set(labels.loc[labels["is_duplicate_pair"] == True, "hotel_id"])
    recall = len(detected_ids & true_dupe_ids) / max(len(true_dupe_ids), 1)
    precision = len(detected_ids & true_dupe_ids) / max(len(detected_ids), 1)
    print(f"[dev validation only] recall: {recall*100:.1f}%, precision: {precision*100:.1f}% "
          f"against a held-out labeled sample (not part of the shipped dataset)")
except FileNotFoundError:
    recall = precision = None
    print("[dev validation labels not found — skipping benchmark]")

# =============================================================================
# 3. RULE-BASED ANOMALY DETECTION
# =============================================================================
placeholder_re = re.compile(r"lorem ipsum|tbd|test hotel|coming soon", re.IGNORECASE)

anomalies = pd.DataFrame({
    "bad_geo": ~df["latitude"].between(-90, 90) | ~df["longitude"].between(-180, 180) |
               ((df["latitude"] == 0) & (df["longitude"] == 0)),
    "bad_rooms": df["number_of_rooms"] <= 0,
    "bad_rate": df["avg_nightly_rate_usd"] <= 0,
    "future_dated": df["last_updated"] > SNAPSHOT_DATE,
    "placeholder_text": df["description"].fillna("").str.contains(placeholder_re),
    "bad_category": ~df["category_raw"].str.lower().isin(
        ["budget", "midscale", "upscale", "luxury", "boutique"] +
        [v.lower() for vs in [["5-star","five star","luxury"],["4-star","four star"],
         ["3-star","mid-scale"],["2-star","economy","budget"],["boutique hotel","boutique"]] for v in vs]
    ),
})
df["anomaly_count"] = anomalies.sum(axis=1)
anomaly_totals = anomalies.sum().sort_values(ascending=False)
print("\nRule-based anomaly counts:")
print(anomaly_totals.to_string())
print(f"Records with at least one anomaly: {(df['anomaly_count'] > 0).sum():,} "
      f"({(df['anomaly_count'] > 0).mean()*100:.2f}%)")

# =============================================================================
# 4. INCONSISTENT-VALUE STANDARDIZATION CHECK
# =============================================================================
COUNTRY_CANON = {"usa": "United States", "us": "United States",
                  "united states of america": "United States",
                  "uk": "United Kingdom", "britain": "United Kingdom",
                  "uae": "United Arab Emirates"}
raw_lower = df["country_raw"].str.lower()
needs_standardization = raw_lower.isin(COUNTRY_CANON.keys())
print(f"\nCountry values needing standardization to a canonical name: {needs_standardization.sum():,}")
print(df.loc[needs_standardization, "country_raw"].value_counts().to_string())

# =============================================================================
# 5. GEOGRAPHIC OUTLIER DETECTION — z-score vs each market's OWN baseline
#    (surfaces cities that under-perform their region, not just globally low ones)
# =============================================================================
city_stats = (df.groupby(["market", "country", "city"])
                .agg(hotel_count=("hotel_id", "count"),
                     completeness_pct=("content_completeness_pct", "mean"))
                .reset_index())
city_stats = city_stats[city_stats["hotel_count"] >= 15]

market_stats = city_stats.groupby("market")["completeness_pct"].agg(["mean", "std"]).rename(
    columns={"mean": "market_mean", "std": "market_std"})
city_stats = city_stats.join(market_stats, on="market")
city_stats["z_score"] = (city_stats["completeness_pct"] - city_stats["market_mean"]) / city_stats["market_std"]
outliers = city_stats[city_stats["z_score"] <= -1.0].sort_values("z_score")

print("\nLocations with unusually incomplete content RELATIVE TO THEIR OWN REGION'S NORM "
      "(z-score <= -1.0):")
print(outliers[["market", "country", "city", "hotel_count", "completeness_pct",
                 "market_mean", "z_score"]].round(2).to_string(index=False))

# =============================================================================
# Save outputs for downstream dashboard build
# =============================================================================
df.drop(columns=["_lat_bucket", "_lon_bucket", "_name_norm"]).to_csv(
    "/home/claude/hotel_project/hotel_content_data_scored.csv", index=False)
city_stats.to_csv("/home/claude/hotel_project/city_level_stats.csv", index=False)
dup_df.to_csv("/home/claude/hotel_project/detected_duplicate_pairs.csv", index=False)

import pickle
with open("/home/claude/hotel_project/pandas_results.pkl", "wb") as f:
    pickle.dump({
        "field_missing": field_missing,
        "anomaly_totals": anomaly_totals,
        "dup_pair_count": len(dup_pairs),
        "dup_record_count": len(detected_ids),
        "dup_recall": recall,
        "dup_precision": precision,
        "city_stats": city_stats,
        "outliers": outliers,
        "overall_completeness": df["content_completeness_pct"].mean(),
    }, f)

print("\nSaved: hotel_content_data_scored.csv, city_level_stats.csv, "
      "detected_duplicate_pairs.csv, pandas_results.pkl")
