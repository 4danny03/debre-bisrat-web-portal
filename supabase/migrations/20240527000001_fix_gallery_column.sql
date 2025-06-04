-- Check if the gallery table has 'url' column and rename it to 'image_url'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'gallery' AND column_name = 'url') THEN
        ALTER TABLE gallery RENAME COLUMN url TO image_url;
    END IF;
END $$;

-- Ensure image_url column exists
ALTER TABLE gallery 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Enable realtime for gallery (only if not already added)
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'gallery'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE gallery;
    END IF;
END $;
