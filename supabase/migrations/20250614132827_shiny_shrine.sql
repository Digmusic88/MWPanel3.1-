/*
  # Fix RLS policies for cursos_materias table

  1. Security Updates
    - Drop existing problematic policies
    - Create new working policies for cursos_materias table
    - Ensure proper role checking for both users and users_old tables
    - Maintain security while fixing the RLS policy violations

  2. Changes Made
    - Drop all existing policies to avoid conflicts
    - Create new policies with proper role checking
    - Allow both users and users_old tables to be checked for roles
    - Ensure authenticated users can read all records
    - Allow admins and teachers to create and update records
    - Only allow admins to delete records
*/

-- Drop all existing policies for cursos_materias
DROP POLICY IF EXISTS "admin_can_delete_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admin_teacher_can_insert_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admin_teacher_can_update_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admins_can_delete_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admins_can_insert_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admins_can_update_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "authenticated_can_read_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "authenticated_users_can_read_cursos_materias" ON cursos_materias;

-- Create new simplified policies

-- Allow authenticated users to read all cursos_materias
CREATE POLICY "authenticated_users_can_read_cursos_materias"
  ON cursos_materias
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins and teachers to insert cursos_materias
CREATE POLICY "admin_teacher_can_insert_cursos_materias"
  ON cursos_materias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (auth.uid())::text 
      AND users.role IN ('ADMIN', 'TEACHER')
    )
    OR
    EXISTS (
      SELECT 1 FROM users_old 
      WHERE users_old.id = (auth.uid())::text 
      AND users_old.role IN ('ADMIN', 'TEACHER')
    )
  );

-- Allow admins and teachers to update cursos_materias
CREATE POLICY "admin_teacher_can_update_cursos_materias"
  ON cursos_materias
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (auth.uid())::text 
      AND users.role IN ('ADMIN', 'TEACHER')
    )
    OR
    EXISTS (
      SELECT 1 FROM users_old 
      WHERE users_old.id = (auth.uid())::text 
      AND users_old.role IN ('ADMIN', 'TEACHER')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (auth.uid())::text 
      AND users.role IN ('ADMIN', 'TEACHER')
    )
    OR
    EXISTS (
      SELECT 1 FROM users_old 
      WHERE users_old.id = (auth.uid())::text 
      AND users_old.role IN ('ADMIN', 'TEACHER')
    )
  );

-- Allow only admins to delete cursos_materias
CREATE POLICY "admin_can_delete_cursos_materias"
  ON cursos_materias
  FOR DELETE
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
  );