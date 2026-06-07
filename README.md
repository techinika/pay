# Pay Techinika

Invoice payment portal supporting **pawaPay** (mobile money) and **PesaPal** (card payments).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill required values:
   - `NEXT_PUBLIC_PROJECT_URL` — Supabase project URL
   - `NEXT_PUBLIC_API_KEY` — Supabase anon key
   - `SUPABASE_SERVICE_KEY` — Supabase service role key
   - `PAWAPAY_ENV` — `sandbox` or `production`
   - `PAWAPAY_API_TOKEN` — pawaPay API token
   - `PAWAPAY_WEBHOOK_SECRET` — pawaPay webhook secret
   - `PESAPAL_ENV` — `sandbox` or `production`
   - `PESAPAL_CONSUMER_KEY` — PesaPal consumer key
   - `PESAPAL_CONSUMER_SECRET` — PesaPal consumer secret
   - `NEXT_PUBLIC_APP_URL` — Application base URL

3. Run migrations:
   ```bash
   supabase db push
   ```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Project Structure

- `lib/pawapay/` — pawaPay API client (deposits, payouts, refunds, provider lookup)
- `lib/pesapal/` — PesaPal API client (orders, IPN registration)
- `lib/services/` — Business logic (invoice search)
- `app/page.tsx` — Search interface
- `app/[id]/` — Invoice detail and payment page
- `app/api/` — API routes for pawaPay, PesaPal, and invoice lookups
- `app/components/` — Shared UI components
