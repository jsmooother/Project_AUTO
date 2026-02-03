-- Migration: 0023_meta_ad_creatives
-- Add creative_id, last_publish_step, last_publish_error to meta_ad_objects (Step 4: Ad Creative + Ad).

ALTER TABLE meta_ad_objects
  ADD COLUMN IF NOT EXISTS creative_id TEXT,
  ADD COLUMN IF NOT EXISTS last_publish_step TEXT,
  ADD COLUMN IF NOT EXISTS last_publish_error TEXT;
