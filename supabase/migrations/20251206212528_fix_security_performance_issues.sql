/*
  # Fix Security and Performance Issues

  This migration addresses several security and performance concerns identified
  in the database schema.

  ## Changes Made

  1. **Foreign Key Indexes**
     - Added index on `confirmations.user_id` for the `confirmations_user_id_fkey` foreign key
     - Added index on `items.claimed_by` for the `items_claimed_by_fkey` foreign key

  2. **RLS Policy Optimization**
     Updated all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
     to prevent re-evaluation for each row, improving query performance at scale.
     
     Affected policies:
     - profiles: "Users can insert own profile", "Users can update own profile"
     - items: "Users can insert own items", "Users can update own items", "Anyone can claim items"
     - confirmations: "Users can insert own confirmations", "Users can delete own confirmations"

  3. **Function Search Path Security**
     Added explicit `search_path = ''` to trigger functions to prevent
     search_path manipulation attacks:
     - handle_confirmation_added
     - handle_item_posted
     - handle_item_claimed
     - handle_new_user

  ## Security Notes
  - Function search paths are now immutable, preventing potential security issues
  - RLS policies are now optimized for better performance
  - Foreign key indexes improve JOIN performance
*/

-- Add missing indexes on foreign keys
CREATE INDEX IF NOT EXISTS confirmations_user_id_idx ON confirmations(user_id);
CREATE INDEX IF NOT EXISTS items_claimed_by_idx ON items(claimed_by);

-- Drop and recreate RLS policies with optimized auth.uid() calls
-- Profiles policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Items policies
DROP POLICY IF EXISTS "Users can insert own items" ON items;
CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own items" ON items;
CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Anyone can claim items" ON items;
CREATE POLICY "Anyone can claim items"
  ON items FOR UPDATE
  TO authenticated
  USING (status = 'available')
  WITH CHECK (
    (claimed_by = (select auth.uid()) AND status = 'claimed')
    OR ((select auth.uid()) = user_id)
  );

-- Confirmations policies
DROP POLICY IF EXISTS "Users can insert own confirmations" ON confirmations;
CREATE POLICY "Users can insert own confirmations"
  ON confirmations FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own confirmations" ON confirmations;
CREATE POLICY "Users can delete own confirmations"
  ON confirmations FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Fix function search paths
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_item_posted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles 
  SET points = points + 10, items_posted = items_posted + 1 
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_item_claimed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.status = 'available' AND NEW.status = 'claimed' AND NEW.claimed_by IS NOT NULL THEN
    UPDATE public.profiles 
    SET points = points + 5, items_claimed = items_claimed + 1 
    WHERE id = NEW.claimed_by;
    
    UPDATE public.profiles 
    SET points = points + 5 
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_confirmation_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.items 
  SET still_there_count = still_there_count + 1 
  WHERE id = NEW.item_id;
  
  UPDATE public.profiles 
  SET points = points + 2 
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;