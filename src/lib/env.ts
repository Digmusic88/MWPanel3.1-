// Configuración de variables de entorno para Supabase
export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
} as const;

// Validar que las variables de entorno estén configuradas
export function validateEnv() {
  const missing = [];
  
  if (!env.SUPABASE_URL) {
    missing.push('VITE_SUPABASE_URL');
  }
  
  if (!env.SUPABASE_ANON_KEY) {
    missing.push('VITE_SUPABASE_ANON_KEY');
  }
  
  if (missing.length > 0) {
    console.warn(
      `⚠️ Variables de entorno faltantes: ${missing.join(', ')}\n` +
      'La aplicación funcionará en modo demo con datos locales.'
    );
    return false;
  }
  
  return true;
}