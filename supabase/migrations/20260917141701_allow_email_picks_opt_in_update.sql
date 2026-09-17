/*
# Allow users to update email_picks_opt_in on their profile

## Purpose
The profiles table currently only allows the `authenticated` role to update the
`age_confirmed` column. We need to also allow updating `email_picks_opt_in` so
users can toggle the daily picks email opt-in from the Account page.

## Changes
- Grant UPDATE on `email_picks_opt_in` column to the `authenticated` role.
- The existing `update_own_profile` RLS policy already allows users to update
  their own row (USING + WITH CHECK both check `auth.uid() = id`), so no policy
  change is needed — only the column-level privilege.
*/

GRANT UPDATE (email_picks_opt_in) ON profiles TO authenticated;
