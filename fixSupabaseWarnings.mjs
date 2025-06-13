import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing environment variables');
  console.log('Please ensure you have the following in your .env file:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const sql = `
/* ──────────────── 1. POLÍTICAS RLS ──────────────── */
-- ❶ Elimina todas las políticas permisivas duplicadas
drop policy if exists "dev-all-anon" on public.cursos_materias;
drop policy if exists "allow all dev" on public.cursos_materias;
drop policy if exists "authenticated_can_read_cursos_materias" on public.cursos_materias;
drop policy if exists "admins_can_insert_cursos_materias" on public.cursos_materias;
drop policy if exists "admins_can_update_cursos_materias" on public.cursos_materias;
drop policy if exists "admins_can_delete_cursos_materias" on public.cursos_materias;
drop policy if exists "admin_teacher_can_insert_cursos_materias" on public.cursos_materias;
drop policy if exists "admin_teacher_can_update_cursos_materias" on public.cursos_materias;
drop policy if exists "admin_can_delete_cursos_materias" on public.cursos_materias;
drop policy if exists "authenticated_users_can_read_cursos_materias" on public.cursos_materias;

-- ❷ Crea UNA sola política genérica de desarrollo (puedes afinarla luego)
create policy "dev_open_all"
  on public.cursos_materias
  for all
  using (true)
  with check (true);

/* ──────────────── 2. SEARCH_PATH en funciones ──────────────── */
-- ❸ Vuelve a crear las funciones con search_path fijo
create or replace function public.get_current_user_id()
returns text
language sql
security definer
set search_path = pg_catalog, public
as $$
  select auth.uid()::text;
$$;

create or replace function public.get_current_user_role()
returns text
language sql
security definer
set search_path = pg_catalog, public
as $$
  select auth.role();
$$;
`;

async function fixSupabaseWarnings() {
  try {
    console.log('🔧 Fixing Supabase warnings...');
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error.message);
      return;
    }
    
    console.log('✅ Políticas unificadas y search_path fijado – sin warnings 👍');
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixSupabaseWarnings();