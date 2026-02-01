-- Migration: 0009_allow_probe_run_type
-- Expand scrape_runs.run_type check constraint to include 'probe'.

DO $$
DECLARE
  v_constraint_name text;
BEGIN
  -- Drop existing run_type check constraints (unnamed in 0001).
  FOR v_constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'scrape_runs'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%run_type%'
  LOOP
    EXECUTE format('ALTER TABLE scrape_runs DROP CONSTRAINT %I', v_constraint_name);
  END LOOP;

  -- Add new constraint if not present.
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'scrape_runs'
      AND tc.constraint_name = 'scrape_runs_run_type_check'
  ) THEN
    ALTER TABLE scrape_runs
      ADD CONSTRAINT scrape_runs_run_type_check
      CHECK (run_type IN ('test', 'prod', 'probe'));
  END IF;
END $$;
