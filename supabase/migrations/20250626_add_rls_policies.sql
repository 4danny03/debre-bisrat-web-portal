-- SUPABASE RLS POLICIES FOR COMMON TABLES

-- APPOINTMENTS TABLE
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create appointments
CREATE POLICY "Authenticated can insert appointments" ON appointments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to view their own appointments (if you have a user_id column)
CREATE POLICY "User can view own appointments" ON appointments
  FOR SELECT USING (user_id = auth.uid());

-- Allow admins to view all appointments
CREATE POLICY "Admin can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins to update and delete appointments
CREATE POLICY "Admin can update appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
CREATE POLICY "Admin can delete appointments" ON appointments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- MEMBERS TABLE
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Allow users to view and update their own member profile
CREATE POLICY "User can view own member profile" ON members
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User can update own member profile" ON members
  FOR UPDATE USING (user_id = auth.uid());

-- Allow admins to view and update all members
CREATE POLICY "Admin can view all members" ON members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
CREATE POLICY "Admin can update all members" ON members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- DONATIONS TABLE
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Allow users to insert donations
CREATE POLICY "Authenticated can insert donations" ON donations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow admins to view and manage all donations
CREATE POLICY "Admin can view all donations" ON donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
CREATE POLICY "Admin can update all donations" ON donations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
CREATE POLICY "Admin can delete all donations" ON donations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- You can add similar policies for other tables as needed.
