/*
  # Allow Anonymous Users to Read Items and Profiles

  This migration adds RLS policies to allow anonymous (unauthenticated) users 
  to read items and profiles, enabling a guest browsing experience.

  ## Changes
  1. Add SELECT policy on `items` for anonymous users
  2. Add SELECT policy on `profiles` for anonymous users (needed for joins)

  ## Security Notes
  - Anonymous users can only READ data, not modify it
  - This enables guest browsing before sign-up
  - All write operations still require authentication
*/

-- Allow anonymous users to read available items
CREATE POLICY "Anonymous users can view available items"
  ON items FOR SELECT
  TO anon
  USING (status = 'available');

-- Allow anonymous users to read profiles (needed for item joins)
CREATE POLICY "Anonymous users can view profiles"
  ON profiles FOR SELECT
  TO anon
  USING (true);
