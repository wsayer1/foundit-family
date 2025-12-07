/*
  # Add Item Delete Policy and Point Deduction

  This migration adds the ability for users to delete their own items
  and handles point deduction when items are deleted.

  ## Changes

  1. Security
     - Add DELETE policy for items table allowing users to delete their own items

  2. Functions
     - Create `handle_item_deleted` function to deduct points when item is deleted
     - Deducts 10 points from poster (reverses the posting bonus)
     - Decrements items_posted count

  3. Triggers
     - Add trigger to execute point deduction before item deletion
*/

-- Delete policy for items
CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle point deduction when item is deleted
CREATE OR REPLACE FUNCTION handle_item_deleted()
RETURNS trigger AS $$
BEGIN
  -- Deduct points from poster (reverse the posting bonus)
  UPDATE profiles 
  SET points = GREATEST(points - 10, 0), 
      items_posted = GREATEST(items_posted - 1, 0)
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for item deletion
DROP TRIGGER IF EXISTS on_item_deleted ON items;
CREATE TRIGGER on_item_deleted
  BEFORE DELETE ON items
  FOR EACH ROW EXECUTE FUNCTION handle_item_deleted();
