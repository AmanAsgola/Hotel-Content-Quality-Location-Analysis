-- =============================================================================
-- Hotel Content Quality & Location Analysis — SQL KPI Queries
-- Table: hotels (loaded from hotel_content_data.csv)
-- A hotel's core content fields: description, amenities, primary_image_url,
-- phone, email, website, number_of_rooms, check_in_time
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Overall content completeness score
--    % of the 8 core fields populated, averaged across all listings
-- -----------------------------------------------------------------------------
SELECT
    ROUND(100.0 * AVG(
        (description IS NOT NULL) + (amenities IS NOT NULL) +
        (primary_image_url IS NOT NULL) + (phone IS NOT NULL) +
        (email IS NOT NULL) + (website IS NOT NULL) +
        (number_of_rooms IS NOT NULL) + (check_in_time IS NOT NULL)
    ) / 8.0, 1) AS overall_completeness_pct,
    COUNT(*) AS total_hotels
FROM hotels;

-- -----------------------------------------------------------------------------
-- 2. Field-level completeness — which attributes are weakest across the feed
-- -----------------------------------------------------------------------------
SELECT
    ROUND(100.0 * AVG(description IS NOT NULL), 1)        AS description_pct,
    ROUND(100.0 * AVG(amenities IS NOT NULL), 1)           AS amenities_pct,
    ROUND(100.0 * AVG(primary_image_url IS NOT NULL), 1)   AS image_pct,
    ROUND(100.0 * AVG(phone IS NOT NULL), 1)                AS phone_pct,
    ROUND(100.0 * AVG(email IS NOT NULL), 1)                AS email_pct,
    ROUND(100.0 * AVG(website IS NOT NULL), 1)              AS website_pct,
    ROUND(100.0 * AVG(number_of_rooms IS NOT NULL), 1)      AS rooms_pct,
    ROUND(100.0 * AVG(check_in_time IS NOT NULL), 1)        AS checkin_time_pct
FROM hotels;

-- -----------------------------------------------------------------------------
-- 3. Completeness by market — surfaces the geographic pattern
-- -----------------------------------------------------------------------------
SELECT
    market,
    COUNT(*) AS hotel_count,
    ROUND(100.0 * AVG(
        (description IS NOT NULL) + (amenities IS NOT NULL) +
        (primary_image_url IS NOT NULL) + (phone IS NOT NULL) +
        (email IS NOT NULL) + (website IS NOT NULL) +
        (number_of_rooms IS NOT NULL) + (check_in_time IS NOT NULL)
    ) / 8.0, 1) AS completeness_pct
FROM hotels
GROUP BY market
ORDER BY completeness_pct ASC;

-- -----------------------------------------------------------------------------
-- 4. Completeness by hotel category (segment)
-- -----------------------------------------------------------------------------
SELECT
    category,
    COUNT(*) AS hotel_count,
    ROUND(100.0 * AVG(
        (description IS NOT NULL) + (amenities IS NOT NULL) +
        (primary_image_url IS NOT NULL) + (phone IS NOT NULL) +
        (email IS NOT NULL) + (website IS NOT NULL) +
        (number_of_rooms IS NOT NULL) + (check_in_time IS NOT NULL)
    ) / 8.0, 1) AS completeness_pct
FROM hotels
GROUP BY category
ORDER BY completeness_pct ASC;

-- -----------------------------------------------------------------------------
-- 5. Market x Category completeness matrix (drill-down behind the dashboard)
-- -----------------------------------------------------------------------------
SELECT
    market,
    category,
    COUNT(*) AS hotel_count,
    ROUND(100.0 * AVG(
        (description IS NOT NULL) + (amenities IS NOT NULL) +
        (primary_image_url IS NOT NULL) + (phone IS NOT NULL) +
        (email IS NOT NULL) + (website IS NOT NULL) +
        (number_of_rooms IS NOT NULL) + (check_in_time IS NOT NULL)
    ) / 8.0, 1) AS completeness_pct
FROM hotels
GROUP BY market, category
ORDER BY market, completeness_pct ASC;

