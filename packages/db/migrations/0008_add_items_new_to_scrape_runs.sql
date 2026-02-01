-- Migration: 0008_add_items_new_to_scrape_runs
-- Ensure items_new exists and is non-null with default 0.

ALTER TABLE scrape_runs
  ADD COLUMN IF NOT EXISTS items_new INTEGER;

UPDATE scrape_runs
SET items_new = 0
WHERE items_new IS NULL;

ALTER TABLE scrape_runs
  ALTER COLUMN items_new SET DEFAULT 0,
  ALTER COLUMN items_new SET NOT NULL;
