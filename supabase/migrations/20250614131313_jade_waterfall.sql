/*
  # Fix RLS policies for cursos_materias table

  1. Security Changes
    - Drop existing conflicting policies
    - Create new simplified policies that work with Supabase auth
    - Enable proper INSERT permissions for authenticated users
    - Maintain proper access control based on user roles

  2. Policy Updates
    - Allow authenticated users to read all cursos_materias
    - Allow users with ADMIN or TEACHER role to insert/update/delete
    - Use proper Supabase auth functions instead of custom functions
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
CREATE POLICY "authenticated_users_can_read_cursos_materias"
  ON cursos_materias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_teacher_can_insert_cursos_materias"
  ON cursos_materias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (auth.uid())::text 
      AND role IN ('ADMIN', 'TEACHER')
    )
    OR
    EXISTS (
      SELECT 1 FROM users_old 
      WHERE id = (auth.uid())::text 
      AND role IN ('ADMIN', 'TEACHER')
    )
  );

CREATE POLICY "admin_teacher_can_update_cursos_materias"
  ON cursos_materias
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (auth.uid())::text 
      AND role IN ('ADMIN', 'TEACHER')
    )
    OR
    EXISTS (
      SELECT 1 FROM users_old 
      WHERE id = (auth.uid())::text 
      AND role IN ('ADMIN', 'TEACHER')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (auth.uid())::text 
      AND role IN ('ADMIN', 'TEACHER')
    )
    OR
    EXISTS (
      SELECT 1 FROM users_old 
      WHERE id = (auth.uid())::text 
      AND role IN ('ADMIN', 'TEACHER')
    )
  );

CREATE POLICY "admin_can_delete_cursos_materias"
  ON cursos_materias
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (auth.uid())::text 
      AND role = 'ADMIN'
    )
    OR
    EXISTS (
      SELECT 1 FROM users_old 
      WHERE id = (auth.uid())::text 
      AND role = 'ADMIN'
    )
  );