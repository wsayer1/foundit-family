/*
  # Add Freshness Tracking System
  
  1. Changes to items table
    - Add `last_confirmed_at` column (timestamptz) to track when item was last verified as "still there"
    - This column is used alongside `created_at` to calculate freshness
    - Whichever is more recent determines the 7-day expiry window
  
  2. New trigger for confirmation updates
    - When a confirmation is added, update `last_confirmed_at` on the item
    - This "refreshes" the item's freshness timer
  
  3. Auto-expiry scheduled function
    - Items expire after 7 days from either created_at or last_confirmed_at (whichever is later)
    - Uses pg_cron to run daily at midnight UTC
  
  4. Security
    - No RLS changes needed, column inherits existing policies
*/

-- Add last_confirmed_at column to items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'last_confirmed_at'
  ) THEN
    ALTER TABLE items ADD COLUMN last_confirmed_at timestamptz;
  END IF;
END $$;

-- Create function to update last_confirmed_at when confirmation is added
CREATE OR REPLACE FUNCTION update_item_last_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE items
  SET last_confirmed_at = NOW()
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on confirmation insert
DROP TRIGGER IF EXISTS on_confirmation_update_item ON confirmations;
CREATE TRIGGER on_confirmation_update_item
  AFTER INSERT ON confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_item_last_confirmed();

-- Create function to expire old items
CREATE OR REPLACE FUNCTION expire_old_items()
RETURNS void AS $$
BEGIN
  UPDATE items
  SET status = 'expired'
  WHERE status = 'available'
    AND COALESCE(last_confirmed_at, created_at) < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the expire function to run daily at midnight UTC
-- First, remove any existing schedule for this job
SELECT cron.unschedule('expire-old-items')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'expire-old-items'
);

-- Schedule new job
SELECT cron.schedule(
  'expire-old-items',
  '0 0 * * *',
  $$SELECT expire_old_items()$$
);

-- Run once immediately to clean up any existing old items
SELECT expire_old_items();