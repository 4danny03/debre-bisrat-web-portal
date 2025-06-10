-- Create stripe_settings table
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

-- Create email_settings table
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

-- Create email_subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT DEFAULT 'newsletter' CHECK (template_type IN ('newsletter', 'welcome', 'notification', 'custom')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);

-- Enable realtime for new tables (only if not already added)
DO $$
BEGIN
    -- Add email_subscribers to realtime if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'email_subscribers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE email_subscribers;
    END IF;
    
    -- Add email_templates to realtime if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'email_templates'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE email_templates;
    END IF;
    
    -- Add email_campaigns to realtime if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'email_campaigns'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE email_campaigns;
    END IF;
END $$;

-- Insert default email template
INSERT INTO email_templates (name, subject, content, template_type) VALUES (
  'Welcome Email',
  'Welcome to St. Gabriel Ethiopian Orthodox Church',
  '<h1>Welcome to Our Church Community!</h1><p>Thank you for subscribing to our newsletter. We are excited to have you as part of our spiritual family.</p><p>You will receive updates about our services, events, and community activities.</p><p>Blessings,<br>St. Gabriel Ethiopian Orthodox Church</p>',
  'welcome'
) ON CONFLICT DO NOTHING;

INSERT INTO email_templates (name, subject, content, template_type) VALUES (
  'Monthly Newsletter',
  'St. Gabriel Church - Monthly Newsletter',
  '<h1>Monthly Newsletter</h1><p>Dear Church Family,</p><p>Here are the latest updates from our church community:</p><h2>Upcoming Events</h2><p>[Events will be inserted here]</p><h2>Recent Sermons</h2><p>[Sermons will be inserted here]</p><p>Blessings,<br>St. Gabriel Ethiopian Orthodox Church</p>',
  'newsletter'
) ON CONFLICT DO NOTHING;