-- Migration: 0005_add_job_fields_to_repro_bundles
-- Adds job_type, job_id; run_id TEXT -> UUID FK (nullable); data_source_id; index (job_type, job_id).
--
-- Pre-check before running in prod (run in Supabase SQL editor; expect 0 rows):
--   select run_id from repro_bundles
--   where run_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
--   limit 10;

BEGIN;

-- 1) Add job identity fields
ALTER TABLE repro_bundles
  ADD COLUMN IF NOT EXISTS job_type TEXT,
  ADD COLUMN IF NOT EXISTS job_id   TEXT;

-- 2) Add optional data_source_id
ALTER TABLE repro_bundles
  ADD COLUMN IF NOT EXISTS data_source_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'repro_bundles_data_source_id_fkey'
      AND table_name = 'repro_bundles'
  ) THEN
    ALTER TABLE repro_bundles
      ADD CONSTRAINT repro_bundles_data_source_id_fkey
      FOREIGN KEY (data_source_id) REFERENCES data_sources(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Make run_id nullable for future non-scrape jobs
ALTER TABLE repro_bundles
  ALTER COLUMN run_id DROP NOT NULL;

-- 4) Convert run_id TEXT -> UUID (safe if all values are UUID strings)
-- If this fails, inspect repro_bundles.run_id values.
ALTER TABLE repro_bundles
  ALTER COLUMN run_id TYPE UUID USING run_id::uuid;

-- 5) Add FK to scrape_runs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'repro_bundles_run_id_fkey'
      AND table_name = 'repro_bundles'
  ) THEN
    ALTER TABLE repro_bundles
      ADD CONSTRAINT repro_bundles_run_id_fkey
      FOREIGN KEY (run_id) REFERENCES scrape_runs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6) Index for lookups by job identity
CREATE INDEX IF NOT EXISTS idx_repro_bundles_job
  ON repro_bundles (job_type, job_id);

COMMIT;
