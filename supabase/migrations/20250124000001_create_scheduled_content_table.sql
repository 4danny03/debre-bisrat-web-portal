-- Create scheduled_content table for content scheduling
CREATE TABLE IF NOT EXISTS scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('event', 'sermon', 'email', 'post')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  recurring JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_scheduled_content_scheduled_for ON scheduled_content(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_status ON scheduled_content(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_type ON scheduled_content(type);

-- Enable RLS
ALTER TABLE scheduled_content ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admin can manage scheduled content" ON scheduled_content;
CREATE POLICY "Admin can manage scheduled content"
ON scheduled_content FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE scheduled_content;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scheduled_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_scheduled_content_updated_at_trigger ON scheduled_content;
CREATE TRIGGER update_scheduled_content_updated_at_trigger
  BEFORE UPDATE ON scheduled_content
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_content_updated_at();
