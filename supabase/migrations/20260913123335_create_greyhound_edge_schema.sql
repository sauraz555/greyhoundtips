/*
# Greyhound Edge — Core Schema

## Overview
Creates the tables required for the Greyhound Edge dashboard: meetings,
races, runners, and user profiles. RLS is enabled on every table.

## Tables

### meetings
- `id` (uuid, PK) — unique meeting identifier
- `date` (date) — the race date
- `venue_name` (text) — human-readable venue name (e.g. "Wentworth Park")
- `venue_code` (text) — short venue code (e.g. "WPK")
- `state` (text) — Australian state (NSW, VIC, QLD, etc.)
- `created_at` (timestamptz) — row creation timestamp

### races
- `id` (uuid, PK) — unique race identifier
- `meeting_id` (uuid, FK → meetings.id ON DELETE CASCADE) — parent meeting
- `race_number` (int) — race number within the meeting
- `name` (text) — race name/title
- `distance_m` (int) — race distance in metres
- `grade` (text) — race grade (e.g. "Grade 5", "Maiden")
- `start_time` (timestamptz) — scheduled post time
- `n_runners` (int) — number of runners
- `confidence` (text) — model confidence level: "High", "Medium", "Low"
- `false_fav_flag` (bool) — whether a false favourite is flagged
- `false_fav_reason` (text) — explanation for the false favourite flag
- `probable_winner_box` (int) — predicted winner's box number
- `probable_winner_name` (text) — predicted winner's name
- `probable_winner_win_pct` (numeric) — predicted winner's win probability (0–100)
- `created_at` (timestamptz) — row creation timestamp

### runners
- `id` (uuid, PK) — unique runner identifier
- `race_id` (uuid, FK → races.id ON DELETE CASCADE) — parent race
- `box` (int) — box (lane) number
- `name` (text) — greyhound name
- `trainer` (text) — trainer name
- `price` (numeric) — betting price/odds
- `win_pct` (numeric) — model win probability (0–100)
- `top4_pct` (numeric) — model top-4 probability (0–100)
- `is_false_fav` (bool) — whether this runner is the flagged false favourite

### profiles
- `id` (uuid, PK, FK → auth.users.id ON DELETE CASCADE) — linked auth user
- `email` (text) — user email (denormalised for convenience)
- `age_confirmed` (bool) — whether the user confirmed 18+ at signup
- `created_at` (timestamptz) — row creation timestamp

## Security (RLS)

- **meetings**: SELECT public to authenticated users (read-only). No
  client-side writes — only the service role writes (backend process).
- **races**: SELECT public to authenticated users (read-only). Same.
- **runners**: SELECT public to authenticated users (read-only). Same.
- **profiles**: SELECT and UPDATE restricted to the owning user via
  `auth.uid() = id`. No client-side INSERT (created via trigger or backend).

## Notes
1. No INSERT/UPDATE/DELETE policies on meetings/races/runners for
   authenticated or anon roles — writes are done with the service role key
   by a separate backend process, which bypasses RLS.
2. profiles rows are created by a trigger when a new auth user signs up,
   or by the backend. The frontend only reads/updates its own profile.
3. An index on races.start_time supports the dashboard's "today's races"
   ordering query.
4. An index on races.meeting_id and runners.race_id speeds the nested
   joins the dashboard uses.
*/

-- ── meetings ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date NOT NULL,
  venue_name  text NOT NULL,
  venue_code  text NOT NULL,
  state       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_meetings" ON meetings;
CREATE POLICY "authenticated_read_meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (true);

-- ── races ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS races (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id                uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  race_number               int NOT NULL,
  name                      text NOT NULL,
  distance_m                int NOT NULL,
  grade                     text NOT NULL,
  start_time                timestamptz NOT NULL,
  n_runners                 int NOT NULL,
  confidence                text,
  false_fav_flag            bool NOT NULL DEFAULT false,
  false_fav_reason          text,
  probable_winner_box       int,
  probable_winner_name      text,
  probable_winner_win_pct   numeric,
  created_at                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE races ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_races" ON races;
CREATE POLICY "authenticated_read_races"
  ON races FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_races_start_time ON races (start_time);
CREATE INDEX IF NOT EXISTS idx_races_meeting_id  ON races (meeting_id);

-- ── runners ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS runners (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id       uuid NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  box           int NOT NULL,
  name          text NOT NULL,
  trainer       text,
  price         numeric,
  win_pct       numeric,
  top4_pct      numeric,
  is_false_fav  bool NOT NULL DEFAULT false
);

ALTER TABLE runners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_runners" ON runners;
CREATE POLICY "authenticated_read_runners"
  ON runners FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_runners_race_id ON runners (race_id);

-- ── profiles ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  age_confirmed bool NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Trigger: auto-create profile on signup ────────────────────────
-- When a new auth.users row is created, insert a matching profiles row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, age_confirmed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'age_confirmed', 'false')::bool
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
