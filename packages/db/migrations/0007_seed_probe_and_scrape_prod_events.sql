-- Migration: 0007_seed_probe_and_scrape_prod_events
-- Event codes for SOURCE_PROBE and SCRAPE_PROD (discovery, diff, details, removals).

INSERT INTO error_taxonomy (event_code, category, severity_default, user_message_template, runbook_reference) VALUES
  ('PROBE_START', 'scrape', 'info', 'Onboarding probe started', NULL),
  ('PROBE_STRATEGY_SELECTED', 'scrape', 'info', 'Discovery strategy selected: {{strategy}}', NULL),
  ('PROBE_DONE', 'scrape', 'info', 'Probe completed with confidence {{confidence}}', NULL),
  ('PROBE_NO_STRATEGY', 'scrape', 'warn', 'No discovery strategy yielded enough items', 'docs/21_incremental_sync.md'),
  ('PROFILE_MISSING', 'scrape', 'warn', 'Site profile missing or stale; run probe first', 'docs/21_incremental_sync.md'),
  ('HEADLESS_DISABLED', 'scrape', 'warn', 'Headless driver disabled; set HEADLESS_ENABLED=1 to use', NULL),
  ('DISCOVERY_START', 'scrape', 'info', 'Discovery started', NULL),
  ('DISCOVERY_DONE', 'scrape', 'info', 'Discovery completed', NULL),
  ('DIFF_DONE', 'scrape', 'info', 'Diff/upsert completed', NULL),
  ('DETAILS_START', 'scrape', 'info', 'Detail fetch started', NULL),
  ('DETAILS_DONE', 'scrape', 'info', 'Detail fetch completed', NULL),
  ('REMOVALS_DONE', 'scrape', 'info', 'Removed items marked', NULL),
  ('SCRAPE_PROD_SUCCESS', 'scrape', 'info', 'SCRAPE_PROD completed successfully', NULL),
  ('SCRAPE_PROD_FAIL', 'scrape', 'error', 'SCRAPE_PROD failed: {{message}}', 'docs/21_incremental_sync.md'),
  ('ITEM_DETAIL_OK', 'scrape', 'info', 'Item detail fetched', NULL),
  ('ITEM_DETAIL_FAIL', 'scrape', 'warn', 'Item detail fetch failed: {{reason}}', NULL),
  ('SYSTEM_JOB_START', 'observability', 'info', 'Job started', NULL),
  ('SYSTEM_JOB_SUCCESS', 'observability', 'info', 'Job completed successfully', NULL),
  ('SYSTEM_JOB_FAIL', 'observability', 'error', 'Job failed: {{message}}', NULL)
ON CONFLICT (event_code) DO NOTHING;
