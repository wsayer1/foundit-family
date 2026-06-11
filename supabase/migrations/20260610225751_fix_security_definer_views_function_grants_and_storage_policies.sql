/*
  # Fix security linter findings

  1. Views
    - Drop `public_items_view` and `public_profiles_view` (SECURITY DEFINER, unused
      by the app and by any function)
    - Convert `public_profiles` to `security_invoker = true` so it runs with the
      caller's permissions instead of the owner's

  2. Profiles access for guests
    - The leaderboard and community stats pages are guest-accessible and read
      `public_profiles`. With the view now running as invoker, anon needs a SELECT
      policy on `profiles`, restricted via column-level grants to only the public
      columns (id, username, avatar_url, points, items_posted, items_claimed).
      Private columns (appearance_preference, location_enabled, created_at) remain
      unreadable by anon.

  3. Storage
    - Drop broad SELECT policies "Anyone can view avatars" and "Anyone can view
      item images" on storage.objects. Both buckets are public, so object access
      via public URLs does not use these policies; they only enabled client-side
      listing of all files. The app never lists or downloads via the storage API.

  4. Functions
    - Revoke EXECUTE from PUBLIC, anon, and authenticated on all SECURITY DEFINER
      functions. None are called by the client (no .rpc() usage). Trigger functions
      run as the function owner, and cron jobs (expire_old_items,
      cleanup_rate_limits) run as postgres, so nothing breaks.

  5. rate_limits
    - Revoke all direct table privileges from anon and authenticated; the table is
      only touched via SECURITY DEFINER functions and cron.
    - Add an explicit service_role policy so RLS no longer has zero policies.
*/

-- 1. Views
DROP VIEW IF EXISTS public.public_items_view;
DROP VIEW IF EXISTS public.public_profiles_view;
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- 2. Anon read access to public profile columns only
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT (id, username, avatar_url, points, items_posted, items_claimed)
  ON public.profiles TO anon;

DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;
CREATE POLICY "Anyone can view public profile fields" ON public.profiles
  FOR SELECT TO anon USING (true);

-- 3. Storage: remove listing policies (buckets are public; app uses public URLs only)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view item images" ON storage.objects;

-- 4. Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_old_items() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_community_stats() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_item_categories() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_items(integer, integer, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_leaderboard(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_stats() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_recent_activity(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_rank(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_confirmation_added() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_item_claimed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_item_deleted() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_item_posted() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.search_items(double precision, double precision, double precision, timestamptz, text, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_item_last_confirmed() FROM PUBLIC, anon, authenticated;

-- 5. rate_limits: explicit deny posture + service_role policy
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
  FOR ALL TO service_role USING (true) WITH CHECK (true);
