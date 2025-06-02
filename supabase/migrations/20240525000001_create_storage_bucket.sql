-- Create a storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload images
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Set up storage policy to allow public read access to images
DROP POLICY IF EXISTS "Allow public read access to images" ON storage.objects;
CREATE POLICY "Allow public read access to images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Set up storage policy to allow authenticated users to update their own images
DROP POLICY IF EXISTS "Allow authenticated users to update their own images" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Set up storage policy to allow authenticated users to delete their own images
DROP POLICY IF EXISTS "Allow authenticated users to delete their own images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');
