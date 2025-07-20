-- Migration for appointments table with status updates and filtering support
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  service_title text not null,
  requested_date date not null,
  requested_time text not null,
  notes text,
  status text not null default 'pending',
  admin_response text,
  admin_notes text,
  confirmed_date date,
  confirmed_time text,
  responded_by uuid references auth.users(id),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for filtering by status
create index if not exists idx_appointments_status on appointments(status);

-- For joining with user profile (if needed)
alter table appointments drop column if exists responded_by_profile;
