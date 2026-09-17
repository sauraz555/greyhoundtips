/*
  # Allow a user to delete their own profile row

  1. Changes
     - Add a DELETE policy on public.profiles scoped to auth.uid() = id.
  2. Security
     - Account deletion in the app previously deleted zero rows under RLS
       and reported success, leaving personal data in place. Scoped to the
       caller's own row only.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'delete_own_profile'
  ) THEN
    CREATE POLICY "delete_own_profile" ON public.profiles FOR DELETE
      TO authenticated USING (auth.uid() = id);
  END IF;
END $$;
