/*
# Create app_config table for storing Stripe keys

1. New Tables
- `app_config`
  - `key` (text, primary key) — config key name (e.g. 'stripe_secret_key')
  - `value` (text) — the secret value
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `app_config`.
- NO policies for anon or authenticated roles — only the service_role (which bypasses RLS) can read/write.
- This ensures the browser client can never access these secrets.

3. Notes
- Edge functions use the service role key to read from this table.
- Stores STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and SITE_URL.
*/

CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- No policies — only service_role can access (it bypasses RLS).
-- anon and authenticated get zero rows.
