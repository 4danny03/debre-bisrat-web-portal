-- Fix members table schema to match the admin interface expectations
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS membership_type VARCHAR(50) DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_renewal_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_renewal_date TIMESTAMP WITH TIME ZONE;

-- Update existing records to have proper membership_type
UPDATE members 
SET membership_type = 'regular' 
WHERE membership_type IS NULL;

-- Update existing records to have join_date
UPDATE members 
SET join_date = created_at 
WHERE join_date IS NULL;

-- Ensure membership_status has proper default
ALTER TABLE members 
ALTER COLUMN membership_status SET DEFAULT 'pending';

-- Update null membership_status to pending
UPDATE members 
SET membership_status = 'pending' 
WHERE membership_status IS NULL;

-- Add constraints for data integrity
ALTER TABLE members 
ADD CONSTRAINT check_membership_type 
CHECK (membership_type IN ('regular', 'student', 'senior', 'family'));

ALTER TABLE members 
ADD CONSTRAINT check_membership_status 
CHECK (membership_status IN ('pending', 'active', 'inactive'));

-- Enable realtime for members table
ALTER PUBLICATION supabase_realtime ADD TABLE members;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_status ON members(membership_status);
CREATE INDEX IF NOT EXISTS idx_members_type ON members(membership_type);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
