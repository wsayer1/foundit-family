/*
  # Fix handle_new_user Trigger Function
  
  The trigger was failing because:
  1. Missing explicit schema reference (public.profiles)
  2. Missing search_path configuration
  3. Need to handle potential null values in raw_user_meta_data
  
  ## Changes
  - Recreate function with explicit public schema reference
  - Set search_path to public for security
  - Add better null handling for user metadata
*/

-- Drop and recreate the function with proper configuration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_username text;
BEGIN
  -- Safely extract username from metadata or derive from email
  new_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Insert into public.profiles with explicit schema
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, new_username);
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure trigger is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
