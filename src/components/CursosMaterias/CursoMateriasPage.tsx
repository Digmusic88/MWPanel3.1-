import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Archive, 
  ArchiveRestore,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Loader2,
  Download
} from 'lucide-react';
import { CursosMateriasService, CursoMateria } from '../../services/cursosMateriasService';
import CursoMateriasForm from './CursoMateriasForm';
import CursoMateriasCard from './CursoMateriasCard';
import CursoMateriasTable from './CursoMateriasTable';

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

const CATEGORIAS = [
  'Ciencias',
  'Humanidades', 
  'Tecnología',
  'Ciencias Sociales',
  'Artes',
  'Deportes'
];

export default function CursoMateriasPage() {
  const [cursos, setCursos] = useState<CursoMateria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  
  // Estados del formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCurso, setSelectedCurso] = useState<CursoMateria | null>(null);
  
  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Cargar datos iniciales
  useEffect(() => {
    loadCursos();
    
    // Suscribirse a cambios en tiempo real
    const subscription = CursosMateriasService.subscribeToChanges((payload) => {
      console.log('Cambio en tiempo real:', payload);
      loadCursos(); // Recargar datos cuando hay cambios
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [showArchived]);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadCursos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = showArchived 
        ? await CursosMateriasService.getArchivados()
        : await CursosMateriasService.getActivos();
      
      setCursos(data);
    } catch (err: any) {
      console.error('Error loading cursos:', err);
      setError(err.message || 'Error al cargar los cursos');
      showNotification('error', 'Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  const handleCreateCurso = () => {
    setFormMode('create');
    setSelectedCurso(null);
    setIsFormOpen(true);
  };

  const handleEditCurso = (curso: CursoMateria) => {
    setFormMode('edit');
    setSelectedCurso(curso);
    setIsFormOpen(true);
  };

  const handleSaveCurso = async (cursoData: any) => {
    try {
      if (formMode === 'create') {
        await CursosMateriasService.create(cursoData);
        showNotification('success', 'Curso creado exitosamente');
      } else if (selectedCurso) {
        await CursosMateriasService.update(selectedCurso.id, cursoData);
        showNotification('success', 'Curso actualizado exitosamente');
      }
      
      setIsFormOpen(false);
      await loadCursos();
    } catch (error: any) {
      console.error('Error saving curso:', error);
      showNotification('error', error.message || 'Error al guardar el curso');
    }
  };

  const handleDeleteCurso = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el curso "${nombre}"? Esta acción no se puede deshacer.`)) {
      try {
        await CursosMateriasService.delete(id);
        showNotification('success', 'Curso eliminado exitosamente');
        await loadCursos();
      } catch (error: any) {
        console.error('Error deleting curso:', error);
        showNotification('error', error.message || 'Error al eliminar el curso');
      }
    }
  };

  const handleArchivarCurso = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres archivar el curso "${nombre}"?`)) {
      try {
        await CursosMateriasService.archivar(id);
        showNotification('success', 'Curso archivado exitosamente');
        await loadCursos();
      } catch (error: any) {
        console.error('Error archiving curso:', error);
        showNotification('error', error.message || 'Error al archivar el curso');
      }
    }
  };

  const handleDesarchivarCurso = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres desarchivar el curso "${nombre}"?`)) {
      try {
        await CursosMateriasService.desarchivar(id);
        showNotification('success', 'Curso desarchivado exitosamente');
        await loadCursos();
      } catch (error: any) {
        console.error('Error unarchiving curso:', error);
        showNotification('error', error.message || 'Error al desarchivar el curso');
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadCursos();
      return;
    }

    try {
      setLoading(true);
      const results = await CursosMateriasService.search(searchQuery);
      setCursos(results.filter(curso => 
        showArchived ? curso.archivado : !curso.archivado
      ));
    } catch (error: any) {
      console.error('Error searching:', error);
      showNotification('error', 'Error al buscar cursos');
    } finally {
      setLoading(false);
    }
  };

  const exportCursos = () => {
    const csvContent = [
      ['Nombre', 'Categoría', 'Descripción', 'Estado', 'Fecha Creación'],
      ...filteredCursos.map(curso => [
        `"${curso.nombre}"`,
        `"${curso.categoria}"`,
        `"${curso.descripcion || ''}"`,
        curso.archivado ? 'Archivado' : 'Activo',
        new Date(curso.creado_en).toLocaleDateString('es-ES')
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cursos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', 'Archivo CSV exportado exitosamente');
  };

  // Filtrar cursos
  const filteredCursos = cursos.filter(curso => {
    if (categoriaFilter !== 'all' && curso.categoria !== categoriaFilter) {
      return false;
    }
    return true;
  });

  // Estadísticas
  const stats = {
    total: cursos.length,
    categorias: cursos.reduce((acc, curso) => {
      acc[curso.categoria] = (acc[curso.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6 relative">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {notification.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' :
                notification.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className={`flex-shrink-0 ${
                notification.type === 'success' ? 'text-green-600 hover:text-green-800' :
                notification.type === 'error' ? 'text-red-600 hover:text-red-800' :
                'text-blue-600 hover:text-blue-800'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showArchived ? 'Cursos Archivados' : 'Cursos y Materias'}
          </h1>
          <p className="text-gray-600 mt-1">
            {showArchived 
              ? 'Administra los cursos archivados del sistema'
              : 'Administra los cursos y materias académicas'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowArchived(!showArchived);
              setSearchQuery('');
              setCategoriaFilter('all');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showArchived
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showArchived ? (
              <>
                <ArchiveRestore className="h-4 w-4 inline mr-2" />
                Ver Activos
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 inline mr-2" />
                Ver Archivados
              </>
            )}
          </button>
          {!showArchived && (
            <button
              onClick={handleCreateCurso}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Curso
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cursos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        {Object.entries(stats.categorias).slice(0, 3).map(([categoria, count]) => (
          <div key={categoria} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{categoria}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </div>
        ))}
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
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {CATEGORIAS.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>

            <button
              onClick={exportCursos}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mt-4 flex justify-end">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Tarjetas</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Tabla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando cursos...</span>
        </div>
      ) : filteredCursos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showArchived ? 'No hay cursos archivados' : 'No hay cursos disponibles'}
          </h3>
          <p className="text-gray-600 mb-6">
            {showArchived 
              ? 'No se encontraron cursos archivados que coincidan con los filtros aplicados.'
              : searchQuery || categoriaFilter !== 'all'
                ? 'No se encontraron cursos que coincidan con los filtros aplicados.'
                : 'Comienza creando tu primer curso académico.'
            }
          </p>
          {!showArchived && !searchQuery && categoriaFilter === 'all' && (
            <button
              onClick={handleCreateCurso}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Crear Primer Curso
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCursos.map(curso => (
            <CursoMateriasCard
              key={curso.id}
              curso={curso}
              onEdit={handleEditCurso}
              onDelete={handleDeleteCurso}
              onArchivar={handleArchivarCurso}
              onDesarchivar={handleDesarchivarCurso}
              showArchived={showArchived}
            />
          ))}
        </div>
      ) : (
        <CursoMateriasTable
          cursos={filteredCursos}
          onEdit={handleEditCurso}
          onDelete={handleDeleteCurso}
          onArchivar={handleArchivarCurso}
          onDesarchivar={handleDesarchivarCurso}
          showArchived={showArchived}
        />
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <CursoMateriasForm
          mode={formMode}
          curso={selectedCurso}
          onSubmit={handleSaveCurso}
          onCancel={() => setIsFormOpen(false)}
          categorias={CATEGORIAS}
        />
      )}
    </div>
  );
}