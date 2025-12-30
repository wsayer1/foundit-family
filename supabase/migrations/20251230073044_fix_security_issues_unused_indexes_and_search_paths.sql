/*
  # Fix Security Issues - Unused Indexes and Function Search Paths

  1. Dropped Indexes
    - `items_location_idx` - unused spatial index on items table
    - `confirmations_item_id_idx` - unused index on confirmations.item_id
    - `confirmations_user_id_idx` - unused index on confirmations.user_id
    - `items_claimed_by_idx` - unused index on items.claimed_by
    - `items_category_idx` - unused index on items.category

  2. Security Fixes
    - Set immutable search_path on `update_item_last_confirmed` function
    - Set immutable search_path on `expire_old_items` function
    
  3. Notes
    - Auth DB Connection Strategy requires Supabase dashboard configuration
    - Indexes may be recreated later if query patterns change
*/

-- Drop unused indexes
DROP INDEX IF EXISTS public.items_location_idx;
DROP INDEX IF EXISTS public.confirmations_item_id_idx;
DROP INDEX IF EXISTS public.confirmations_user_id_idx;
DROP INDEX IF EXISTS public.items_claimed_by_idx;
DROP INDEX IF EXISTS public.items_category_idx;

-- Fix function search paths by recreating with secure search_path
-- First, get the current function definitions and recreate with search_path set

-- Recreate update_item_last_confirmed with secure search_path
CREATE OR REPLACE FUNCTION public.update_item_last_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.items
  SET last_confirmed_at = NEW.created_at
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$;

-- Recreate expire_old_items with secure search_path
CREATE OR REPLACE FUNCTION public.expire_old_items()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.items
  SET status = 'expired'
  WHERE status = 'available'
    AND last_confirmed_at < NOW() - INTERVAL '48 hours';
END;
$$;
