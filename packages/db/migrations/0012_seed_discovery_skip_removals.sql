-- Migration: 0012_seed_discovery_skip_removals
-- Adds DISCOVERY_TOO_LOW_SKIP_REMOVALS to error_taxonomy for SCRAPE_PROD guardrail.

INSERT INTO error_taxonomy (event_code, category, severity_default, user_message_template, runbook_reference) VALUES
  ('DISCOVERY_TOO_LOW_SKIP_REMOVALS', 'scrape', 'warn', 'Discovery returned too few items; removals were skipped to prevent false deactivations.', 'docs/21_incremental_sync.md')
ON CONFLICT (event_code) DO NOTHING;
