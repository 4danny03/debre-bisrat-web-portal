-- Allow anyone (including unauthenticated users) to insert appointments
CREATE POLICY "Anyone can insert appointments" ON appointments
  FOR INSERT TO public
  WITH CHECK (true);

-- Allow anyone (including unauthenticated users) to insert members
CREATE POLICY "Anyone can insert members" ON members
  FOR INSERT TO public
  WITH CHECK (true);
