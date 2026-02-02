-- Migration: 0015_run_events_add_run_id_uuid
-- Adds run_id_uuid (UUID, nullable) to run_events for schema-correct FK to scrape_runs.
-- Keeps run_id TEXT for backward compatibility and non-scrape events (e.g. support:uuid).
-- Runner wraps in transaction.

-- 1) Add column
ALTER TABLE run_events ADD COLUMN IF NOT EXISTS run_id_uuid UUID;

-- 2) Backfill: only set when run_id is a UUID string AND exists in scrape_runs
UPDATE run_events re
SET run_id_uuid = re.run_id::uuid
WHERE re.run_id ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$'
  AND EXISTS (SELECT 1 FROM scrape_runs sr WHERE sr.id = re.run_id::uuid);

-- 3) Add FK (nullable, idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'run_events_run_id_uuid_fkey'
  ) THEN
    ALTER TABLE run_events
    ADD CONSTRAINT run_events_run_id_uuid_fkey
    FOREIGN KEY (run_id_uuid) REFERENCES scrape_runs(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- 4) Add index
CREATE INDEX IF NOT EXISTS idx_run_events_run_id_uuid_created_at
ON run_events (run_id_uuid, created_at);
