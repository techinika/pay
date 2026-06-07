-- Add unique index on provider_deposit_id for safe webhook processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_invoices_provider_deposit_id
  ON event_invoices (provider_deposit_id)
  WHERE provider_deposit_id IS NOT NULL;

-- Add index on provider_reference for PesaPal IPN lookups
CREATE INDEX IF NOT EXISTS idx_event_invoices_provider_reference ON event_invoices (provider_reference);

-- Add confirmed_at timestamp for payment reconciliation
ALTER TABLE event_invoices
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Note: gin_trgm_ops indexes on authors(name/email) were considered for ILIKE
-- search acceleration but require the pg_trgm extension (CREATE EXTENSION
-- requires superuser on some managed Postgres instances). The ILIKE queries
-- in invoice-search.ts will still work, just without trigram index support.
