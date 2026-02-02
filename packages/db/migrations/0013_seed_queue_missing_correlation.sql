-- Migration: 0013_seed_queue_missing_correlation
-- Adds QUEUE_MISSING_CORRELATION to error_taxonomy for missing/invalid job correlation.

INSERT INTO error_taxonomy (event_code, category, severity_default, user_message_template, runbook_reference) VALUES
  ('QUEUE_MISSING_CORRELATION', 'queue', 'error', 'Job missing or invalid correlation; dead-lettered.', 'docs/05_queue_and_jobs.md')
ON CONFLICT (event_code) DO NOTHING;
