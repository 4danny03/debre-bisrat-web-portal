-- Migration: Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  membership_type text NOT NULL DEFAULT 'regular',
  membership_status text NOT NULL DEFAULT 'pending',
  join_date date NOT NULL DEFAULT now(),
  registration_date date NOT NULL DEFAULT now(),
  first_name text,
  last_name text,
  street_address text,
  city text,
  state_province_region text,
  postal_zip_code text,
  country text,
  date_of_birth date,
  gender text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  additional_notes text
);
-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
the migration failed give me the SQL so