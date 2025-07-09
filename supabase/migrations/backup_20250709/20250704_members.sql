-- Migration: Create members table for church membership registration
CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  street_address text,
  city text,
  state_province_region text,
  postal_zip_code text,
  country text,
  date_of_birth date,
  gender text,
  membership_type text NOT NULL CHECK (membership_type IN ('regular', 'student', 'senior', 'family')),
  membership_status text NOT NULL DEFAULT 'pending',
  join_date timestamptz,
  registration_date date,
  preferred_language text,
  ministry_interests text[],
  email_updates boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_membership_type ON public.members(membership_type);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(membership_status);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION update_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_members_updated_at ON public.members;
CREATE TRIGGER set_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE PROCEDURE update_members_updated_at();
