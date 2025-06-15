-- Add missing columns to members table for comprehensive membership data
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT DEFAULT 'single',
ADD COLUMN IF NOT EXISTS spouse_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT,
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'english',
ADD COLUMN IF NOT EXISTS ministry_interests TEXT[],
ADD COLUMN IF NOT EXISTS volunteer_interests TEXT[],
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS how_did_you_hear TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS baptized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS baptism_date DATE,
ADD COLUMN IF NOT EXISTS previous_member BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS previous_church TEXT,
ADD COLUMN IF NOT EXISTS children JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS email_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_updates BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS photo_consent BOOLEAN DEFAULT false;

-- Enable realtime for members table
ALTER PUBLICATION supabase_realtime ADD TABLE members;

-- Update existing members table structure
COMMENT ON TABLE members IS 'Church members with comprehensive profile information';
COMMENT ON COLUMN members.ministry_interests IS 'Array of ministry interests';
COMMENT ON COLUMN members.volunteer_interests IS 'Array of volunteer interests';
COMMENT ON COLUMN members.children IS 'JSON array of children information';
