/*
  # Panel Settings Table

  1. Table
    - panel_settings: stores global configuration grouped by sections
      - id (uuid, primary key)
      - general (jsonb)
      - estructura_academica (jsonb)
      - gestion_academica (jsonb)
      - gestion_usuarios (jsonb)
      - comunicaciones (jsonb)
      - diseno (jsonb)
      - seguridad (jsonb)
      - laboratorio (jsonb)
      - updated_at (timestamptz, default now())

  2. Security
    - Enable RLS
    - Authenticated users can read
    - Admins can insert/update/delete
*/

-- Create table if not exists
CREATE TABLE IF NOT EXISTS panel_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  general jsonb,
  estructura_academica jsonb,
  gestion_academica jsonb,
  gestion_usuarios jsonb,
  comunicaciones jsonb,
  diseno jsonb,
  seguridad jsonb,
  laboratorio jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE panel_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'panel_settings'
      AND policyname = 'allow_read'
  ) THEN
    CREATE POLICY allow_read ON panel_settings
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'panel_settings'
      AND policyname = 'allow_admin_write'
  ) THEN
    CREATE POLICY allow_admin_write ON panel_settings
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()::text
            AND users.role::text = 'ADMIN'
        )
      ) WITH CHECK (true);
  END IF;
END $$;

-- Grant permissions
GRANT ALL ON panel_settings TO authenticated;