-- -----------------------------------------------------------------------------
-- 6. Worst-performing cities (min 40 listings, so small markets don't skew ranking)
--    -> "locations with unusually high rates of incomplete hotel information"
-- -----------------------------------------------------------------------------
SELECT
    country,
    city,
    market,
    COUNT(*) AS hotel_count,
    ROUND(100.0 * AVG(
        (description IS NOT NULL) + (amenities IS NOT NULL) +
        (primary_image_url IS NOT NULL) + (phone IS NOT NULL) +
        (email IS NOT NULL) + (website IS NOT NULL) +
        (number_of_rooms IS NOT NULL) + (check_in_time IS NOT NULL)
    ) / 8.0, 1) AS completeness_pct
FROM hotels
GROUP BY country, city, market
HAVING COUNT(*) >= 40
ORDER BY completeness_pct ASC
LIMIT 15;

-- -----------------------------------------------------------------------------
-- 7. Inconsistent value detection — same real-world value, multiple spellings
-- -----------------------------------------------------------------------------
SELECT country_raw AS stored_value, COUNT(*) AS record_count
FROM hotels
WHERE country_raw IN ('USA', 'US', 'United States of America', 'UK', 'Britain', 'UAE')
GROUP BY country_raw
ORDER BY record_count DESC;

SELECT category AS canonical_category, category_raw AS stored_value, COUNT(*) AS record_count
FROM hotels
WHERE category_raw <> category
GROUP BY category, category_raw
ORDER BY canonical_category, record_count DESC;

-- -----------------------------------------------------------------------------
-- 8. Duplicate listings — candidate matches by rounded geo-coordinate + exact
--    name, grouped directly from the source fields (no external labels).
--    This is a first-pass, exact/coarse method: it's cheap to schedule as a
--    nightly SQL job, but will miss near-matches a fuzzy pass would catch
--    (see the pandas script for that fuzzy-matching pass, which also
--    benchmarks precision/recall on this heuristic).
-- -----------------------------------------------------------------------------
SELECT
    SUM(group_size) AS duplicate_flagged_records,
    ROUND(100.0 * SUM(group_size) / (SELECT COUNT(*) FROM hotels), 2) AS pct_of_catalog
FROM (
    SELECT ROUND(latitude, 2) AS lat_r, ROUND(longitude, 2) AS lon_r,
           LOWER(hotel_name) AS name_key, COUNT(*) AS group_size
    FROM hotels
    GROUP BY lat_r, lon_r, name_key
    HAVING COUNT(*) > 1
);

-- -----------------------------------------------------------------------------
-- 9. Anomalous value summary, by anomaly type — computed directly from field
--    values (geo bounds, pricing, dates, placeholder text, category vocabulary)
-- -----------------------------------------------------------------------------
SELECT 'Invalid / null-island coordinates' AS anomaly_type, COUNT(*) AS record_count
FROM hotels
WHERE latitude NOT BETWEEN -90 AND 90 OR longitude NOT BETWEEN -180 AND 180
   OR (latitude = 0 AND longitude = 0)
UNION ALL
SELECT 'Negative or zero room count', COUNT(*) FROM hotels WHERE number_of_rooms <= 0
UNION ALL
SELECT 'Zero / negative nightly rate', COUNT(*) FROM hotels WHERE avg_nightly_rate_usd <= 0
UNION ALL
SELECT 'Future-dated last_updated', COUNT(*) FROM hotels WHERE last_updated > '2026-08-15'
UNION ALL
SELECT 'Placeholder / test description text', COUNT(*) FROM hotels
WHERE LOWER(description) LIKE '%lorem ipsum%' OR LOWER(description) LIKE '%tbd%'
   OR LOWER(description) LIKE '%test hotel%' OR LOWER(description) LIKE '%coming soon%'
UNION ALL
SELECT 'Invalid category / star value', COUNT(*) FROM hotels
-- NOTE: NOT IN silently drops NULL rows under SQL's three-valued logic, so a
-- literal "N/A" written upstream (which pandas' CSV reader coerces to NaN)
-- would otherwise disappear from this count. Handle NULL explicitly.
WHERE category_raw IS NULL OR LOWER(category_raw) NOT IN (
    'budget','midscale','upscale','luxury','boutique','5-star','five star',
    '4-star','four star','3-star','mid-scale','2-star','economy','boutique hotel'
)
ORDER BY record_count DESC;

-- -----------------------------------------------------------------------------
-- 10. Content freshness — how stale is the catalog?
-- -----------------------------------------------------------------------------
SELECT
    CASE
        WHEN julianday('2026-08-15') - julianday(last_updated) < 0 THEN 'Future-dated (anomaly)'
        WHEN julianday('2026-08-15') - julianday(last_updated) <= 180 THEN '0-6 months'
        WHEN julianday('2026-08-15') - julianday(last_updated) <= 365 THEN '6-12 months'
        WHEN julianday('2026-08-15') - julianday(last_updated) <= 730 THEN '1-2 years'
        ELSE '2+ years (stale)'
    END AS freshness_bucket,
    COUNT(*) AS hotel_count,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM hotels), 1) AS pct_of_catalog
FROM hotels
GROUP BY freshness_bucket
ORDER BY hotel_count DESC;
