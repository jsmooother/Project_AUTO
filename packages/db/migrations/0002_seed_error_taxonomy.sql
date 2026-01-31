-- Migration: 0002_seed_error_taxonomy
-- Creates error_taxonomy table and seeds 20-30 event codes for observability.

CREATE TABLE IF NOT EXISTS error_taxonomy (
  event_code TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  severity_default TEXT NOT NULL,
  user_message_template TEXT,
  runbook_reference TEXT
);

INSERT INTO error_taxonomy (event_code, category, severity_default, user_message_template, runbook_reference) VALUES
  ('SCRAPE_START', 'scrape', 'info', 'Scrape started for data source', NULL),
  ('SCRAPE_FETCH_OK', 'scrape', 'info', 'Page fetched successfully', NULL),
  ('SCRAPE_FETCH_FAIL', 'scrape', 'error', 'Failed to fetch page: {{message}}', 'docs/06_scraping_pipeline.md'),
  ('SCRAPE_PARSE_OK', 'scrape', 'info', 'Page parsed successfully', NULL),
  ('SCRAPE_PARSE_FAIL', 'scrape', 'error', 'Parse error: {{message}}', 'docs/06_scraping_pipeline.md'),
  ('SCRAPE_TIMEOUT', 'scrape', 'error', 'Request timed out', 'docs/06_scraping_pipeline.md'),
  ('SCRAPE_RATE_LIMIT', 'scrape', 'warn', 'Rate limited by target site', 'docs/06_scraping_pipeline.md'),
  ('SCRAPE_NO_ITEMS', 'scrape', 'warn', 'No items found on page', NULL),
  ('SCRAPE_DIFF_NEW', 'scrape', 'info', 'New items detected: {{count}}', NULL),
  ('SCRAPE_DIFF_UPDATED', 'scrape', 'info', 'Updated items: {{count}}', NULL),
  ('SCRAPE_DIFF_DELETED', 'scrape', 'info', 'Deleted items: {{count}}', NULL),
  ('SCRAPE_FINISH', 'scrape', 'info', 'Scrape finished', NULL),
  ('SCRAPE_CRASH', 'scrape', 'error', 'Scrape job crashed: {{message}}', 'docs/09_observability_and_support.md'),
  ('META_AUTH_FAIL', 'meta', 'error', 'Meta API authentication failed', 'docs/07_meta_integration.md'),
  ('META_RATE_LIMIT', 'meta', 'warn', 'Meta API rate limit (429)', 'docs/07_meta_integration.md'),
  ('META_CATALOG_SYNC_OK', 'meta', 'info', 'Catalog sync completed', NULL),
  ('META_CATALOG_SYNC_FAIL', 'meta', 'error', 'Catalog sync failed: {{message}}', 'docs/07_meta_integration.md'),
  ('META_CAMPAIGN_CREATE_OK', 'meta', 'info', 'Campaign created', NULL),
  ('META_CAMPAIGN_CREATE_FAIL', 'meta', 'error', 'Campaign creation failed: {{message}}', 'docs/07_meta_integration.md'),
  ('QUEUE_ENQUEUE', 'queue', 'info', 'Job enqueued', NULL),
  ('QUEUE_DEAD_LETTER', 'queue', 'error', 'Job moved to dead letter: {{reason}}', 'docs/05_queue_and_jobs.md'),
  ('STORAGE_UPLOAD_FAIL', 'storage', 'error', 'Storage upload failed: {{message}}', 'docs/03_stack_and_services.md'),
  ('STORAGE_DOWNLOAD_FAIL', 'storage', 'error', 'Storage download failed: {{message}}', 'docs/03_stack_and_services.md'),
  ('RUN_EVENT_INVALID', 'observability', 'warn', 'Invalid run event: missing correlation', 'docs/09_observability_and_support.md'),
  ('SUPPORT_CASE_CREATED', 'support', 'info', 'Support case created', NULL),
  ('DB_MIGRATION_APPLIED', 'db', 'info', 'Migration applied: {{version}}', NULL),
  ('DB_QUERY_FAIL', 'db', 'error', 'Database query failed: {{message}}', 'docs/04_data_model.md'),
  ('VALIDATION_FAIL', 'validation', 'warn', 'Validation failed: {{message}}', NULL),
  ('UNKNOWN_ERROR', 'system', 'error', 'Unexpected error: {{message}}', 'docs/09_observability_and_support.md')
ON CONFLICT (event_code) DO NOTHING;
