-- Migration: 0028_customer_ledger_entries
-- Ledger: source of truth for credits (topup, consumption, adjustment).

CREATE TABLE IF NOT EXISTS customer_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('topup', 'consumption', 'adjustment')),
  amount_sek NUMERIC(20, 4) NOT NULL,
  ref_type TEXT NULL,
  ref_id TEXT NULL,
  period_date DATE NULL,
  meta_campaign_id TEXT NULL,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_ledger_entries_customer_created_idx ON customer_ledger_entries(customer_id, created_at DESC);

-- Partial unique index for idempotency: one consumption per (customer, period_date, meta_campaign_id)
-- Use coalesce so NULL campaign_id (time_based) is one bucket
CREATE UNIQUE INDEX IF NOT EXISTS customer_ledger_entries_consumption_idempotent_idx
  ON customer_ledger_entries(customer_id, period_date, COALESCE(meta_campaign_id, ''::text))
  WHERE type = 'consumption';
