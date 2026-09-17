/*
# Create subscriptions table

1. New Tables
- `subscriptions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, NOT NULL, defaults to auth.uid())
  - `stripe_customer_id` (text, Stripe customer ID)
  - `stripe_subscription_id` (text, Stripe subscription ID)
  - `status` (text, subscription status: 'trialing', 'active', 'past_due', 'canceled', 'incomplete')
  - `trial_end` (timestamptz, when the 3-day trial ends)
  - `current_period_end` (timestamptz, when the current billing period ends)
  - `cancel_at_period_end` (boolean, whether subscription cancels at period end)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `subscriptions`.
- Owner-scoped CRUD: each authenticated user can only read their own subscription row.
- INSERT/UPDATE/DELETE restricted to service_role only (edge functions manage rows, not the client).
  The client only reads its own row; all writes go through edge functions using the service role key.

3. Notes
- The webhook edge function (service_role) inserts and updates rows here.
- The checkout edge function (service_role) creates the Stripe checkout session and records the customer.
- The portal edge function (service_role) creates a billing portal session.
- The frontend reads subscription status to gate access.
*/

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'trialing',
  trial_end timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscriptions;
CREATE POLICY "select_own_subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No client INSERT/UPDATE/DELETE policies — only the service_role (edge functions) can write.
-- The service_role bypasses RLS entirely.

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
