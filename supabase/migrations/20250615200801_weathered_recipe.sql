/*
  # Academic Groups and Levels Schema

  1. New Tables
    - `educational_levels` - Stores educational levels (Infantil, Primaria, etc.)
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `order_num` (integer, not null)
      - `is_active` (boolean, default true)
    
    - `academic_groups` - Stores academic groups
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `level_id` (uuid, foreign key to educational_levels)
      - `academic_year` (text, not null)
      - `max_capacity` (integer, not null)
      - `current_capacity` (integer, default 0)
      - `tutor_id` (text, foreign key to users)
      - `is_active` (boolean, default true)
      - `is_archived` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `student_group_assignments` - Stores student assignments to groups
      - `id` (uuid, primary key)
      - `student_id` (text, foreign key to users)
      - `group_id` (uuid, foreign key to academic_groups)
      - `assigned_at` (timestamptz, default now())
      - `assigned_by` (text)
      - `is_active` (boolean, default true)
      - `notes` (text)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all tables
    - Add policies for admins to insert, update, and delete records
  
  3. Sample Data
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

-- Create RLS policies for educational_levels with IF NOT EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'educational_levels' 
    AND policyname = 'authenticated_users_can_read_levels'
  ) THEN
    CREATE POLICY "authenticated_users_can_read_levels"
      ON educational_levels
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'educational_levels' 
    AND policyname = 'admins_can_insert_levels'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'educational_levels' 
    AND policyname = 'admins_can_update_levels'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'educational_levels' 
    AND policyname = 'admins_can_delete_levels'
  ) THEN
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
  END IF;
END $$;

-- Create RLS policies for academic_groups with IF NOT EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'academic_groups' 
    AND policyname = 'authenticated_users_can_read_groups'
  ) THEN
    CREATE POLICY "authenticated_users_can_read_groups"
      ON academic_groups
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'academic_groups' 
    AND policyname = 'admins_can_insert_groups'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'academic_groups' 
    AND policyname = 'admins_can_update_groups'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'academic_groups' 
    AND policyname = 'admins_can_delete_groups'
  ) THEN
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
  END IF;
END $$;

-- Create RLS policies for student_group_assignments with IF NOT EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_group_assignments' 
    AND policyname = 'authenticated_users_can_read_assignments'
  ) THEN
    CREATE POLICY "authenticated_users_can_read_assignments"
      ON student_group_assignments
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_group_assignments' 
    AND policyname = 'admins_can_insert_assignments'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_group_assignments' 
    AND policyname = 'admins_can_update_assignments'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_group_assignments' 
    AND policyname = 'admins_can_delete_assignments'
  ) THEN
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
  END IF;
END $$;

-- Insert educational levels with proper UUIDs
DO $$ 
DECLARE
  infantil_id uuid := gen_random_uuid();
  primaria_id uuid := gen_random_uuid();
  secundaria_id uuid := gen_random_uuid();
  grupo_infantil_id uuid := gen_random_uuid();
  grupo_decimo_id uuid := gen_random_uuid();
  grupo_undecimo_id uuid := gen_random_uuid();
  grupo_archivado_id uuid := gen_random_uuid();
BEGIN
  -- Insert educational levels
  INSERT INTO educational_levels (id, name, description, order_num, is_active) VALUES
    (infantil_id, 'Educación Infantil', 'Niveles iniciales de educación infantil (3-6 años)', 0, true),
    (primaria_id, 'Educación Primaria', 'Niveles básicos de educación primaria', 1, true),
    (secundaria_id, 'Educación Secundaria', 'Niveles intermedios de educación secundaria', 2, true)
  ON CONFLICT (id) DO NOTHING;

  -- Insert academic groups
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
      grupo_infantil_id, 
      'Infantil 5 años A', 
      'Grupo de educación infantil para niños de 5 años', 
      infantil_id, 
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
      grupo_decimo_id, 
      '10° Grado A', 
      'Grupo principal de décimo grado', 
      primaria_id, 
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
      grupo_undecimo_id, 
      '11° Grado B', 
      'Grupo avanzado de undécimo grado', 
      primaria_id, 
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
      grupo_archivado_id, 
      '9° Grado C (2023-2024)', 
      'Grupo archivado del año académico anterior', 
      primaria_id, 
      '2023-2024', 
      25, 
      0, 
      'demo-teacher-002', 
      false, 
      true, 
      '2023-01-15', 
      '2024-06-30'
    )
  ON CONFLICT (id) DO NOTHING;

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
      grupo_infantil_id, 
      now(), 
      'demo-admin-001', 
      true, 
      'Asignación inicial'
    ),
    (
      'demo-student-001', 
      grupo_decimo_id, 
      now(), 
      'demo-admin-001', 
      true, 
      'Asignación inicial'
    ),
    (
      'demo-student-002', 
      grupo_decimo_id, 
      now(), 
      'demo-admin-001', 
      true, 
      'Asignación inicial'
    )
  ON CONFLICT DO NOTHING;
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