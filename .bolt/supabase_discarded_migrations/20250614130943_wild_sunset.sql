/*
  # Update database with groups data

  1. New Tables
    - `educational_levels` for storing educational level information
    - `academic_groups` for storing academic group information
    - `student_group_assignments` for tracking student assignments to groups

  2. Security
    - Enable RLS on all tables
    - Create policies for authenticated users to read data
    - Create policies for admins to manage data

  3. Data
    - Insert educational levels matching the UI
    - Insert academic groups matching the UI
    - Insert student assignments matching the UI
*/

-- Create educational_levels table if it doesn't exist
CREATE TABLE IF NOT EXISTS educational_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  order_num integer NOT NULL,
  is_active boolean DEFAULT true
);

-- Create academic_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS academic_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  level_id uuid REFERENCES educational_levels(id),
  academic_year text NOT NULL,
  max_capacity integer NOT NULL,
  current_capacity integer NOT NULL DEFAULT 0,
  tutor_id text REFERENCES users(id),
  is_active boolean DEFAULT true,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create student_group_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_group_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text REFERENCES users(id),
  group_id uuid REFERENCES academic_groups(id),
  assigned_at timestamptz DEFAULT now(),
  assigned_by text,
  is_active boolean DEFAULT true,
  notes text
);

-- Enable RLS on tables
ALTER TABLE educational_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_group_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for educational_levels
CREATE POLICY "authenticated_users_can_read_levels"
  ON educational_levels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_can_insert_levels"
  ON educational_levels
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  );

CREATE POLICY "admins_can_update_levels"
  ON educational_levels
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  );

CREATE POLICY "admins_can_delete_levels"
  ON educational_levels
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  );

-- Create RLS policies for academic_groups
CREATE POLICY "authenticated_users_can_read_groups"
  ON academic_groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_can_insert_groups"
  ON academic_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  );

CREATE POLICY "admins_can_update_groups"
  ON academic_groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  );

CREATE POLICY "admins_can_delete_groups"
  ON academic_groups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  );

-- Create RLS policies for student_group_assignments
CREATE POLICY "authenticated_users_can_read_assignments"
  ON student_group_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_can_insert_assignments"
  ON student_group_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  );

CREATE POLICY "admins_can_update_assignments"
  ON student_group_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  );

CREATE POLICY "admins_can_delete_assignments"
  ON student_group_assignments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role::text = 'ADMIN'
    )
  );

-- Clear existing data to avoid duplicates
TRUNCATE educational_levels CASCADE;
TRUNCATE academic_groups CASCADE;
TRUNCATE student_group_assignments CASCADE;

-- Insert educational levels that match the UI
INSERT INTO educational_levels (id, name, description, order_num, is_active) VALUES
  ('level-0', 'Educación Infantil', 'Niveles iniciales de educación infantil (3-6 años)', 0, true),
  ('level-1', 'Educación Primaria', 'Niveles básicos de educación primaria', 1, true),
  ('level-2', 'Educación Secundaria', 'Niveles intermedios de educación secundaria', 2, true);

-- Insert academic groups that match the UI
INSERT INTO academic_groups (
  id, 
  name, 
  description, 
  level_id, 
  academic_year, 
  max_capacity, 
  current_capacity, 
  tutor_id, 
  is_active, 
  is_archived, 
  created_at, 
  updated_at
) VALUES
  (
    'group-0', 
    'Infantil 5 años A', 
    'Grupo de educación infantil para niños de 5 años', 
    'level-0', 
    '2024-2025', 
    20, 
    1, 
    'demo-teacher-001', 
    true, 
    false, 
    '2024-01-10', 
    '2024-01-10'
  ),
  (
    'group-1', 
    '10° Grado A', 
    'Grupo principal de décimo grado', 
    'level-1', 
    '2024-2025', 
    30, 
    2, 
    'demo-teacher-001', 
    true, 
    false, 
    '2024-01-15', 
    '2024-01-15'
  ),
  (
    'group-2', 
    '11° Grado B', 
    'Grupo avanzado de undécimo grado', 
    'level-1', 
    '2024-2025', 
    28, 
    0, 
    'demo-teacher-002', 
    true, 
    false, 
    '2024-01-15', 
    '2024-01-15'
  ),
  (
    'group-archived-1', 
    '9° Grado C (2023-2024)', 
    'Grupo archivado del año académico anterior', 
    'level-1', 
    '2023-2024', 
    25, 
    0, 
    'demo-teacher-002', 
    false, 
    true, 
    '2023-01-15', 
    '2024-06-30'
  );

-- Insert student assignments
INSERT INTO student_group_assignments (
  student_id, 
  group_id, 
  assigned_at, 
  assigned_by, 
  is_active, 
  notes
) VALUES
  (
    'demo-student-001', 
    'group-0', 
    now(), 
    'demo-admin-001', 
    true, 
    'Asignación inicial'
  ),
  (
    'demo-student-001', 
    'group-1', 
    now(), 
    'demo-admin-001', 
    true, 
    'Asignación inicial'
  ),
  (
    'demo-student-002', 
    'group-1', 
    now(), 
    'demo-admin-001', 
    true, 
    'Asignación inicial'
  );

-- Grant permissions
GRANT ALL ON educational_levels TO authenticated;
GRANT ALL ON academic_groups TO authenticated;
GRANT ALL ON student_group_assignments TO authenticated;