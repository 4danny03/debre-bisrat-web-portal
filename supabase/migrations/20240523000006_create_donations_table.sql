-- Create donations table if it doesn't exist
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10, 2) NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  payment_method TEXT,
  payment_status TEXT,
  payment_id TEXT,
  purpose TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admin full access" ON donations;
CREATE POLICY "Admin full access"
  ON donations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Enable realtime
alter publication supabase_realtime add table donations;
