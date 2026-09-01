# Hotel Content Quality & Location Analysis

Auditing a 53K-record hotel content catalog for missing, inconsistent, duplicate, and anomalous data — and surfacing where those problems cluster geographically.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-data%20analysis-150458?logo=pandas&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-SQLite-4479A1?logo=sqlite&logoColor=white)
![React](https://img.shields.io/badge/Dashboard-React%20%2B%20Recharts-61DAFB?logo=react&logoColor=white)
![Excel](https://img.shields.io/badge/Excel-KPI%20workbook-217346?logo=microsoftexcel&logoColor=white)

## Overview

This project simulates a data-quality audit for a global hotel distribution catalog — the kind of work a content-operations or data analytics team runs before content feeds a booking site or search ranking model. It:

- Profiles **53,334 hotel records** across 7 markets and 5 segments for missing, inconsistent, duplicate, and anomalous content attributes
- Measures completeness and quality KPIs by market and hotel category using **SQL**
- Investigates record-level patterns — duplicate listings, rule-based anomalies, and geographic outliers — using **Python / pandas**
- Presents findings in an **interactive dashboard** and a formula-driven **Excel KPI workbook**

> **Note on the data:** No real hotel dataset was available for this project, so `hotel_content_data.csv` is a **synthetically generated catalog** built to mirror realistic, market-correlated content-quality patterns (see [Dataset](#dataset) below). Every script, query, and number in this repo is real and reproducible — it's the underlying data that's simulated, not the analysis.

## Key Findings

| Metric | Result |
|---|---|
| Overall content completeness | **84.6%** across 8 core fields |
| Weakest → strongest market | Africa **64.9%** → North America **92.6%** (27.7-point gap) |
| Weakest → strongest segment | Budget **77.2%** → Luxury **92.0%** |
| Likely duplicate listings | **3,147 records (5.9%)** — 88.2% recall / 55.7% precision, benchmarked against a held-out labeled sample |
| Records with ≥ 1 anomaly | **5,886 records (11.0%)** |
| Biggest single anomaly | 3,938 records with a future-dated `last_updated` timestamp |
| Inconsistent country labels | 226 records (`USA` / `US` / `United States of America`, etc.) |
| Stale content | 44.2% of listings not touched in 2+ years |

Full breakdowns by field, market, segment, and city are in the dashboard and workbook.

## Repository Structure

```
├── hotel_content_data.csv               # Raw catalog (53,334 records, 26 columns)
├── content_quality_kpis.sql             # Completeness KPIs, duplicate & anomaly detection (SQL)
├── content_quality_analysis.py          # Fuzzy duplicate matching, anomaly rules, geo outliers (pandas)
├── Hotel_Content_Quality_Dashboard.jsx  # Interactive filterable dashboard (React + Recharts)
├── Hotel_Content_Quality_KPIs.xlsx      # KPI summary workbook (live formulas)
└── README.md
```

## Dataset

`hotel_content_data.csv` models a hotel-distribution content feed: identity fields (name, brand, address, coordinates), commercial fields (category, room count, nightly rate), and content fields (description, amenities, images, contact details). Missingness, duplicate listings, inconsistent labels, and anomalous values were injected with rates that vary by market and segment — mirroring how real content pipelines tend to degrade unevenly (emerging markets and budget segments lag more than mature markets and luxury segments) rather than randomly.

<details>
<summary>Column reference</summary>

| Column | Description |
|---|---|
| `hotel_id`, `hotel_name`, `brand` | Identity |
| `market`, `country`, `city`, `latitude`, `longitude`, `address` | Location |
| `category`, `star_rating` | Canonical segment / star tier |
| `category_raw`, `country_raw` | As-stored values — may contain non-canonical variants |
| `number_of_rooms`, `avg_nightly_rate_usd` | Commercial attributes |
| `description`, `amenities`, `primary_image_url`, `image_count` | Content fields |
| `phone`, `email`, `website`, `check_in_time`, `check_out_time` | Contact / operational fields |
| `last_updated`, `content_source` | Feed metadata |

</details>

## Methodology

**1. SQL — completeness & quality KPIs** (`content_quality_kpis.sql`)
Aggregates completeness across 8 core content fields by market, segment, and city; flags duplicate candidates via exact-name + coarse-coordinate grouping (a cheap, schedulable first pass); and detects anomalies directly from field values — geo bounds, pricing, dates, placeholder text, category vocabulary — with no reliance on pre-labeled flags.

**2. Python / pandas — record-level investigation** (`content_quality_analysis.py`)
Goes beyond aggregation: a fuzzy name-matching pass within geo buckets catches near-duplicate listings the SQL exact-match misses (benchmarked at 88.2% recall / 55.7% precision against a held-out labeled sample); rule-based checks flag anomalous records; and a z-score comparison surfaces cities that under-perform *their own region's norm* — a more targeted signal than a raw global ranking, since it also catches outliers inside otherwise-healthy markets (e.g., Milan and Shanghai both under-perform their regional peers despite reasonable absolute completeness).

**3. Dashboard** (`Hotel_Content_Quality_Dashboard.jsx`)
An interactive, filterable view (market / segment) built in React + Recharts, covering field- and market-level completeness, a geographic scatter of where gaps cluster, weakest-city and regional-outlier tables, anomaly and freshness breakdowns, inconsistent-value logs, and data-driven improvement recommendations.

**4. KPI workbook** (`Hotel_Content_Quality_KPIs.xlsx`)
A summary workbook with live formulas (weighted completeness, min/max lookups, % of catalog) for anyone who wants the KPIs in spreadsheet form.

## Running It

```bash
# Requirements
pip install pandas

# SQL KPIs (loads the CSV into an in-memory SQLite DB and runs the queries)
python3 -c "
import sqlite3, pandas as pd
df = pd.read_csv('hotel_content_data.csv')
conn = sqlite3.connect(':memory:')
df.to_sql('hotels', conn, index=False)
print(pd.read_sql(open('content_quality_kpis.sql').read().split(';')[0], conn))
"

# Full pandas analysis (missingness, duplicates, anomalies, geo outliers)
python3 content_quality_analysis.py
```

**Viewing the dashboard:** it's a self-contained React component (`recharts` + inline styles, no external CSS). Two options:
- Paste it into [claude.ai](https://claude.ai) as an artifact — it renders immediately.
- Drop it into any React project with `react` and `recharts` installed and render `<Dashboard />`.

## Improvement Opportunities

- **Prioritize Africa & Latin America** for a content-refresh sprint, starting with Budget/Midscale listings — they lag furthest (57–67% completeness in the worst combinations).
- **Treat duplicate detection as triage, not auto-merge** — the fuzzy matcher catches ~88% of true duplicates, but roughly 44% of its flags still need human review before merging.
- **Add ingestion-time validation** to reject `last_updated` dates outside a sane rolling window — this is currently the single largest anomaly category.
- **Normalize free-text market fields** (country, segment) against a controlled vocabulary at ingestion, rather than cleaning up variants after the fact.
- **Schedule recurring re-verification** for the 44% of the catalog untouched in 2+ years, weighted toward the lowest-completeness markets first.

## License

Add a license of your choice (e.g. MIT) if you'd like this repo to be reusable by others.
