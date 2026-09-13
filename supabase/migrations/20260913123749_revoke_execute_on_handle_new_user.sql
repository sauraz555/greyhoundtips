/*
# Revoke public execute on handle_new_user trigger function

The `handle_new_user()` function is a SECURITY DEFINER trigger that auto-creates
a profile row when a new auth user signs up. It should only be called by the
database trigger on `auth.users`, never directly via the REST API.

This migration revokes EXECUTE from anon and authenticated roles so the function
cannot be called via `/rest/v1/rpc/handle_new_user`.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
