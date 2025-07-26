-- Comprehensive backend setup for church management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create or update members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  street_address TEXT,
  city TEXT,
  state_province_region TEXT,
  postal_zip_code TEXT,
  country TEXT DEFAULT 'United States',
  address TEXT, -- Combined address field for backward compatibility
  membership_type TEXT DEFAULT 'regular' CHECK (membership_type IN ('regular', 'student', 'senior', 'family')),
  membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'inactive')),
  preferred_language TEXT DEFAULT 'english' CHECK (preferred_language IN ('english', 'amharic')),
  ministry_interests TEXT,
  email_updates BOOLEAN DEFAULT true,
  newsletter_consent BOOLEAN DEFAULT true,
  terms_accepted BOOLEAN DEFAULT false,
  join_date DATE DEFAULT CURRENT_DATE,
  membership_date DATE,
  registration_date DATE DEFAULT CURRENT_DATE,
  last_renewal_date DATE,
  next_renewal_date DATE,
  membership_fee_paid BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or update appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_title TEXT NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  confirmed_date DATE,
  confirmed_time TIME,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  notes TEXT,
  admin_response TEXT,
  admin_notes TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or update donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10,2) NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  purpose TEXT DEFAULT 'general',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  member_id UUID REFERENCES members(id),
  is_membership_fee BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or update events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_date DATE,
  end_time TIME,
  location TEXT,
  category TEXT DEFAULT 'general',
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline DATE,
  featured BOOLEAN DEFAULT false,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or update sermons table
CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  speaker TEXT,
  sermon_date DATE NOT NULL,
  scripture_reference TEXT,
  audio_url TEXT,
  video_url TEXT,
  transcript TEXT,
  series TEXT,
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or update prayer_requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  request_text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_anonymous BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or update testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  testimonial_text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or update gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  event_id UUID REFERENCES events(id),
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
  recipient_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  sent_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table for admin users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES
  ('church_name', '"Debre Bisrat Ethiopian Orthodox Tewahedo Church"', 'Church name'),
  ('church_address', '"123 Church Street, City, State 12345"', 'Church address'),
  ('church_phone', '"+1-555-123-4567"', 'Church phone number'),
  ('church_email', '"info@debrebishrat.org"', 'Church email'),
  ('enable_donations', 'true', 'Enable donation functionality'),
  ('enable_appointments', 'true', 'Enable appointment booking'),
  ('enable_events', 'true', 'Enable events functionality'),
  ('membership_fee_regular', '100', 'Regular membership fee'),
  ('membership_fee_student', '50', 'Student membership fee'),
  ('membership_fee_senior', '75', 'Senior membership fee'),
  ('membership_fee_family', '200', 'Family membership fee')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(membership_status);
CREATE INDEX IF NOT EXISTS idx_members_type ON members(membership_type);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(requested_date);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_member ON donations(member_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_approved ON prayer_requests(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON event_registrations;
CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sermons_updated_at ON sermons;
CREATE TRIGGER update_sermons_updated_at BEFORE UPDATE ON sermons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prayer_requests_updated_at ON prayer_requests;
CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON prayer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_updated_at ON gallery;
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) but keep it permissive for now
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public access (appointments, donations, etc.)
DROP POLICY IF EXISTS "Public can insert appointments" ON appointments;
CREATE POLICY "Public can insert appointments" ON appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view appointments" ON appointments;
CREATE POLICY "Public can view appointments" ON appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert donations" ON donations;
CREATE POLICY "Public can insert donations" ON donations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view donations" ON donations;
CREATE POLICY "Public can view donations" ON donations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert members" ON members;
CREATE POLICY "Public can insert members" ON members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view members" ON members;
CREATE POLICY "Public can view members" ON members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert prayer requests" ON prayer_requests;
CREATE POLICY "Public can insert prayer requests" ON prayer_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view prayer requests" ON prayer_requests;
CREATE POLICY "Public can view prayer requests" ON prayer_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert testimonials" ON testimonials;
CREATE POLICY "Public can insert testimonials" ON testimonials FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
CREATE POLICY "Public can view testimonials" ON testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view events" ON events;
CREATE POLICY "Public can view events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert event registrations" ON event_registrations;
CREATE POLICY "Public can insert event registrations" ON event_registrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view event registrations" ON event_registrations;
CREATE POLICY "Public can view event registrations" ON event_registrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view sermons" ON sermons;
CREATE POLICY "Public can view sermons" ON sermons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view gallery" ON gallery;
CREATE POLICY "Public can view gallery" ON gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);

-- Admin policies for full access
DROP POLICY IF EXISTS "Admins can do everything on appointments" ON appointments;
CREATE POLICY "Admins can do everything on appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on donations" ON donations;
CREATE POLICY "Admins can do everything on donations" ON donations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on members" ON members;
CREATE POLICY "Admins can do everything on members" ON members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on events" ON events;
CREATE POLICY "Admins can do everything on events" ON events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on event_registrations" ON event_registrations;
CREATE POLICY "Admins can do everything on event_registrations" ON event_registrations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on sermons" ON sermons;
CREATE POLICY "Admins can do everything on sermons" ON sermons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on prayer_requests" ON prayer_requests;
CREATE POLICY "Admins can do everything on prayer_requests" ON prayer_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on testimonials" ON testimonials;
CREATE POLICY "Admins can do everything on testimonials" ON testimonials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on gallery" ON gallery;
CREATE POLICY "Admins can do everything on gallery" ON gallery FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on email_campaigns" ON email_campaigns;
CREATE POLICY "Admins can do everything on email_campaigns" ON email_campaigns FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on email_templates" ON email_templates;
CREATE POLICY "Admins can do everything on email_templates" ON email_templates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on profiles" ON profiles;
CREATE POLICY "Admins can do everything on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything on site_settings" ON site_settings;
CREATE POLICY "Admins can do everything on site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for all tables (only if not already added)
DO $$
BEGIN
  -- Check and add tables to realtime publication if not already present
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'members') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE members;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'appointments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'donations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE donations;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'event_registrations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE event_registrations;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'sermons') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE sermons;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'prayer_requests') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE prayer_requests;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'testimonials') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'gallery') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE gallery;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'email_campaigns') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE email_campaigns;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'email_templates') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE email_templates;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;
  END IF;
END $$;