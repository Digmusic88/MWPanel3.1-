import React, { useEffect, useState } from 'react';
import { ClipboardList, FilePlus, BarChart3, BookOpen, Calendar, Tag, Users, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { CursosMateriasService, CursoMateria } from '../../services/cursosMateriasService';

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<CursoMateria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadClasses();
  }, [user]);

  const loadClasses = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Utilizamos el mismo servicio que usa el panel de administración
      const data = await CursosMateriasService.getActivos();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Ciencias': 'bg-blue-100 text-blue-800 border-blue-200',
      'Humanidades': 'bg-purple-100 text-purple-800 border-purple-200',
      'Tecnología': 'bg-green-100 text-green-800 border-green-200',
      'Ciencias Sociales': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Artes': 'bg-pink-100 text-pink-800 border-pink-200',
      'Deportes': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Obtener categorías únicas para el filtro
  const categories = ['all', ...Array.from(new Set(classes.map(cls => cls.categoria)))];

  // Filtrar clases por búsqueda y categoría
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (cls.descripcion && cls.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || cls.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Clases</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus clases y materias asignadas
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clases</p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estudiantes</p>
              <p className="text-2xl font-bold text-gray-900">142</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximas Clases</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar clases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Cargando clases...</span>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron clases
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCategory !== 'all'
              ? 'No se encontraron clases que coincidan con los filtros aplicados.'
              : 'Aún no tienes clases asignadas. Contacta con el administrador para más información.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(cls => (
            <div
              key={cls.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                      {cls.nombre}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoriaColor(cls.categoria)}`}>
                      <Tag className="w-3 h-3 mr-1" />
                      {cls.categoria}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                {cls.descripcion && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {cls.descripcion}
                  </p>
                )}

                {/* Fecha de creación */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Creado: {formatDate(cls.creado_en)}</span>
                </div>
              </div>

              {/* Footer con acciones */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <button
                    className="flex items-center text-sm px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <ClipboardList className="w-4 h-4 mr-1" /> Lista
                  </button>
                  <button
                    className="flex items-center text-sm px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <FilePlus className="w-4 h-4 mr-1" /> Añadir tarea
                  </button>
                  <button
                    className="flex items-center text-sm px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" /> Progreso
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}