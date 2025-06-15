// Script para verificar la conexión con Supabase
// Import the TypeScript implementation directly
import { supabase } from './src/lib/supabase.ts';

async function checkSupabaseConnection() {
  console.log('🔍 Verificando conexión con Supabase...\n');

  // 1. Verificar si estamos en modo mock
  if (supabase.isMock) {
    console.log('⚠️  Ejecutándose en MODO DEMO (sin conexión a Supabase)');
    console.log('   - Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY no están configuradas');
    console.log('   - Usando datos locales de demostración\n');
    return;
  }

  console.log('✅ Cliente de Supabase inicializado correctamente\n');

  try {
    // 2. Verificar conexión básica
    console.log('🔗 Probando conexión básica...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Error de conexión:', error.message);
      return;
    }
    
    console.log('✅ Conexión exitosa con la base de datos\n');

    // 3. Verificar tablas principales
    console.log('📋 Verificando tablas principales...');
    
    const tables = ['users', 'courses', 'subjects', 'cursos_materias'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Tabla '${table}': ${error.message}`);
        } else {
          console.log(`✅ Tabla '${table}': Accesible`);
        }
      } catch (err) {
        console.log(`❌ Tabla '${table}': Error de conexión`);
      }
    }

    console.log('\n📊 Verificando datos de usuarios...');
    
    // 4. Verificar usuarios demo
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, role, status')
      .limit(10);
    
    if (usersError) {
      console.log('❌ Error al obtener usuarios:', usersError.message);
    } else {
      console.log(`✅ Usuarios encontrados: ${users.length}`);
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - ${user.status}`);
      });
    }

    console.log('\n🔐 Verificando autenticación...');
    
    // 5. Verificar estado de autenticación
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      console.log('✅ Usuario autenticado:', session.session.user.email);
    } else {
      console.log('ℹ️  No hay sesión activa (normal en verificación)');
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

// Ejecutar verificación
checkSupabaseConnection().then(() => {
  console.log('\n🏁 Verificación completada');
}).catch(error => {
  console.log('💥 Error durante la verificación:', error.message);
});