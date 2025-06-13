import { supabase } from '../lib/supabase';

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

// Mock data for demo mode
const mockCursos: CursoMateria[] = [
  {
    id: '1',
    nombre: 'Matemáticas Básicas',
    descripcion: 'Curso introductorio de matemáticas',
    categoria: 'Matemáticas',
    archivado: false,
    creado_en: new Date().toISOString()
  },
  {
    id: '2',
    nombre: 'Historia Universal',
    descripcion: 'Estudio de la historia mundial',
    categoria: 'Historia',
    archivado: false,
    creado_en: new Date().toISOString()
  },
  {
    id: '3',
    nombre: 'Química Avanzada',
    descripcion: 'Curso avanzado de química',
    categoria: 'Ciencias',
    archivado: true,
    creado_en: new Date().toISOString()
  }
];

let mockData = [...mockCursos];

export class CursosMateriasService {
  /**
   * Check if running in mock mode
   */
  private static isMockMode(): boolean {
    return (supabase as any).isMock === true;
  }

  /**
   * Obtener todos los cursos y materias
   */
  static async getAll(): Promise<CursoMateria[]> {
    if (this.isMockMode()) {
      return [...mockData].sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
    }

    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) {
        console.error('Error fetching cursos_materias:', error);
        throw new Error(`Error al obtener cursos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error in getAll:', error);
      throw error;
    }
  }

  /**
   * Obtener cursos por categoría
   */
  static async getByCategoria(categoria: string): Promise<CursoMateria[]> {
    if (this.isMockMode()) {
      return mockData
        .filter(curso => curso.categoria === categoria)
        .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
    }

    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('*')
        .eq('categoria', categoria)
        .order('creado_en', { ascending: false });

      if (error) {
        console.error('Error fetching by categoria:', error);
        throw new Error(`Error al obtener cursos por categoría: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error in getByCategoria:', error);
      throw error;
    }
  }

