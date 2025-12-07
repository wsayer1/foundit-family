/*
  # Add Appearance Preference to Profiles

  1. Changes
    - Add `appearance_preference` column to `profiles` table
    - Valid values: 'light', 'dark', 'system'
    - Default value: 'system' (follows device preference)

  2. Notes
    - This allows users to persist their theme preference across sessions
    - The 'system' option will automatically follow the user's device settings
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'appearance_preference'
  ) THEN
    ALTER TABLE profiles ADD COLUMN appearance_preference text DEFAULT 'system'
      CHECK (appearance_preference IN ('light', 'dark', 'system'));
  END IF;
END $$;