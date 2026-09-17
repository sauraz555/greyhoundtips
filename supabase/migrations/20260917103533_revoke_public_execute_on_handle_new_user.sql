/*
  # Remove the PUBLIC execute grant on handle_new_user

  1. Changes
     - Revoke ALL on public.handle_new_user() from PUBLIC. An earlier
       migration revoked anon/authenticated but the PUBLIC grant kept the
       SECURITY DEFINER function callable via /rest/v1/rpc.
  2. Security
     - postgres and service_role keep EXECUTE, which is what the
       auth.users trigger needs.
*/

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
