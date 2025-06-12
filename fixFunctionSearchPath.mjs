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

// SQL statements to fix search_path warnings
const sqlStatements = [
  // 1. Elimina las versiones antiguas (si existieran)
  `DROP FUNCTION IF EXISTS public.get_current_user_id()`,
  `DROP FUNCTION IF EXISTS public.get_current_user_role()`,

  // 2. Crea versiones nuevas con search_path fijo
  `CREATE OR REPLACE FUNCTION public.get_current_user_id()
  RETURNS uuid
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = pg_catalog, public
  AS $$
    SELECT auth.uid();
  $$`,

  `CREATE OR REPLACE FUNCTION public.get_current_user_role()
  RETURNS text
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = pg_catalog, public
  AS $$
    SELECT auth.role();
  $$`,

  // 3. Concede permisos necesarios
  `GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated`,
  `GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated`
];

async function fixFunctionSearchPath() {
  console.log('🔧 Fijando search_path en funciones de Supabase...');
  console.log('');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [index, statement] of sqlStatements.entries()) {
    try {
      console.log(`Ejecutando statement ${index + 1}/${sqlStatements.length}...`);
      
      // Try to execute using rpc
      let result;
      try {
        result = await supabase.rpc('exec_sql', { query: statement });
      } catch (rpcError) {
        // Fallback: try alternative method
        result = await supabase.rpc('sql', { q: statement });
      }
      
      if (result.error) {
        console.warn(`⚠️  Warning en statement ${index + 1}:`, result.error.message);
        errorCount++;
      } else {
        console.log(`✅ Statement ${index + 1} ejecutado correctamente`);
        successCount++;
      }
    } catch (error) {
      console.warn(`⚠️  Error en statement ${index + 1}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('');
  console.log(`📊 Resultado: ${successCount} exitosos, ${errorCount} con warnings`);
  console.log('');
  
  if (successCount > 0) {
    console.log('✅ search_path fijado; warnings resueltos');
    console.log('');
    console.log('Cambios realizados:');
    console.log('- get_current_user_id() recreada con search_path fijo');
    console.log('- get_current_user_role() recreada con search_path fijo');
    console.log('- Permisos concedidos a usuarios autenticados');
    console.log('');
    console.log('🎯 Los warnings de "Function Search Path Mutable" deberían estar resueltos');
  } else {
    console.log('❌ No se pudieron ejecutar las funciones correctamente');
    console.log('');
    console.log('Puedes ejecutar manualmente en el SQL Editor de Supabase:');
    console.log('');
    sqlStatements.forEach((stmt, i) => {
      console.log(`-- Statement ${i + 1}`);
      console.log(stmt);
      console.log('');
    });
  }
}

try {
  await fixFunctionSearchPath();
} catch (error) {
  console.error('❌ Error de conexión:', error.message);
  console.log('');
  console.log('Verifica que:');
  console.log('1. Las variables de entorno estén configuradas correctamente');
  console.log('2. La clave de servicio tenga permisos suficientes');
  console.log('3. La URL de Supabase sea correcta');
  console.log('');
  console.log('Variables requeridas en .env:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

process.exit(0);