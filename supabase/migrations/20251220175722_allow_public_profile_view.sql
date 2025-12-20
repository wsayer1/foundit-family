/*
  # Allow public profile viewing

  1. Security Changes
    - Add policy to allow anonymous users to view profiles
    - This is needed so unauthenticated users can see item listings with profile info

  2. Notes
    - Only allows SELECT (read) access
    - Profile data (username, avatar) is not sensitive
*/

CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (true);