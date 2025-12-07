/*
  # Add location enabled preference

  1. Changes
    - Add `location_enabled` column to profiles table
    - Boolean column with default value of true
    - Allows users to control whether location-based sorting is applied

  2. Notes
    - Defaults to true so existing users continue to see location-based results
    - Can be toggled in profile settings
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_enabled boolean DEFAULT true NOT NULL;
  END IF;
END $$;