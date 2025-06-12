import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock data for cursos_materias
const mockCursosMaterias = [
  {
    id: '1',
    nombre: 'Matemáticas Básicas',
    descripcion: 'Curso introductorio de matemáticas',
    categoria: 'Matemáticas',
    archivado: false,
    creado_en: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nombre: 'Historia Universal',
    descripcion: 'Estudio de la historia mundial',
    categoria: 'Historia',
    archivado: false,
    creado_en: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    nombre: 'Química Avanzada',
    descripcion: 'Curso avanzado de química',
    categoria: 'Ciencias',
    archivado: true,
    creado_en: '2024-01-17T10:00:00Z'
  }
];

// Create a mock client for demo purposes when environment variables are missing
const createMockClient = () => {
  console.warn('Supabase environment variables not found. Running in demo mode with local data only.');
  
  let mockData = [...mockCursosMaterias];
  
  const mockQueryBuilder = {
    select: (columns?: string) => mockQueryBuilder,
    eq: (column: string, value: any) => {
      mockQueryBuilder._filters = mockQueryBuilder._filters || [];
      mockQueryBuilder._filters.push({ column, operator: 'eq', value });
      return mockQueryBuilder;
    },
    or: (query: string) => {
      mockQueryBuilder._filters = mockQueryBuilder._filters || [];
      mockQueryBuilder._filters.push({ operator: 'or', query });
      return mockQueryBuilder;
    },
    order: (column: string, options?: any) => {
      mockQueryBuilder._order = { column, ascending: options?.ascending !== false };
      return mockQueryBuilder;
    },
    limit: (count: number) => {
      mockQueryBuilder._limit = count;
      return mockQueryBuilder;
    },
    then: (resolve: (result: any) => void, reject?: (error: any) => void) => {
      // Apply filters
      let filteredData = [...mockData];
      
      if (mockQueryBuilder._filters) {
        for (const filter of mockQueryBuilder._filters) {
          if (filter.operator === 'eq') {
            filteredData = filteredData.filter(item => item[filter.column as keyof typeof item] === filter.value);
          } else if (filter.operator === 'or' && filter.query.includes('ilike')) {
            // Simple search implementation for demo
            const searchTerm = filter.query.match(/%([^%]+)%/)?.[1] || '';
            filteredData = filteredData.filter(item => 
              item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
            );
          }
        }
      }
      
      // Apply ordering
      if (mockQueryBuilder._order) {
        filteredData.sort((a, b) => {
          const aVal = a[mockQueryBuilder._order.column as keyof typeof a];
          const bVal = b[mockQueryBuilder._order.column as keyof typeof b];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return mockQueryBuilder._order.ascending ? comparison : -comparison;
        });
      }
      
      // Apply limit
      if (mockQueryBuilder._limit) {
        filteredData = filteredData.slice(0, mockQueryBuilder._limit);
      }
      
      resolve({ data: filteredData, error: null });
      return Promise.resolve({ data: filteredData, error: null });
    },
    maybeSingle: () => {
      return mockQueryBuilder.then((result: any) => {
        const data = result.data && result.data.length > 0 ? result.data[0] : null;
        return { data, error: null };
      });
    },
    single: () => {
      return mockQueryBuilder.then((result: any) => {
        const data = result.data && result.data.length > 0 ? result.data[0] : null;
        if (!data) {
          return { data: null, error: { message: 'No data found' } };
        }
        return { data, error: null };
      });
    },
    insert: (values: any) => {
      const newItem = Array.isArray(values) ? values[0] : values;
      const item = {
        id: Date.now().toString(),
        ...newItem,
        creado_en: new Date().toISOString()
      };
      mockData.push(item);
      
      return {
        select: () => ({
          single: () => Promise.resolve({ data: item, error: null })
        })
      };
    },
    update: (values: any) => {
      return {
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => {
              const index = mockData.findIndex(item => item[column as keyof typeof item] === value);
              if (index !== -1) {
                mockData[index] = { ...mockData[index], ...values };
                return Promise.resolve({ data: mockData[index], error: null });
              }
              return Promise.resolve({ data: null, error: { message: 'Item not found' } });
            }
          })
        })
      };
    },
    delete: () => ({
      eq: (column: string, value: any) => {
        const index = mockData.findIndex(item => item[column as keyof typeof item] === value);
        if (index !== -1) {
          mockData.splice(index, 1);
        }
        return Promise.resolve({ error: null });
      }
    }),
    _filters: [] as any[],
    _order: null as any,
    _limit: null as number | null
  };

  return {
    isMock: true, // Flag to identify mock client
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Demo mode - use demo accounts' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table: string) => {
      // Reset filters for each new query
      const newQueryBuilder = { ...mockQueryBuilder };
      newQueryBuilder._filters = [];
      newQueryBuilder._order = null;
      newQueryBuilder._limit = null;
      return newQueryBuilder;
    },
    channel: (channelName: string) => ({
      on: (event: string, config: any, callback: (payload: any) => void) => ({
        subscribe: () => ({
          unsubscribe: () => console.log('Mock subscription unsubscribed')
        })
      })
    })
  };
};

// Initialize Supabase client or mock client
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Database types
interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';
          phone: string | null;
          status: 'ACTIVE' | 'INACTIVE';
          createdAt: string;
          updatedAt: string;
          profile_image: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';
          phone?: string | null;
          status?: 'ACTIVE' | 'INACTIVE';
          createdAt?: string;
          updatedAt?: string;
          profile_image?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';
          phone?: string | null;
          status?: 'ACTIVE' | 'INACTIVE';
          createdAt?: string;
          updatedAt?: string;
          profile_image?: string | null;
        };
      };
      family_connections: {
        Row: {
          id: string;
          parent_id: string;
          student_id: string;
          relationship_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          student_id: string;
          relationship_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          student_id?: string;
          relationship_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}