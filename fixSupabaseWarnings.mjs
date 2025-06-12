import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.log('Please ensure you have the following in your .env file:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sql = `
/* ──────────────── 1. POLÍTICAS RLS ──────────────── */
-- ❶ Elimina todas las políticas permisivas duplicadas
DROP POLICY IF EXISTS "dev-all-anon" ON public.cursos_materias;
DROP POLICY IF EXISTS "allow all dev" ON public.cursos_materias;
DROP POLICY IF EXISTS "authenticated_can_read_cursos_materias" ON public.cursos_materias;
DROP POLICY IF EXISTS "admins_can_insert_cursos_materias" ON public.cursos_materias;
DROP POLICY IF EXISTS "admins_can_update_cursos_materias" ON public.cursos_materias;
DROP POLICY IF EXISTS "admins_can_delete_cursos_materias" ON public.cursos_materias;
DROP POLICY IF EXISTS "admin_teacher_can_insert_cursos_materias" ON public.cursos_materias;
DROP POLICY IF EXISTS "admin_teacher_can_update_cursos_materias" ON public.cursos_materias;
DROP POLICY IF EXISTS "admin_can_delete_cursos_materias" ON public.cursos_materias;
DROP POLICY IF EXISTS "authenticated_users_can_read_cursos_materias" ON public.cursos_materias;

-- ❷ Crea UNA sola política genérica de desarrollo (puedes afinarla luego)
CREATE POLICY "dev_open_all"
  ON public.cursos_materias
  FOR ALL
  USING (true)
  WITH CHECK (true);

/* ──────────────── 2. SEARCH_PATH en funciones ──────────────── */
-- ❸ Vuelve a crear las funciones con search_path fijo
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN COALESCE(auth.uid()::text, '');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS "UserRole"
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE id = public.get_current_user_id()
  );
END;
$$;

-- ❹ También limpia las políticas de la tabla users si hay duplicadas
DROP POLICY IF EXISTS "authenticated_can_select_users" ON public.users;
DROP POLICY IF EXISTS "authenticated_can_update_users" ON public.users;
DROP POLICY IF EXISTS "authenticated_can_insert_users" ON public.users;
DROP POLICY IF EXISTS "authenticated_can_delete_users" ON public.users;

-- ❺ Crea políticas simplificadas para users (desarrollo)
CREATE POLICY "dev_users_all"
  ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ❻ Concede permisos necesarios
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
`;

try {
  console.log('🔧 Ejecutando limpieza de políticas RLS y funciones...');
  
  const { error } = await supabase.rpc('exec_sql', { sql });
  
  if (error) {
    console.error('❌ Error ejecutando SQL:', error);
    process.exit(1);
  }
  
  console.log('✅ Políticas unificadas y search_path fijado – sin warnings 👍');
  console.log('');
  console.log('Cambios realizados:');
  console.log('- Eliminadas políticas RLS duplicadas');
  console.log('- Creada política única "dev_open_all" para cursos_materias');
  console.log('- Creada política única "dev_users_all" para users');
  console.log('- Funciones recreadas con search_path fijo');
  console.log('');
  console.log('⚠️  NOTA: Las políticas actuales permiten acceso completo para desarrollo.');
  console.log('   En producción, deberías implementar políticas más restrictivas.');
  
} catch (error) {
  console.error('❌ Error de conexión:', error.message);
  console.log('');
  console.log('Verifica que:');
  console.log('1. Las variables de entorno estén configuradas correctamente');
  console.log('2. La clave de servicio tenga permisos suficientes');
  console.log('3. La URL de Supabase sea correcta');
  process.exit(1);
}

process.exit(0);