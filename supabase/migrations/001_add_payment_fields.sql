-- Add payment-related columns to event_invoices
ALTER TABLE event_invoices
  ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('mobile_money', 'card')),
  ADD COLUMN IF NOT EXISTS payment_provider TEXT CHECK (payment_provider IN ('pawapay', 'pesapal')),
  ADD COLUMN IF NOT EXISTS provider_deposit_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_payout_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_refund_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_reference TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS payment_metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for provider IDs for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_invoices_provider_deposit_id ON event_invoices (provider_deposit_id);
CREATE INDEX IF NOT EXISTS idx_event_invoices_phone_number ON event_invoices (phone_number);
