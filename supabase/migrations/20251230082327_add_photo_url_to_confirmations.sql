/*
  # Add photo_url to confirmations table

  1. Changes
    - Add `photo_url` column to confirmations table to store verification photos

  2. Notes
    - Column is optional (nullable) to maintain backward compatibility
    - Existing confirmations without photos will continue to work
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'confirmations' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE confirmations ADD COLUMN photo_url text;
  END IF;
END $$;
