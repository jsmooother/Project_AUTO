-- Migration: 0006_site_profile_and_items_lifecycle
-- SiteProfile in data_sources.config_json; items lifecycle + detail; scrape_runs counters.
-- Idempotent: ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS.

-- A1) data_sources.config for SiteProfile (profileVersion, probe, discovery, fetch, extract, limits)
ALTER TABLE data_sources ADD COLUMN IF NOT EXISTS config_json JSONB;

-- A2) items lifecycle + detail
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_seen_run_id UUID REFERENCES scrape_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_detail_run_id UUID REFERENCES scrape_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS detail_fetched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS description_text TEXT,
  ADD COLUMN IF NOT EXISTS price_amount NUMERIC(20, 4),
  ADD COLUMN IF NOT EXISTS price_currency TEXT,
  ADD COLUMN IF NOT EXISTS image_urls_json JSONB,
  ADD COLUMN IF NOT EXISTS primary_image_url TEXT;

-- Indexes for items (discovery/diff/detail queries)
CREATE INDEX IF NOT EXISTS idx_items_customer_data_source_active
  ON items (customer_id, data_source_id, is_active);
CREATE INDEX IF NOT EXISTS idx_items_customer_data_source_last_seen_run
  ON items (customer_id, data_source_id, last_seen_run_id);
CREATE INDEX IF NOT EXISTS idx_items_customer_data_source_detail_fetched
  ON items (customer_id, data_source_id, detail_fetched_at);

-- A3) scrape_runs counters (items_seen, items_new, items_removed)
ALTER TABLE scrape_runs
  ADD COLUMN IF NOT EXISTS items_seen INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS items_removed INTEGER NOT NULL DEFAULT 0;
