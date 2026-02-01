-- Migration: 0010_seed_queue_lock_events
-- Event codes for BullMQ lock issues.

INSERT INTO error_taxonomy (event_code, category, severity_default, user_message_template, runbook_reference) VALUES
  ('QUEUE_LOCK_RENEW_FAIL', 'queue', 'warn', 'Queue lock renew failed: {{message}}', 'docs/22_local_validation.md'),
  ('QUEUE_LOCK_LOST', 'queue', 'error', 'Queue lock lost: {{message}}', 'docs/22_local_validation.md')
ON CONFLICT (event_code) DO NOTHING;
