-- Create sermons table if it doesn't exist
CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  scripture_reference TEXT,
  audio_url TEXT,
  preacher TEXT,
  sermon_date DATE NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public read access" ON sermons;
CREATE POLICY "Public read access"
  ON sermons FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin full access" ON sermons;
CREATE POLICY "Admin full access"
  ON sermons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Enable realtime
alter publication supabase_realtime add table sermons;
