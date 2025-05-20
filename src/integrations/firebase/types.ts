export type Profile = {
  id: string;
  role: 'user' | 'admin';
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  membership_type: 'regular' | 'student' | 'senior' | 'family';
  membership_status: 'pending' | 'active' | 'inactive';
  join_date: string;
  last_renewal_date: string | null;
  next_renewal_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  image_url: string | null;
  is_featured: boolean;
  event_type: 'service' | 'holiday' | 'special' | 'community';
  status: 'scheduled' | 'cancelled' | 'completed';
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Donation = {
  id: string;
  user_id: string | null;
  amount: number;
  currency: string;
  donation_type: 'one_time' | 'recurring' | 'special';
  purpose: string | null;
  transaction_id: string | null;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string | null;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  announcement_type: 'general' | 'event' | 'urgent';
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: number;
  church_name: string | null;
  church_address: string | null;
  phone_number: string | null;
  email: string | null;
  enable_donations: boolean;
  enable_membership: boolean;
  maintenance_mode: boolean;
  created_at: string;
  updated_at: string;
};
