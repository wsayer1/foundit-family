/*
  # Create Items Storage Bucket

  1. Storage Bucket
    - Creates 'items' bucket for item photos and confirmation photos
    - Sets file size limit to 5MB
    - Allows only image file types (jpeg, png, webp)

  2. Security Policies
    - Anyone can view item images (public read access for display)
    - Authenticated users can upload item images (using their user ID as folder prefix)
    - Authenticated users can update/delete only their own images

  3. Important Notes
    - Item photos stored as {user_id}/{timestamp}.jpg
    - Confirmation photos stored as confirmations/{item_id}/{user_id}/{timestamp}.jpg
    - Public read access required so images display in the feed
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'items',
  'items',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

CREATE POLICY "Anyone can view item images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'items');

CREATE POLICY "Authenticated users can upload item images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'items'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own item images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'items'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'items'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own item images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'items'
  AND (storage.foldername(name))[1] = auth.uid()::text
);