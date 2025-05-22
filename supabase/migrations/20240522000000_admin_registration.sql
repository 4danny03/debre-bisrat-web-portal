-- Create admin registration codes table
create table if not exists admin_registration_codes (
  code text primary key,
  created_by uuid references auth.users(id),
  used_by uuid references auth.users(id),
  created_at timestamptz default now(),
  used_at timestamptz,
  expires_at timestamptz,
  is_active boolean default true
);

-- Create RLS policies
alter table admin_registration_codes enable row level security;

-- Only admins can create new codes
create policy "Admins can create registration codes"
  on admin_registration_codes
  for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Only admins can view codes
create policy "Admins can view registration codes"
  on admin_registration_codes
  for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Function to generate registration code
create or replace function generate_admin_registration_code(expires_in interval default '7 days'::interval)
returns text
language plpgsql
security definer
as $$
declare
  new_code text;
begin
  -- Check if user is admin
  if not exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  ) then
    raise exception 'Only admins can generate registration codes';
  end if;

  -- Generate a random code
  new_code := encode(gen_random_bytes(12), 'hex');

  -- Insert the code
  insert into admin_registration_codes (
    code,
    created_by,
    expires_at
  ) values (
    new_code,
    auth.uid(),
    now() + expires_in
  );

  return new_code;
end;
$$;

-- Function to validate registration code
create or replace function validate_admin_registration_code(code text)
returns boolean
language plpgsql
security definer
as $$
declare
  valid boolean;
begin
  -- Check if code exists, is active, not used, and not expired
  select exists(
    select 1 
    from admin_registration_codes
    where admin_registration_codes.code = validate_admin_registration_code.code
    and is_active = true
    and used_by is null
    and (expires_at is null or expires_at > now())
  ) into valid;

  -- If valid, mark as used
  if valid then
    update admin_registration_codes
    set used_by = auth.uid(),
        used_at = now(),
        is_active = false
    where admin_registration_codes.code = validate_admin_registration_code.code;
  end if;

  return valid;
end;
$$;
