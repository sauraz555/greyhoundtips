/*
  # Remove unused write privileges from the browser-facing roles

  1. Changes
     - Revoke INSERT/UPDATE/DELETE on meetings, races and runners from anon
       and authenticated. The app only reads these tables.
     - Revoke all write privileges on profiles from anon.
  2. Security
     - Defence in depth: RLS already denies these writes, but the grants are
       unused and would become exploitable the moment a permissive write
       policy were added. SELECT is untouched so the app keeps working.
*/

REVOKE INSERT, UPDATE, DELETE ON public.meetings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.races FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.runners FROM anon, authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon;
