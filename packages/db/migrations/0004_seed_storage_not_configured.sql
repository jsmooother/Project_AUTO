-- Migration: 0004_seed_storage_not_configured
-- Add STORAGE_NOT_CONFIGURED to error_taxonomy for worker run_event.

INSERT INTO error_taxonomy (event_code, category, severity_default, user_message_template, runbook_reference) VALUES
  ('STORAGE_NOT_CONFIGURED', 'observability', 'warn', 'Storage adapter not configured; repro_bundles will not be saved', 'docs/18_local_dev_setup.md')
ON CONFLICT (event_code) DO NOTHING;
