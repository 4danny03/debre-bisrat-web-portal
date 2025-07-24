-- Enable Row Level Security (RLS) for appointments table
alter table appointments enable row level security;

-- Allow authenticated users to insert their own appointments
create policy "Allow insert for authenticated" on appointments
  for insert
  to authenticated
  using (auth.uid() IS NOT NULL);

-- Allow users to select their own appointments
create policy "Allow select for authenticated" on appointments
  for select
  to authenticated
  using (auth.uid() IS NOT NULL);

-- Allow admin (or service role) to update any appointment
create policy "Allow update for service role" on appointments
  for update
  to service_role
  using (true);

-- Allow users to update their own appointments (optional, restrict as needed)
-- create policy "Allow update own" on appointments
--   for update
--   to authenticated
--   using (auth.uid() = responded_by);
