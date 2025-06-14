/*
  # Create tables for groups and educational levels

  1. New Tables
    - `educational_levels` - Stores educational level information
    - `academic_groups` - Stores academic group information
    - `student_group_assignments` - Tracks student assignments to groups

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data
    - Add policies for admins to manage data

  3. Demo Data
    - Insert sample educational levels
    - Insert sample academic groups
    - Insert sample student assignments
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
INSERT INTO educational_levels (name, description, order_num, is_active) VALUES
  ('Educación Infantil', 'Niveles iniciales de educación infantil (3-6 años)', 0, true),
  ('Educación Primaria', 'Niveles básicos de educación primaria', 1, true),
  ('Educación Secundaria', 'Niveles intermedios de educación secundaria', 2, true);

-- Get the UUIDs of the inserted levels
DO $$
DECLARE
  infantil_id uuid;
  primaria_id uuid;
  secundaria_id uuid;
  teacher1_id text := 'demo-teacher-001';
  teacher2_id text := 'demo-teacher-002';
  student1_id text := 'demo-student-001';
  student2_id text := 'demo-student-002';
  admin_id text := 'demo-admin-001';
  group0_id uuid;
  group1_id uuid;
  group2_id uuid;
  group_archived_id uuid;
BEGIN
  -- Get the IDs of the educational levels
  SELECT id INTO infantil_id FROM educational_levels WHERE name = 'Educación Infantil';
  SELECT id INTO primaria_id FROM educational_levels WHERE name = 'Educación Primaria';
  SELECT id INTO secundaria_id FROM educational_levels WHERE name = 'Educación Secundaria';

  -- Insert academic groups with proper UUIDs
  INSERT INTO academic_groups (
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
      'Infantil 5 años A', 
      'Grupo de educación infantil para niños de 5 años', 
      infantil_id, 
      '2024-2025', 
      20, 
      1, 
      teacher1_id, 
      true, 
      false, 
      '2024-01-10', 
      '2024-01-10'
    ) RETURNING id INTO group0_id;

  INSERT INTO academic_groups (
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
      '10° Grado A', 
      'Grupo principal de décimo grado', 
      primaria_id, 
      '2024-2025', 
      30, 
      2, 
      teacher1_id, 
      true, 
      false, 
      '2024-01-15', 
      '2024-01-15'
    ) RETURNING id INTO group1_id;

  INSERT INTO academic_groups (
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
      '11° Grado B', 
      'Grupo avanzado de undécimo grado', 
      primaria_id, 
      '2024-2025', 
      28, 
      0, 
      teacher2_id, 
      true, 
      false, 
      '2024-01-15', 
      '2024-01-15'
    ) RETURNING id INTO group2_id;

  INSERT INTO academic_groups (
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
      '9° Grado C (2023-2024)', 
      'Grupo archivado del año académico anterior', 
      primaria_id, 
      '2023-2024', 
      25, 
      0, 
      teacher2_id, 
      false, 
      true, 
      '2023-01-15', 
      '2024-06-30'
    ) RETURNING id INTO group_archived_id;

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
      student1_id, 
      group0_id, 
      now(), 
      admin_id, 
      true, 
      'Asignación inicial'
    ),
    (
      student1_id, 
      group1_id, 
      now(), 
      admin_id, 
      true, 
      'Asignación inicial'
    ),
    (
      student2_id, 
      group1_id, 
      now(), 
      admin_id, 
      true, 
      'Asignación inicial'
    );
END $$;

-- Grant permissions
GRANT ALL ON educational_levels TO authenticated;
GRANT ALL ON academic_groups TO authenticated;
GRANT ALL ON student_group_assignments TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_academic_groups_level_id ON academic_groups(level_id);
CREATE INDEX IF NOT EXISTS idx_academic_groups_tutor_id ON academic_groups(tutor_id);
CREATE INDEX IF NOT EXISTS idx_student_group_assignments_student_id ON student_group_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_group_assignments_group_id ON student_group_assignments(group_id);