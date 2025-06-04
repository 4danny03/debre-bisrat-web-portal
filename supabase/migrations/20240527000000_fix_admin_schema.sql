-- Fix members table schema
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS membership_type VARCHAR(50) DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS membership_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing members table to match expected schema
UPDATE members SET 
  membership_type = COALESCE(membership_type, 'regular'),
  membership_status = COALESCE(membership_status, 'active'),
  join_date = COALESCE(join_date, created_at)
WHERE membership_type IS NULL OR membership_status IS NULL OR join_date IS NULL;

-- Fix gallery table schema (handled in separate migration)
-- ALTER TABLE gallery RENAME COLUMN url TO image_url;

-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  church_name VARCHAR(255),
  church_address TEXT,
  phone_number VARCHAR(50),
  email VARCHAR(255),
  enable_donations BOOLEAN DEFAULT true,
  enable_membership BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if none exist
INSERT INTO site_settings (id, church_name, church_address, phone_number, email, enable_donations, enable_membership, maintenance_mode)
SELECT 1, 'St. Gabriel Ethiopian Orthodox Church', '', '', '', true, true, false
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE id = 1);

-- Ensure profiles table has proper structure
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Enable realtime for all admin tables (only if not already added)
DO $
BEGIN
    -- Add members table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'members'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE members;
    END IF;
    
    -- Add site_settings table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'site_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;
    END IF;
    
    -- Add profiles table to realtime
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;
END $;
