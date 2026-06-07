-- Add unique index on provider_deposit_id for safe webhook processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_invoices_provider_deposit_id
  ON event_invoices (provider_deposit_id)
  WHERE provider_deposit_id IS NOT NULL;

-- Add index on provider_reference for PesaPal IPN lookups
CREATE INDEX IF NOT EXISTS idx_event_invoices_provider_reference ON event_invoices (provider_reference);

-- Add index on authors(name) for faster ilike searches
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_authors_email ON authors USING gin (email gin_trgm_ops);

-- Add confirmed_at timestamp for payment reconciliation
ALTER TABLE event_invoices
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Enable pg_trgm extension for fuzzy search (requires superuser)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
