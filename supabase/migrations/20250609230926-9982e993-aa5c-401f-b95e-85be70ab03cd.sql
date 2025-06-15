
-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT true,
  subscription_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'newsletter', 'donation_confirmation', 'admin_notification'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'sending', 'sent', 'failed'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add site settings for email configuration
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS admin_email TEXT,
ADD COLUMN IF NOT EXISTS from_email TEXT DEFAULT 'noreply@example.com',
ADD COLUMN IF NOT EXISTS enable_email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_newsletter BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT,
ADD COLUMN IF NOT EXISTS enable_stripe BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_subscribers
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full access to newsletter_subscribers" ON public.newsletter_subscribers
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Create policies for email_templates
CREATE POLICY "Admin full access to email_templates" ON public.email_templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Create policies for email_campaigns
CREATE POLICY "Admin full access to email_campaigns" ON public.email_campaigns
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, content, template_type) VALUES
('donation_confirmation', 'Thank you for your donation!', 
'<h1>Thank you for your generous donation!</h1>
<p>Dear {{donor_name}},</p>
<p>We have received your donation of ${{amount}} for {{purpose}}.</p>
<p>Your contribution helps us continue our mission and serve our community.</p>
<p>God bless you!</p>
<p>St. Gabriel Ethiopian Orthodox Church</p>', 'donation_confirmation'),

('admin_notification', 'New Donation Received', 
'<h2>New Donation Alert</h2>
<p>A new donation has been received:</p>
<ul>
<li>Donor: {{donor_name}} ({{donor_email}})</li>
<li>Amount: ${{amount}}</li>
<li>Purpose: {{purpose}}</li>
<li>Date: {{date}}</li>
<li>Payment Status: {{status}}</li>
</ul>', 'admin_notification'),

('newsletter_template', 'Church Newsletter', 
'<h1>{{church_name}} Newsletter</h1>
<p>Dear Brothers and Sisters,</p>
<p>{{content}}</p>
<p>Blessings,<br>{{church_name}}</p>', 'newsletter')
ON CONFLICT (name) DO NOTHING;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE newsletter_subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE email_campaigns;
