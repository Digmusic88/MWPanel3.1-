/*
  # Fix RLS policies for cursos_materias table

  1. Security Updates
    - Drop existing problematic policies
    - Create new simplified policies that work with current auth system
    - Ensure policies check the correct user table and authentication

  2. Policy Changes
    - Simplify INSERT policy to allow authenticated users with ADMIN or TEACHER roles
    - Simplify UPDATE policy to allow authenticated users with ADMIN or TEACHER roles  
    - Simplify DELETE policy to allow authenticated users with ADMIN role
    - Keep SELECT policy allowing all authenticated users to read

  3. Notes
    - Policies now check only the `users` table (not `users_old`)
    - Uses proper Supabase auth.uid() function
    - Simplified role checking logic
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_can_delete_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admin_teacher_can_insert_cursos_materias" ON cursos_materias;
DROP POLICY IF EXISTS "admin_teacher_can_update_cursos_materias" ON cursos_materias;
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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (auth.uid())::text 
      AND users.role IN ('ADMIN', 'TEACHER')
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
  );