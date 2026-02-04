# Scrape QA Audit - ivarsbil.se

This document contains SQL queries to audit the quality of scraped inventory data from ivarsbil.se.

## Database Connection

```bash
psql "postgres://postgres:postgres@localhost:5432/project_auto"
```

## 1. Latest 20 Items with Details

Query latest 20 inventory_items with details_json populated:

```sql
SELECT 
  first_seen_at,
  title,
  price as cash_price,
  details_json->>'monthlyPrice' as monthly_price,
  url,
  details_json->>'currency' as currency,
  details_json->>'year' as year,
  details_json->>'mileageKm' as mileage_km,
  details_json->>'fuel' as fuel,
  details_json->>'transmission' as transmission,
  details_json->>'primaryImageUrl' as primary_image_url
FROM inventory_items
WHERE details_json IS NOT NULL
ORDER BY first_seen_at DESC
LIMIT 20;
```

## 2. Detect Suspicious Low Prices

Find items with prices that seem too low (likely parsing errors):

```sql
SELECT 
  id,
  title,
  price,
  url,
  details_json->>'currency' as currency,
  details_json->>'priceAmount' as price_amount_json
FROM inventory_items
WHERE (details_json->'source'->>'site') = 'ivarsbil.se'
  AND price < 50000
ORDER BY first_seen_at DESC;
```

Expected: Most vehicles should be >= 50,000 SEK. If many items show < 50,000, price parsing likely has issues.

## 3. Detect HTML Entities in Titles

Find titles that contain HTML entities (should be decoded):

```sql
SELECT 
  id,
  title,
  url
FROM inventory_items
WHERE (details_json->'source'->>'site') = 'ivarsbil.se'
  AND (title LIKE '%&#%' OR title LIKE '%&amp;%' OR title LIKE '%&quot;%' OR title LIKE '%&apos;%')
ORDER BY created_at DESC
LIMIT 20;
```

Expected: After fixes, latest 10 items should have NO HTML entities in titles.

## 4. Detect Unreasonable Mileage Values

Find items with mileage outside plausible range:

```sql
SELECT 
  id,
  title,
  details_json->>'mileageKm' as mileage_km,
  url
FROM inventory_items
WHERE (details_json->'source'->>'site') = 'ivarsbil.se'
  AND details_json->>'mileageKm' IS NOT NULL
  AND (
    CAST(details_json->>'mileageKm' AS INTEGER) < 0 
    OR CAST(details_json->>'mileageKm' AS INTEGER) > 800000
  )
ORDER BY first_seen_at DESC;
```

Expected: Mileage should be between 0 and 800,000 km for most vehicles.

## 5. Items Without Images

Count items per customer that have no images:

```sql
SELECT 
  customer_id,
  COUNT(*) as items_without_images
FROM inventory_items
WHERE details_json IS NOT NULL
  AND jsonb_array_length(COALESCE(details_json->'images', '[]'::jsonb)) = 0
GROUP BY customer_id
ORDER BY items_without_images DESC;
```

Expected: Most items should have at least 1 image.

## 6. Sample Full details_json

View a complete details_json structure for one item:

```sql
SELECT 
  title,
  price,
  url,
  jsonb_pretty(details_json) as details_json_pretty
FROM inventory_items
WHERE (details_json->'source'->>'site') = 'ivarsbil.se'
ORDER BY created_at DESC
LIMIT 1;
```

## Expected Results After Fixes

### Price Parsing
- Prices should be 6-digit numbers for typical vehicles (e.g., 623750 SEK)
- No systematic low-price bug (most cars should be >= 50,000 SEK)
- Examples:
  - "623 750 SEK" → 623750
  - "623,750 kr" → 623750
  - "623.750" → 623750
  - "623750" → 623750

### Title Decoding
- Titles should contain proper characters:
  - `&#8211;` → `–` (en dash)
  - `&#x2013;` → `–` (hex entity)
  - `&amp;` → `&`
  - `&quot;` → `"`
  - `&nbsp;` → ` ` (space)
- No HTML entities visible in latest 10 items
- Example: "Volvo V40 D2 Manuell, 120hk, 2017 Kinetic &#8211; Ivars Bil" → "Volvo V40 D2 Manuell, 120hk, 2017 Kinetic – Ivars Bil"

### Mileage Parsing
- Mileage should be plausible km values:
  - "12 345 mil" → 123450 km (mil * 10)
  - "12 345 km" → 12345 km
  - "12,345 mil" → 123450 km
  - "12.345 km" → 12345 km
- Values typically between 0 and 500,000 km for used vehicles
- Swedish "mil" (1 mil = 10 km) should be converted to km

### Monthly Price Extraction
- Monthly financing prices are extracted separately and stored in `details_json.monthlyPrice`
- Examples:
  - "Från 8 025 kr/mån" → monthlyPrice: 8025
  - "1 531 kr/mån" → monthlyPrice: 1531
- Monthly prices are stored alongside cash prices for ad targeting flexibility
- Typical range: 1,000 - 20,000 SEK/month

## Quick Verification Query

Run this after a crawl to quickly check data quality:

```sql
SELECT 
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE price >= 50000) as reasonable_prices,
  COUNT(*) FILTER (WHERE title NOT LIKE '%&#%' AND title NOT LIKE '%&amp;%') as decoded_titles,
  COUNT(*) FILTER (WHERE details_json->>'mileageKm' IS NOT NULL 
    AND CAST(details_json->>'mileageKm' AS INTEGER) BETWEEN 0 AND 800000) as reasonable_mileage,
  COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(details_json->'images', '[]'::jsonb)) > 0) as items_with_images
FROM inventory_items
WHERE (details_json->'source'->>'site') = 'ivarsbil.se'
  AND first_seen_at > NOW() - INTERVAL '1 hour';
```

Expected: All counts should match total_items (or very close) after fixes.
