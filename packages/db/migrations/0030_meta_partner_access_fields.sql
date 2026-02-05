-- Migration: 0030_meta_partner_access_fields
-- Partner access verification state for Meta (Option 1: System User token).

ALTER TABLE meta_connections
  ADD COLUMN IF NOT EXISTS partner_access_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS partner_access_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS partner_access_error TEXT;

COMMENT ON COLUMN meta_connections.partner_access_status IS 'pending|verified|failed';
COMMENT ON COLUMN meta_connections.partner_access_checked_at IS 'Last time GET /meta/permissions/check succeeded or failed';
COMMENT ON COLUMN meta_connections.partner_access_error IS 'Last error message from permissions check (if failed)';
