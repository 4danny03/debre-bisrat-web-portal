-- Remove admin_registration_codes from realtime publication if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'admin_registration_codes'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_registration_codes;
  END IF;
END
$$;

-- Drop the admin_registration_codes table if it exists
DROP TABLE IF EXISTS public.admin_registration_codes;

-- Drop the generate_admin_registration_code function if it exists
DROP FUNCTION IF EXISTS public.generate_admin_registration_code();
