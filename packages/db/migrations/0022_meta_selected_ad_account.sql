-- Migration: 0022_meta_selected_ad_account
-- Add selected_ad_account_id to meta_connections for ad account selection.

ALTER TABLE meta_connections
ADD COLUMN selected_ad_account_id TEXT NULL;

COMMENT ON COLUMN meta_connections.selected_ad_account_id IS 'User-selected ad account ID for Ads module (from /me/adaccounts)';
