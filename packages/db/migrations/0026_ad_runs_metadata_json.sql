-- Migration: 0026_ad_runs_metadata_json
-- Add metadata_json column to ad_runs for storing Meta payload previews and diagnostics.

ALTER TABLE ad_runs ADD COLUMN IF NOT EXISTS metadata_json jsonb NULL;

CREATE INDEX IF NOT EXISTS ad_runs_metadata_json_idx ON ad_runs USING GIN (metadata_json);
