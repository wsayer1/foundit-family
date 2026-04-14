/*
  # Fix Items Storage Policy for Confirmation Photos

  1. Changes
    - Add upload policy for confirmation photos which use path: confirmations/{item_id}/{user_id}/{timestamp}.jpg
    - The existing policy only allows uploads where first folder = user_id
    - Confirmation photos have 'confirmations' as first folder, so need a separate policy

  2. Security
    - Only authenticated users can upload confirmation photos
    - User ID must match the third folder segment for confirmation photos
*/

CREATE POLICY "Authenticated users can upload confirmation photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'items'
  AND (storage.foldername(name))[1] = 'confirmations'
  AND (storage.foldername(name))[3] = auth.uid()::text
);