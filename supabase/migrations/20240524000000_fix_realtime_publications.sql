-- This migration fixes the issue with tables already being members of the supabase_realtime publication
-- Instead of trying to add them again, we'll check if they're already members first

-- Function to check if a table is already a member of a publication
CREATE OR REPLACE FUNCTION is_table_in_publication(publication_name TEXT, table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = publication_name AND tablename = table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$ LANGUAGE plpgsql;

-- Now we can safely add tables to the publication only if they're not already members
DO $$
DECLARE
  tables TEXT[] := ARRAY['profiles', 'events', 'gallery', 'sermons', 'testimonials', 'prayer_requests', 'donations', 'members'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF NOT is_table_in_publication('supabase_realtime', t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
      RAISE NOTICE 'Added table % to publication supabase_realtime', t;
    ELSE
      RAISE NOTICE 'Table % is already a member of publication supabase_realtime', t;
    END IF;
  END LOOP;
END;
$$;

-- Clean up the function as we don't need it anymore
DROP FUNCTION IF EXISTS is_table_in_publication;
