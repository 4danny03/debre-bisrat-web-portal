-- Create analytics views for better performance

-- Member statistics view
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
  0 as paid_members, -- membership_fee_paid column will be added later
  0 as members_needing_followup, -- follow_up_required column will be added later
  COUNT(*) FILTER (WHERE registration_date >= CURRENT_DATE - INTERVAL '30 days') as new_members_this_month,
  COUNT(*) FILTER (WHERE registration_date >= CURRENT_DATE - INTERVAL '7 days') as new_members_this_week
FROM members;

-- Active members view (simplified member data for quick access)
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
  null as membership_fee_paid, -- Will be added in future migration
  null as integration_status, -- Will be added in future migration
  null as preferred_language, -- Will be added in future migration
  emergency_contact_name,
  emergency_contact_phone,
  created_at,
  updated_at
FROM members
WHERE membership_status = 'active';

-- Donation analytics view
CREATE OR REPLACE VIEW donation_analytics AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as donation_count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  purpose,
  payment_status
FROM donations
GROUP BY DATE_TRUNC('month', created_at), purpose, payment_status
ORDER BY month DESC;

-- Event analytics view
CREATE OR REPLACE VIEW event_analytics AS
SELECT 
  DATE_TRUNC('month', event_date) as month,
  COUNT(*) as event_count,
  COUNT(*) FILTER (WHERE is_featured = true) as featured_events,
  COUNT(*) FILTER (WHERE event_date > CURRENT_DATE) as upcoming_events
FROM events
GROUP BY DATE_TRUNC('month', event_date)
ORDER BY month DESC;

-- System health summary view
CREATE OR REPLACE VIEW system_health_summary AS
SELECT 
  'members' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM members
UNION ALL
SELECT 
  'events' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM events
UNION ALL
SELECT 
  'donations' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM donations
UNION ALL
SELECT 
  'sermons' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM sermons
UNION ALL
SELECT 
  'testimonials' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM testimonials
UNION ALL
SELECT 
  'prayer_requests' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM prayer_requests;

-- Grant access to views
GRANT SELECT ON membership_statistics TO authenticated;
GRANT SELECT ON active_members TO authenticated;
GRANT SELECT ON donation_analytics TO authenticated;
GRANT SELECT ON event_analytics TO authenticated;
GRANT SELECT ON system_health_summary TO authenticated;
