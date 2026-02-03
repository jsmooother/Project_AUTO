-- Migration: 0020_meta_connections
-- Add meta_connections table for Meta OAuth connection state management.

CREATE TABLE IF NOT EXISTS meta_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'disconnected', -- disconnected|connected|error
  meta_user_id TEXT,
  access_token TEXT, -- dev placeholder only
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  ad_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS meta_connections_customer_id_idx ON meta_connections(customer_id);
CREATE INDEX IF NOT EXISTS meta_connections_status_idx ON meta_connections(status);
