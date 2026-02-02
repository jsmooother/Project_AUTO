-- Migration: 0011_seed_headless_used_event
-- Event code for headless usage tracking.

INSERT INTO error_taxonomy (event_code, category, severity_default, user_message_template, runbook_reference) VALUES
  ('HEADLESS_USED', 'scrape', 'info', 'Headless driver used ({{mode}})', 'docs/22_local_validation.md')
ON CONFLICT (event_code) DO NOTHING;
