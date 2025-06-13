import { createClient } from '@supabase/supabase-js';
import { env, validateEnv } from './env';

// Validate environment variables
const hasValidEnv = validateEnv();

// Create Supabase client
export const supabase = hasValidEnv 
  ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  : null;

// Database types for TypeScript
export interface CursoMateria {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  archivado: boolean;
  creado_en: string;
}

export interface CreateCursoMateria {
  nombre: string;
  descripcion?: string;
  categoria: string;
}

export interface UpdateCursoMateria {
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  archivado?: boolean;
}

// Helper function to check if Supabase is available
export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}