-- Create missing tables for admin panel functionality

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  church_name TEXT DEFAULT 'St. Gabriel Ethiopian Orthodox Church',
  church_address TEXT,
  phone_number TEXT,
  email TEXT,
  admin_email TEXT,
  from_email TEXT DEFAULT 'noreply@example.com',
  enable_donations BOOLEAN DEFAULT true,
  enable_membership BOOLEAN DEFAULT true,
  enable_email_notifications BOOLEAN DEFAULT true,
  enable_newsletter BOOLEAN DEFAULT true,
  enable_stripe BOOLEAN DEFAULT false,
  stripe_publishable_key TEXT,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscribers table (separate from email_subscribers)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT true,
  subscription_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure stripe_settings table exists
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

-- Ensure email_settings table exists
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

-- Ensure email_subscribers table exists
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

-- Ensure email_templates table exists
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

-- Ensure email_campaigns table exists
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site settings if not exists
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert default stripe settings if not exists
INSERT INTO stripe_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert default email settings if not exists
INSERT INTO email_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE newsletter_subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE stripe_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE email_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE email_subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE email_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE email_campaigns;