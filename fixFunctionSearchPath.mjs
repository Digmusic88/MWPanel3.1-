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
/* 1. Elimina las versiones antiguas (si existieran) */
drop function if exists public.get_current_user_id();
drop function if exists public.get_current_user_role();

/* 2. Crea versiones nuevas con search_path fijo */
create or replace function public.get_current_user_id()
returns text
language sql
security definer                -- mantenemos definer si ya lo necesitabas
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

async function fixFunctionSearchPath() {
  try {
    console.log('🔧 Fixing function search_path...');
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error.message);
      return;
    }
    
    console.log('✅ search_path fijado; warnings resueltos');
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixFunctionSearchPath();