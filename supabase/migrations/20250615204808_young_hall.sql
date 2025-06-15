/*
  # Fix Panel Settings RLS Policies

  1. Security Updates
    - Update RLS policies for `panel_settings` table to properly handle user authentication
    - Ensure admin users can insert and update panel settings
    - Fix user ID matching between auth.uid() and users table

  2. Changes
    - Drop existing policies that have incorrect user ID matching
    - Create new policies that properly check admin role permissions
    - Use proper user ID comparison for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_admin_write" ON panel_settings;
DROP POLICY IF EXISTS "allow_read" ON panel_settings;

-- Create new policies with proper user ID handling
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
      AND users_old.role = 'ADMIN'::UserRole
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
      AND users_old.role = 'ADMIN'::UserRole
    )
  );

-- Allow authenticated users to read panel settings
CREATE POLICY "authenticated_can_read_panel_settings"
  ON panel_settings
  FOR SELECT
  TO authenticated
  USING (true);