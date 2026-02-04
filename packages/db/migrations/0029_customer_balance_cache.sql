-- Migration: 0029_customer_balance_cache
-- Cache of current balance; ledger is source of truth.

CREATE TABLE IF NOT EXISTS customer_balance_cache (
  customer_id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  balance_sek NUMERIC(20, 4) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
