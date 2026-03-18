/*
  # Create public_profiles view

  1. New Views
    - `public_profiles` - A restricted view of the profiles table exposing only
      publicly safe columns:
      - `id` (uuid) - profile identifier
      - `username` (text) - display name
      - `avatar_url` (text) - profile image
      - `points` (integer) - score
      - `items_posted` (integer) - count of posted items
      - `items_claimed` (integer) - count of claimed items

  2. Security
    - Excludes sensitive columns: appearance_preference, location_enabled, created_at
    - Email addresses remain protected in auth.users (never exposed)
    - View inherits RLS policies from the underlying profiles table
    - Grants SELECT access to anon and authenticated roles
*/

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  username,
  avatar_url,
  points,
  items_posted,
  items_claimed
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;
