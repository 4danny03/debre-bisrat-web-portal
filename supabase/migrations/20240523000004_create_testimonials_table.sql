-- Create testimonials table if it doesn't exist
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public read access" ON testimonials;
CREATE POLICY "Public read access"
  ON testimonials FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "Public insert access" ON testimonials;
CREATE POLICY "Public insert access"
  ON testimonials FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access" ON testimonials;
CREATE POLICY "Admin full access"
  ON testimonials FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Enable realtime
alter publication supabase_realtime add table testimonials;
