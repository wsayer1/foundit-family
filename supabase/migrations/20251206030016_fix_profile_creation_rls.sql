/*
  # Fix Profile Creation RLS Policy
  
  The `handle_new_user()` trigger function was failing because RLS policies 
  blocked the INSERT operation during user signup.
  
  ## Changes
  
  1. Add policy to allow service_role to insert profiles
     - This enables the SECURITY DEFINER trigger function to bypass RLS
  
  2. Add policy to allow postgres role (for triggers)
     - Ensures database triggers can create profiles automatically
*/

-- Allow service_role to insert profiles (needed for trigger function)
CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Also grant explicit permissions to ensure trigger works
GRANT ALL ON profiles TO service_role;
GRANT ALL ON profiles TO postgres;
