-- Create prayer_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  request TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public read access" ON prayer_requests;
CREATE POLICY "Public read access"
  ON prayer_requests FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Public insert access" ON prayer_requests;
CREATE POLICY "Public insert access"
  ON prayer_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON prayer_requests;
CREATE POLICY "Admin full access"
  ON prayer_requests FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Enable realtime
alter publication supabase_realtime add table prayer_requests;
