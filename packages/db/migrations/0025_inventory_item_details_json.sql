-- Migration: 0025_inventory_item_details_json
-- Add flexible JSONB details column to inventory_items for real crawl data (ivarsbil.se adapter).

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS details_json jsonb NULL;

CREATE INDEX IF NOT EXISTS inventory_items_details_json_idx ON inventory_items USING GIN (details_json);
