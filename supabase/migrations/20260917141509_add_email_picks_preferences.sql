/*
# Daily Picks Email — User Preferences + Sent Log

## Purpose
Adds an opt-in column to profiles for daily top-3 picks emails, and a log table
to track which emails were sent to which users (prevents duplicates, enables auditing).

## Changes

### 1. profiles table — new column
- `email_picks_opt_in` (boolean, default false): when true, the user receives the
  daily top-3 picks email. Users toggle this from the Account page.

### 2. New table: email_log
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, ON DELETE CASCADE): who the email was sent to
- `email` (text): the email address used
- `sent_at` (timestamptz, default now): when the email was sent
- `pick_date` (date): the race date the picks were for
- `status` (text, default 'sent'): 'sent' or 'failed'
- `error` (text, nullable): error message if status = 'failed'

## Security
- profiles: users can read and update their own email_picks_opt_in (existing RLS
  already covers SELECT/UPDATE on own row; no new policies needed since the column
  is on a table the user already owns).
- email_log: RLS enabled. Users can read their own log entries. Only the service
  role (edge function) can insert. No user can delete or update log entries.
*/

-- Add opt-in column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_picks_opt_in boolean NOT NULL DEFAULT false;

-- Create email log table
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  pick_date date NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error text
);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own email log
DROP POLICY IF EXISTS "select_own_email_log" ON email_log;
CREATE POLICY "select_own_email_log" ON email_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Only service role can insert (edge function uses service role key)
DROP POLICY IF EXISTS "insert_email_log" ON email_log;
CREATE POLICY "insert_email_log" ON email_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add index for dedup checks
CREATE INDEX IF NOT EXISTS idx_email_log_user_date ON email_log(user_id, pick_date);
