/*
  # Restrict which profile columns a user can write

  1. Changes
     - Revoke blanket UPDATE on public.profiles from anon and authenticated.
     - Re-grant UPDATE only on age_confirmed to authenticated, the single
       column a signed-in user legitimately controls.
  2. Security
     - Prevents a signed-in user from rewriting profiles.email (identity
       spoofing) or created_at via the data API, while leaving the
       row-level update_own_profile policy intact.
*/

REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM anon;

GRANT UPDATE (age_confirmed) ON public.profiles TO authenticated;
