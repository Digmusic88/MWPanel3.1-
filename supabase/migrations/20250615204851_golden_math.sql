/*
  # Fix Panel Settings RLS Policies

  1. Changes
     - Drop existing problematic RLS policies on panel_settings
     - Create new policies with proper user ID handling
     - Fix type casting issues with role comparisons
     - Add separate read policy for all authenticated users

  2. Security
     - Maintain proper access control for admin users
     - Allow read access for all authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_admin_write" ON panel_settings;
DROP POLICY IF EXISTS "allow_read" ON panel_settings;

-- Create new policies with proper user ID handling
-- Avoid using UserRole type casting and use text comparison instead
CREATE POLICY "admin_can_manage_panel_settings"
  ON panel_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (auth.uid())::text 
      AND users.role = 'ADMIN'
    )
    OR
    EXISTS (
      SELECT 1 FROM users_old 
      WHERE users_old.id = (auth.uid())::text 
      AND users_old.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (auth.uid())::text 
      AND users.role = 'ADMIN'
    )
    OR
    EXISTS (
      SELECT 1 FROM users_old 
      WHERE users_old.id = (auth.uid())::text 
      AND users_old.role = 'ADMIN'
    )
  );

-- Allow authenticated users to read panel settings
CREATE POLICY "authenticated_can_read_panel_settings"
  ON panel_settings
  FOR SELECT
  TO authenticated
  USING (true);