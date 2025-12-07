/*
  # Street Finds - Complete Database Schema
  
  This migration creates the complete schema for the Street Finds application,
  which allows users to discover and share curbside items.
  
  ## Tables Created
  
  1. `profiles` - User profiles with points and stats
     - `id` (uuid, primary key) - Links to auth.users
     - `username` (text) - Display name
     - `avatar_url` (text) - Profile picture URL
     - `points` (integer) - Total points earned
     - `items_posted` (integer) - Count of items posted
     - `items_claimed` (integer) - Count of items claimed
     - `created_at` (timestamptz) - When profile was created
  
  2. `items` - Posted curbside items
     - `id` (uuid, primary key) - Unique item identifier
     - `user_id` (uuid) - Who posted the item
     - `image_url` (text) - URL to the item photo
     - `description` (text) - AI-generated or user-edited description
     - `latitude` (double precision) - Item location
     - `longitude` (double precision) - Item location
     - `status` (text) - 'available', 'claimed', or 'expired'
     - `still_there_count` (integer) - Confirmations item still exists
     - `created_at` (timestamptz) - When item was posted
     - `claimed_at` (timestamptz) - When item was claimed
     - `claimed_by` (uuid) - Who claimed the item
  
  3. `confirmations` - "Still there" confirmations
     - `id` (uuid, primary key) - Unique confirmation ID
     - `item_id` (uuid) - Which item was confirmed
     - `user_id` (uuid) - Who confirmed
     - `created_at` (timestamptz) - When confirmed
  
  ## Security
  - RLS enabled on all tables
  - Users can only modify their own data
  - Public read access for items (discovery feature)
  
  ## Points System
  - Post an item: +10 points
  - Item gets claimed: +5 bonus points to poster
  - Claim an item: +5 points
  - Confirm "still there": +2 points
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_url text,
  points integer DEFAULT 0 NOT NULL,
  items_posted integer DEFAULT 0 NOT NULL,
  items_claimed integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  description text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  status text DEFAULT 'available' NOT NULL CHECK (status IN ('available', 'claimed', 'expired')),
  still_there_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  claimed_at timestamptz,
  claimed_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create confirmations table
CREATE TABLE IF NOT EXISTS confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(item_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS items_status_idx ON items(status);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS items_location_idx ON items(latitude, longitude);
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS confirmations_item_id_idx ON confirmations(item_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Items policies
CREATE POLICY "Anyone can view available items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can claim items"
  ON items FOR UPDATE
  TO authenticated
  USING (status = 'available')
  WITH CHECK (
    (claimed_by = auth.uid() AND status = 'claimed')
    OR (auth.uid() = user_id)
  );

-- Confirmations policies
CREATE POLICY "Users can view all confirmations"
  ON confirmations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own confirmations"
  ON confirmations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own confirmations"
  ON confirmations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to award points when posting an item
CREATE OR REPLACE FUNCTION handle_item_posted()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles 
  SET points = points + 10, items_posted = items_posted + 1 
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for item posting points
DROP TRIGGER IF EXISTS on_item_posted ON items;
CREATE TRIGGER on_item_posted
  AFTER INSERT ON items
  FOR EACH ROW EXECUTE FUNCTION handle_item_posted();

-- Function to handle item claims
CREATE OR REPLACE FUNCTION handle_item_claimed()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'available' AND NEW.status = 'claimed' AND NEW.claimed_by IS NOT NULL THEN
    -- Award points to claimer
    UPDATE profiles 
    SET points = points + 5, items_claimed = items_claimed + 1 
    WHERE id = NEW.claimed_by;
    
    -- Award bonus points to poster
    UPDATE profiles 
    SET points = points + 5 
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for item claims
DROP TRIGGER IF EXISTS on_item_claimed ON items;
CREATE TRIGGER on_item_claimed
  AFTER UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION handle_item_claimed();

-- Function to handle confirmations
CREATE OR REPLACE FUNCTION handle_confirmation_added()
RETURNS trigger AS $$
BEGIN
  -- Update item's still_there_count
  UPDATE items 
  SET still_there_count = still_there_count + 1 
  WHERE id = NEW.item_id;
  
  -- Award points to confirmer
  UPDATE profiles 
  SET points = points + 2 
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for confirmations
DROP TRIGGER IF EXISTS on_confirmation_added ON confirmations;
CREATE TRIGGER on_confirmation_added
  AFTER INSERT ON confirmations
  FOR EACH ROW EXECUTE FUNCTION handle_confirmation_added();
