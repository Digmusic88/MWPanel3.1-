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

// Split SQL into individual statements for execution
const sqlStatements = [
  // ❶ Elimina todas las políticas permisivas duplicadas
  `DROP POLICY IF EXISTS "dev-all-anon" ON public.cursos_materias`,
  `DROP POLICY IF EXISTS "allow all dev" ON public.cursos_materias`,
  `DROP POLICY IF EXISTS "authenticated_can_read_cursos_materias" ON public.cursos_materias`,
  `DROP POLICY IF EXISTS "admins_can_insert_cursos_materias" ON public.cursos_materias`,
  `DROP POLICY IF EXISTS "admins_can_update_cursos_materias" ON public.cursos_materias`,
  `DROP POLICY IF EXISTS "admins_can_delete_cursos_materias" ON public.cursos_materias`,
  `DROP POLICY IF EXISTS "admin_teacher_can_insert_cursos_materias" ON public.cursos_materias`,
  `DROP POLICY IF EXISTS "admin_teacher_can_update_cursos_materias" ON public.cursos_materias`,
  `DROP POLICY IF EXISTS "admin_can_delete_cursos_materias" ON public.cursos_materias`,
  `DROP POLICY IF EXISTS "authenticated_users_can_read_cursos_materias" ON public.cursos_materias`,

  // ❷ Crea UNA sola política genérica de desarrollo
  `CREATE POLICY "dev_open_all"
    ON public.cursos_materias
    FOR ALL
    USING (true)
    WITH CHECK (true)`,

  // ❸ Vuelve a crear las funciones con search_path fijo
  `CREATE OR REPLACE FUNCTION public.get_current_user_id()
  RETURNS text
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
  AS $$
  BEGIN
    RETURN COALESCE(auth.uid()::text, '');
  END;
  $$`,

  `CREATE OR REPLACE FUNCTION public.get_current_user_role()
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
  $$`,

  // ❹ También limpia las políticas de la tabla users si hay duplicadas
  `DROP POLICY IF EXISTS "authenticated_can_select_users" ON public.users`,
  `DROP POLICY IF EXISTS "authenticated_can_update_users" ON public.users`,
  `DROP POLICY IF EXISTS "authenticated_can_insert_users" ON public.users`,
  `DROP POLICY IF EXISTS "authenticated_can_delete_users" ON public.users`,

  // ❺ Crea políticas simplificadas para users (desarrollo)
  `CREATE POLICY "dev_users_all"
    ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true)`,

  // ❻ Concede permisos necesarios
  `GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated`,
  `GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated`
];

async function executeSqlStatements() {
  console.log('🔧 Ejecutando limpieza de políticas RLS y funciones...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [index, statement] of sqlStatements.entries()) {
    try {
      console.log(`Ejecutando statement ${index + 1}/${sqlStatements.length}...`);
      
      // Use rpc to execute SQL statements
      const { error } = await supabase.rpc('exec_sql', { 
        query: statement 
      });
      
      if (error) {
        // Try alternative method if exec_sql doesn't exist
        const { error: altError } = await supabase.rpc('sql', { 
          query: statement 
        });
        
        if (altError) {
          console.warn(`⚠️  Warning en statement ${index + 1}:`, altError.message);
          errorCount++;
        } else {
          successCount++;
        }
      } else {
        successCount++;
      }
    } catch (error) {
      console.warn(`⚠️  Error en statement ${index + 1}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('');
  console.log(`✅ Proceso completado: ${successCount} exitosos, ${errorCount} con warnings`);
  console.log('');
  console.log('Cambios realizados:');
  console.log('- Eliminadas políticas RLS duplicadas');
  console.log('- Creada política única "dev_open_all" para cursos_materias');
  console.log('- Creada política única "dev_users_all" para users');
  console.log('- Funciones recreadas con search_path fijo');
  console.log('');
  console.log('⚠️  NOTA: Las políticas actuales permiten acceso completo para desarrollo.');
  console.log('   En producción, deberías implementar políticas más restrictivas.');
}

try {
  await executeSqlStatements();
} catch (error) {
  console.error('❌ Error de conexión:', error.message);
  console.log('');
  console.log('Verifica que:');
  console.log('1. Las variables de entorno estén configuradas correctamente');
  console.log('2. La clave de servicio tenga permisos suficientes');
  console.log('3. La URL de Supabase sea correcta');
  console.log('');
  console.log('Si el error persiste, puedes ejecutar las consultas SQL manualmente');
  console.log('en el SQL Editor de tu dashboard de Supabase.');
  process.exit(1);
}

process.exit(0);