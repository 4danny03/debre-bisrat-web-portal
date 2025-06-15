-- Comprehensive database schema fix for all tables
-- This migration ensures all required tables exist with correct schemas

-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  church_name TEXT DEFAULT 'St. Gabriel Ethiopian Orthodox Church',
  church_address TEXT,
  phone_number TEXT,
  email TEXT,
  enable_donations BOOLEAN DEFAULT true,
  enable_membership BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stripe_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS stripe_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  stripe_publishable_key TEXT,
  stripe_secret_key TEXT,
  stripe_webhook_secret TEXT,
  stripe_mode TEXT DEFAULT 'test' CHECK (stripe_mode IN ('test', 'live')),
  enable_stripe BOOLEAN DEFAULT false,
  default_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_username TEXT,
  smtp_password TEXT,
  from_email TEXT,
  from_name TEXT,
  enable_newsletters BOOLEAN DEFAULT false,
  newsletter_frequency TEXT DEFAULT 'weekly' CHECK (newsletter_frequency IN ('daily', 'weekly', 'monthly')),
  auto_welcome_email BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_subscribers table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT DEFAULT 'custom' CHECK (template_type IN ('newsletter', 'welcome', 'notification', 'custom')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix members table schema to match the application requirements
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS registration_date DATE,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS baptismal_name TEXT,
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS apt_suite_bldg TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state_province_region TEXT,
ADD COLUMN IF NOT EXISTS postal_zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT DEFAULT 'single',
ADD COLUMN IF NOT EXISTS spouse_name TEXT,
ADD COLUMN IF NOT EXISTS spouse_baptismal_name TEXT,
ADD COLUMN IF NOT EXISTS spouse_phone TEXT,
ADD COLUMN IF NOT EXISTS spouse_email TEXT,
ADD COLUMN IF NOT EXISTS child1_first_name TEXT,
ADD COLUMN IF NOT EXISTS child1_middle_name TEXT,
ADD COLUMN IF NOT EXISTS child1_last_name TEXT,
ADD COLUMN IF NOT EXISTS child1_date_of_birth DATE,
ADD COLUMN IF NOT EXISTS child2_first_name TEXT,
ADD COLUMN IF NOT EXISTS child2_middle_name TEXT,
ADD COLUMN IF NOT EXISTS child2_last_name TEXT,
ADD COLUMN IF NOT EXISTS child2_date_of_birth DATE,
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
ADD COLUMN IF NOT EXISTS children JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS email_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_updates BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS photo_consent BOOLEAN DEFAULT false;

-- Ensure donations table has all required columns
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS donor_name TEXT,
ADD COLUMN IF NOT EXISTS donor_email TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'general_fund';

-- Ensure events table has all required columns
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Ensure sermons table has all required columns
ALTER TABLE sermons 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure gallery table has correct structure
ALTER TABLE gallery 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Ensure testimonials table has approval system
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Ensure prayer_requests table has visibility control
ALTER TABLE prayer_requests 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for images bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for all tables
alter publication supabase_realtime add table site_settings;
alter publication supabase_realtime add table stripe_settings;
alter publication supabase_realtime add table email_settings;
alter publication supabase_realtime add table email_subscribers;
alter publication supabase_realtime add table email_templates;
alter publication supabase_realtime add table email_campaigns;
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table donations;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table sermons;
alter publication supabase_realtime add table gallery;
alter publication supabase_realtime add table testimonials;
alter publication supabase_realtime add table prayer_requests;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table appointments;

-- Insert default site settings if none exist
INSERT INTO site_settings (id, church_name, enable_donations, enable_membership, maintenance_mode)
VALUES (1, 'St. Gabriel Ethiopian Orthodox Church', true, true, false)
ON CONFLICT (id) DO NOTHING;

-- Insert default stripe settings if none exist
INSERT INTO stripe_settings (id, stripe_mode, enable_stripe, default_currency)
VALUES (1, 'test', false, 'USD')
ON CONFLICT (id) DO NOTHING;

-- Insert default email settings if none exist
INSERT INTO email_settings (id, enable_newsletters, newsletter_frequency, auto_welcome_email)
VALUES (1, false, 'weekly', true)
ON CONFLICT (id) DO NOTHING;