  /**
   * Obtener cursos activos (no archivados)
   */
  static async getActivos(): Promise<CursoMateria[]> {
    if (this.isMockMode()) {
      return mockData
        .filter(curso => !curso.archivado)
        .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
    }

    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('*')
        .eq('archivado', false)
        .order('creado_en', { ascending: false });

      if (error) {
        console.error('Error fetching active cursos:', error);
        throw new Error(`Error al obtener cursos activos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error in getActivos:', error);
      throw error;
    }
  }

  /**
   * Obtener cursos archivados
   */
  static async getArchivados(): Promise<CursoMateria[]> {
    if (this.isMockMode()) {
      return mockData
        .filter(curso => curso.archivado)
        .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
    }

    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('*')
        .eq('archivado', true)
        .order('creado_en', { ascending: false });

      if (error) {
        console.error('Error fetching archived cursos:', error);
        throw new Error(`Error al obtener cursos archivados: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error in getArchivados:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo curso
   */
  static async create(curso: CreateCursoMateria): Promise<CursoMateria> {
    if (this.isMockMode()) {
      const newCurso: CursoMateria = {
        id: Date.now().toString(),
        nombre: curso.nombre.trim(),
        descripcion: curso.descripcion?.trim() || null,
        categoria: curso.categoria,
        archivado: false,
        creado_en: new Date().toISOString()
      };
      mockData.push(newCurso);
      return newCurso;
    }

    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .insert([{
          nombre: curso.nombre.trim(),
          descripcion: curso.descripcion?.trim() || null,
          categoria: curso.categoria,
          archivado: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating curso:', error);
        throw new Error(`Error al crear curso: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se pudo crear el curso');
      }

      return data;
    } catch (error) {
      console.error('Service error in create:', error);
      throw error;
    }
  }

  /**
   * Actualizar un curso existente
   */
  static async update(id: string, updates: UpdateCursoMateria): Promise<CursoMateria> {
    if (this.isMockMode()) {
      const index = mockData.findIndex(curso => curso.id === id);
      if (index === -1) {
        throw new Error('Curso no encontrado');
      }

      const updatedCurso = { ...mockData[index] };
      
      if (updates.nombre !== undefined) {
        updatedCurso.nombre = updates.nombre.trim();
      }
      if (updates.descripcion !== undefined) {
        updatedCurso.descripcion = updates.descripcion?.trim() || null;
      }
      if (updates.categoria !== undefined) {
        updatedCurso.categoria = updates.categoria;
      }
      if (updates.archivado !== undefined) {
        updatedCurso.archivado = updates.archivado;
      }

      mockData[index] = updatedCurso;
      return updatedCurso;
    }

    try {
      const updateData: any = {};
      
      if (updates.nombre !== undefined) {
        updateData.nombre = updates.nombre.trim();
      }
      if (updates.descripcion !== undefined) {
        updateData.descripcion = updates.descripcion?.trim() || null;
      }
      if (updates.categoria !== undefined) {
        updateData.categoria = updates.categoria;
      }
      if (updates.archivado !== undefined) {
        updateData.archivado = updates.archivado;
      }

      const { data, error } = await supabase
        .from('cursos_materias')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating curso:', error);
        throw new Error(`Error al actualizar curso: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se pudo actualizar el curso');
      }

      return data;
    } catch (error) {
      console.error('Service error in update:', error);
      throw error;
    }
  }

  /**
   * Eliminar un curso permanentemente
   */
  static async delete(id: string): Promise<void> {
    if (this.isMockMode()) {
      const index = mockData.findIndex(curso => curso.id === id);
      if (index === -1) {
        throw new Error('Curso no encontrado');
      }
      mockData.splice(index, 1);
      return;
    }

    try {
      const { error } = await supabase
        .from('cursos_materias')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting curso:', error);
        throw new Error(`Error al eliminar curso: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error in delete:', error);
      throw error;
    }
  }

  /**
   * Archivar un curso
   */
  static async archivar(id: string): Promise<CursoMateria> {
    return this.update(id, { archivado: true });
  }

  /**
   * Desarchivar un curso
   */
  static async desarchivar(id: string): Promise<CursoMateria> {
    return this.update(id, { archivado: false });
  }

  /**
   * Buscar cursos por nombre
   */
  static async search(query: string): Promise<CursoMateria[]> {
    if (this.isMockMode()) {
      const lowerQuery = query.toLowerCase();
      return mockData
        .filter(curso => 
          curso.nombre.toLowerCase().includes(lowerQuery) ||
          (curso.descripcion && curso.descripcion.toLowerCase().includes(lowerQuery))
        )
        .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
    }

    try {
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('*')
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`)
        .order('creado_en', { ascending: false });

      if (error) {
        console.error('Error searching cursos:', error);
        throw new Error(`Error al buscar cursos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error in search:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de cursos
   */
  static async getEstadisticas() {
    if (this.isMockMode()) {
      const todos = mockData;
      const activos = mockData.filter(curso => !curso.archivado);
      const archivados = mockData.filter(curso => curso.archivado);

      const categorias = todos.reduce((acc, curso) => {
        acc[curso.categoria] = (acc[curso.categoria] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: todos.length,
        activos: activos.length,
        archivados: archivados.length,
        categorias
      };
    }

    try {
      const [todos, activos, archivados] = await Promise.all([
        this.getAll(),
        this.getActivos(),
        this.getArchivados()
      ]);

      const categorias = todos.reduce((acc, curso) => {
        acc[curso.categoria] = (acc[curso.categoria] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: todos.length,
        activos: activos.length,
        archivados: archivados.length,
        categorias
      };
    } catch (error) {
      console.error('Service error in getEstadisticas:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a cambios en tiempo real
   */
  static subscribeToChanges(callback: (payload: any) => void) {
    if (this.isMockMode()) {
      // Return a mock subscription object with an unsubscribe method
      return {
        unsubscribe: () => {
          console.log('Mock subscription unsubscribed');
        }
      };
    }

    const subscription = supabase
      .channel('cursos_materias_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cursos_materias'
        },
        callback
      )
      .subscribe();

    return subscription;
  }
}