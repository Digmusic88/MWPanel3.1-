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
  private static isMock() {
    return (supabase as any).isMock === true;
  }

  static async getAll(): Promise<Incidencia[]> {
    if (this.isMock()) {
      return mockIncidencias;
    }

    try {
      const { data, error } = await supabase
        .from('incidencias')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error fetching incidencias:', error);
        throw new Error(error.message);
      }

      return data as Incidencia[];
    } catch (err) {
      console.error('Service error in getAll:', err);
      throw err;
    }
  }
}
