/*
  # Fix Remaining Security and Performance Issues

  This migration addresses security issues flagged by Supabase:

  ## Changes Made

  1. **RLS Policy Optimization (DELETE)**
     - Updated "Users can delete own items" policy to use `(select auth.uid())`
       instead of `auth.uid()` to prevent re-evaluation for each row

  2. **Function Search Path Security**
     - Fixed `handle_item_deleted` function to use immutable search_path
     - Prevents potential search_path manipulation attacks

  3. **Consolidated UPDATE Policies on Items**
     - Merged "Users can update own items" and "Anyone can claim items" into
       a single policy to eliminate multiple permissive policies warning
     - New policy allows:
       - Owners to update any field on their own items
       - Any authenticated user to claim available items (set claimed_by and status)

  ## Notes on Unused Indexes
  - The flagged indexes (items_created_at_idx, items_location_idx, etc.) are kept
    intentionally as they will be used when data volume grows:
    - items_created_at_idx: Used for ORDER BY created_at queries
    - items_location_idx: Used for geographic queries
    - confirmations_item_id_idx: Used for item confirmation lookups
    - confirmations_user_id_idx: Used for user confirmation lookups
    - items_claimed_by_idx: Used for foreign key performance
    - items_category_idx: Used for category filtering
  - PostgreSQL may not use indexes with low data volumes, this is expected behavior
*/

-- Fix DELETE policy to use optimized auth.uid() call
DROP POLICY IF EXISTS "Users can delete own items" ON items;
CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Fix handle_item_deleted function with immutable search_path
CREATE OR REPLACE FUNCTION handle_item_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles 
  SET points = GREATEST(points - 10, 0), 
      items_posted = GREATEST(items_posted - 1, 0)
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$;

-- Consolidate UPDATE policies on items table into a single policy
-- Drop both existing UPDATE policies
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Anyone can claim items" ON items;

-- Create single consolidated UPDATE policy
CREATE POLICY "Users can update items"
  ON items FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR (status = 'available')
  )
  WITH CHECK (
    (select auth.uid()) = user_id
    OR (
      status = 'claimed' 
      AND claimed_by = (select auth.uid())
    )
  );