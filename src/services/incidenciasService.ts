import { supabase } from '../lib/supabase';

export interface Incidencia {
  id: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

const mockIncidencias: Incidencia[] = [
  {
    id: '1',
    descripcion: 'Fallo de inicio de sesión temporal',
    estado: 'abierta',
    fecha: new Date().toISOString()
  }
];

export class IncidenciasService {
  static async getAll(): Promise<Incidencia[]> {
    // Always return mock data since the incidencias table doesn't exist in the database
    return mockIncidencias;
  }
}