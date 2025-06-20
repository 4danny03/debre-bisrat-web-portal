-- Comprehensive membership registration backend schema
-- This migration adds all missing columns for the membership registration system

-- Add comprehensive membership registration columns to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS family_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS contact_method TEXT DEFAULT 'email' CHECK (contact_method IN ('email', 'phone', 'both')),
ADD COLUMN IF NOT EXISTS newsletter_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS social_media_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_medical_info TEXT,
ADD COLUMN IF NOT EXISTS confirmation_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS confirmation_date DATE,
ADD COLUMN IF NOT EXISTS godparents TEXT,
ADD COLUMN IF NOT EXISTS spiritual_father TEXT,
ADD COLUMN IF NOT EXISTS baptism_location TEXT,
ADD COLUMN IF NOT EXISTS church_activities_interest TEXT[],
ADD COLUMN IF NOT EXISTS volunteer_availability TEXT,
ADD COLUMN IF NOT EXISTS leadership_experience TEXT,
ADD COLUMN IF NOT EXISTS church_school_interest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS youth_group_interest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS choir_interest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bible_study_interest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS prayer_group_interest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS community_service_interest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS membership_fee_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS membership_card_issued BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS membership_card_number TEXT,
ADD COLUMN IF NOT EXISTS membership_level TEXT DEFAULT 'regular' CHECK (membership_level IN ('regular', 'associate', 'honorary', 'life')),
ADD COLUMN IF NOT EXISTS voting_rights BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS committee_eligibility BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS leadership_eligibility BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS integration_status TEXT DEFAULT 'new' CHECK (integration_status IN ('new', 'in_progress', 'integrated', 'inactive')),
ADD COLUMN IF NOT EXISTS orientation_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS orientation_date DATE,
ADD COLUMN IF NOT EXISTS mentor_assigned TEXT,
ADD COLUMN IF NOT EXISTS last_contact_date DATE,
ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS registration_date DATE,
ADD COLUMN IF NOT EXISTS registration_notes TEXT,
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
ADD COLUMN IF NOT EXISTS special_needs TEXT,
ADD COLUMN IF NOT EXISTS transportation_needed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS household_income_range TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[],
ADD COLUMN IF NOT EXISTS membership_sponsor TEXT,
ADD COLUMN IF NOT EXISTS membership_sponsor_phone TEXT,
ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS membership_agreement_signed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS background_check_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS background_check_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS background_check_date DATE,
ADD COLUMN IF NOT EXISTS registration_ip_address INET,
ADD COLUMN IF NOT EXISTS registration_user_agent TEXT,
ADD COLUMN IF NOT EXISTS insurance_info TEXT;

-- Create membership statistics view
CREATE OR REPLACE VIEW membership_statistics AS
SELECT 
  COUNT(*) as total_members,
  COUNT(*) FILTER (WHERE membership_status = 'active') as active_members,
  COUNT(*) FILTER (WHERE membership_status = 'pending') as pending_members,
  COUNT(*) FILTER (WHERE membership_status = 'inactive') as inactive_members,
  COUNT(*) FILTER (WHERE membership_type = 'regular') as regular_members,
  COUNT(*) FILTER (WHERE membership_type = 'student') as student_members,
  COUNT(*) FILTER (WHERE membership_type = 'senior') as senior_members,
  COUNT(*) FILTER (WHERE membership_type = 'family') as family_members,
  COUNT(*) FILTER (WHERE membership_fee_paid = true) as paid_members,
  COUNT(*) FILTER (WHERE follow_up_required = true) as members_needing_followup,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) as new_members_this_month,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE)) as new_members_this_week
FROM members;

-- Create active members view for quick access
CREATE OR REPLACE VIEW active_members AS
SELECT 
  id,
  full_name,
  first_name,
  last_name,
  email,
  phone,
  membership_type,
  membership_status,
  registration_date,
  membership_date,
  last_renewal_date,
  next_renewal_date,
  membership_fee_paid,
  integration_status,
  preferred_language,
  emergency_contact_name,
  emergency_contact_phone,
  created_at,
  updated_at
FROM members
WHERE membership_status = 'active'
ORDER BY created_at DESC;

-- Create newsletter subscribers table if not exists
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT true,
  subscription_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled content table for content management
CREATE TABLE IF NOT EXISTS scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('event', 'sermon', 'announcement', 'newsletter')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled', 'failed')),
  published_at TIMESTAMP WITH TIME ZONE,
  recurring JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to site_settings for comprehensive configuration
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS admin_email TEXT,
ADD COLUMN IF NOT EXISTS from_email TEXT DEFAULT 'noreply@church.org',
ADD COLUMN IF NOT EXISTS enable_email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_newsletter BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_stripe BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT;

-- Add missing columns to email_campaigns for better tracking
ALTER TABLE email_campaigns 
ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_status ON members(membership_status);
CREATE INDEX IF NOT EXISTS idx_members_type ON members(membership_type);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);
CREATE INDEX IF NOT EXISTS idx_members_integration_status ON members(integration_status);
CREATE INDEX IF NOT EXISTS idx_members_follow_up ON members(follow_up_required);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(sermon_date);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_status ON scheduled_content(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_scheduled_for ON scheduled_content(scheduled_for);

-- Enable realtime for new tables
alter publication supabase_realtime add table newsletter_subscribers;
alter publication supabase_realtime add table scheduled_content;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_subscribers_updated_at ON email_subscribers;
CREATE TRIGGER update_email_subscribers_updated_at BEFORE UPDATE ON email_subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_content_updated_at ON scheduled_content;
CREATE TRIGGER update_scheduled_content_updated_at BEFORE UPDATE ON scheduled_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
