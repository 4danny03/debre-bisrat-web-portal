-- Create admin registration codes table
CREATE TABLE IF NOT EXISTS admin_registration_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Create function to generate admin registration code
CREATE OR REPLACE FUNCTION generate_admin_registration_code()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  result JSON;
BEGIN
  -- Generate a random 8-character code
  new_code := substr(md5(random()::text), 1, 8);
  
  -- Insert the code into the table
  INSERT INTO admin_registration_codes (code, email, expires_at)
  VALUES (new_code, 'pending@example.com', NOW() + INTERVAL '24 hours');
  
  -- Return the code
  result := json_build_object('code', new_code);
  RETURN result;
END;
$$;

-- Enable realtime for admin_registration_codes (only if not already added)
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'admin_registration_codes'
  ) THEN
    alter publication supabase_realtime add table admin_registration_codes;
  END IF;
END
$;
