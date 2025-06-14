import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Archive, 
  ArchiveRestore,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Loader2,
  Download,
  Grid3X3,
  List
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Types
interface UnifiedItem {
  id: string;
  name: string;
  description: string | null;
  type: 'group' | 'course';
  category: string;
  level_id?: string;
  level_name?: string;
  academic_year?: string;
  tutor_id?: string;
  tutor_name?: string;
  max_capacity?: number;
  current_capacity?: number;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at?: string;
}

interface Level {
  id: string;
  name: string;
  description: string | null;
  order_num: number;
  is_active: boolean;
}

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function UnifiedPanelPage() {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'group' | 'course'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load data
  useEffect(() => {
    loadData();
    loadLevels();
  }, []);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load groups from academic_groups table
      const { data: groupsData, error: groupsError } = await supabase
        .from('academic_groups')
        .select(`
          id,
          name,
          description,
          level_id,
          academic_year,
          max_capacity,
          current_capacity,
          tutor_id,
          is_active,
          is_archived,
          created_at,
          updated_at,
          educational_levels(name)
        `)
        .order('created_at', { ascending: false });
      
      if (groupsError) {
        console.error('Error loading groups:', groupsError);
        throw new Error('Error al cargar los grupos académicos');
      }

      // Load courses from cursos_materias table
      const { data: coursesData, error: coursesError } = await supabase
        .from('cursos_materias')
        .select('*')
        .order('creado_en', { ascending: false });
      
      if (coursesError) {
        console.error('Error loading courses:', coursesError);
        throw new Error('Error al cargar los cursos y materias');
      }

      // Transform groups data
      const transformedGroups: UnifiedItem[] = (groupsData || []).map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        type: 'group',
        category: 'Grupo Académico',
        level_id: group.level_id,
        level_name: group.educational_levels?.name || 'Sin nivel',
        academic_year: group.academic_year,
        tutor_id: group.tutor_id,
        tutor_name: 'Pendiente', // We'll need to fetch this separately
        max_capacity: group.max_capacity,
        current_capacity: group.current_capacity,
        is_active: group.is_active,
        is_archived: group.is_archived,
        created_at: group.created_at,
        updated_at: group.updated_at
      }));

      // Transform courses data
      const transformedCourses: UnifiedItem[] = (coursesData || []).map(course => ({
        id: course.id,
        name: course.nombre,
        description: course.descripcion,
        type: 'course',
        category: course.categoria,
        is_active: !course.archivado,
        is_archived: course.archivado,
        created_at: course.creado_en
      }));

      // Combine and set data
      setItems([...transformedGroups, ...transformedCourses]);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
      showNotification('error', err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('educational_levels')
        .select('*')
        .order('order_num', { ascending: true });
      
      if (error) {
        console.error('Error loading levels:', error);
        return;
      }
      
      setLevels(data || []);
    } catch (err) {
      console.error('Error loading levels:', err);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  const handleCreateItem = () => {
    setFormMode('create');
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: UnifiedItem) => {
    setFormMode('edit');
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleSaveItem = async (itemData: any) => {
    try {
      if (formMode === 'create') {
        if (itemData.type === 'group') {
          // Create new academic group
          const { data, error } = await supabase
            .from('academic_groups')
            .insert([{
              name: itemData.name,
              description: itemData.description,
              level_id: itemData.level_id,
              academic_year: itemData.academic_year,
              max_capacity: itemData.max_capacity,
              tutor_id: itemData.tutor_id,
              is_active: itemData.is_active,
              is_archived: false
            }])
            .select();
          
          if (error) throw error;
          showNotification('success', 'Grupo académico creado exitosamente');
        } else {
          // Create new curso_materia
          const { data, error } = await supabase
            .from('cursos_materias')
            .insert([{
              nombre: itemData.name,
              descripcion: itemData.description,
              categoria: itemData.category,
              archivado: !itemData.is_active
            }])
            .select();
          
          if (error) throw error;
          showNotification('success', 'Curso/materia creado exitosamente');
        }
      } else if (selectedItem) {
        if (selectedItem.type === 'group') {
          // Update academic group
          const { error } = await supabase
            .from('academic_groups')
            .update({
              name: itemData.name,
              description: itemData.description,
              level_id: itemData.level_id,
              academic_year: itemData.academic_year,
              max_capacity: itemData.max_capacity,
              tutor_id: itemData.tutor_id,
              is_active: itemData.is_active
            })
            .eq('id', selectedItem.id);
          
          if (error) throw error;
          showNotification('success', 'Grupo académico actualizado exitosamente');
        } else {
          // Update curso_materia
          const { error } = await supabase
            .from('cursos_materias')
            .update({
              nombre: itemData.name,
              descripcion: itemData.description,
              categoria: itemData.category,
              archivado: !itemData.is_active
            })
            .eq('id', selectedItem.id);
          
          if (error) throw error;
          showNotification('success', 'Curso/materia actualizado exitosamente');
        }
      }
      
      setIsFormOpen(false);
      await loadData(); // Reload data
    } catch (error: any) {
      console.error('Error saving item:', error);
      showNotification('error', error.message || 'Error al guardar');
    }
  };

  const handleDeleteItem = async (id: string, type: 'group' | 'course', name: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      if (type === 'group') {
        // Check if group has students
        const { data: assignments, error: checkError } = await supabase
          .from('student_group_assignments')
          .select('id')
          .eq('group_id', id)
          .eq('is_active', true);
        
        if (checkError) throw checkError;
        
        if (assignments && assignments.length > 0) {
          throw new Error('No se puede eliminar un grupo que tiene estudiantes asignados');
        }
        
        // Delete academic group
        const { error } = await supabase
          .from('academic_groups')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        showNotification('success', 'Grupo académico eliminado exitosamente');
      } else {
        // Delete curso_materia
        const { error } = await supabase
          .from('cursos_materias')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        showNotification('success', 'Curso/materia eliminado exitosamente');
      }
      
      await loadData(); // Reload data
    } catch (error: any) {
      console.error('Error deleting item:', error);
      showNotification('error', error.message || 'Error al eliminar');
    }
  };

  const handleToggleArchive = async (id: string, type: 'group' | 'course', isArchived: boolean, name: string) => {
    const action = isArchived ? 'desarchivar' : 'archivar';
    if (!window.confirm(`¿Estás seguro de que quieres ${action} "${name}"?`)) {
      return;
    }

    try {
      if (type === 'group') {
        // Check if group has students before archiving
        if (!isArchived) {
          const { data: assignments, error: checkError } = await supabase
            .from('student_group_assignments')
            .select('id')
            .eq('group_id', id)
            .eq('is_active', true);
          
          if (checkError) throw checkError;
          
          if (assignments && assignments.length > 0) {
            throw new Error('No se puede archivar un grupo que tiene estudiantes asignados');
          }
        }
        
        // Update academic group
        const { error } = await supabase
          .from('academic_groups')
          .update({
            is_archived: !isArchived,
            is_active: isArchived, // When unarchiving, set to active
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        if (error) throw error;
        showNotification('success', `Grupo académico ${isArchived ? 'desarchivado' : 'archivado'} exitosamente`);
      } else {
        // Update curso_materia
        const { error } = await supabase
          .from('cursos_materias')
          .update({
            archivado: !isArchived
          })
          .eq('id', id);
        
        if (error) throw error;
        showNotification('success', `Curso/materia ${isArchived ? 'desarchivado' : 'archivado'} exitosamente`);
      }
      
      await loadData(); // Reload data
    } catch (error: any) {
      console.error('Error toggling archive:', error);
      showNotification('error', error.message || `Error al ${action}`);
    }
  };

  // Filter items
  const getFilteredItems = () => {
    let filtered = items;

    // Filter by archived status
    filtered = filtered.filter(item => item.is_archived === showArchived);

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.level_name && item.level_name.toLowerCase().includes(query)) ||
        (item.tutor_name && item.tutor_name.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query))
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Filter by category (for courses)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.type === 'course' && item.category === categoryFilter
      );
    }

    // Filter by level (for groups)
    if (levelFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.type === 'group' && item.level_id === levelFilter
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        statusFilter === 'active' ? item.is_active : !item.is_active
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Get unique categories from courses
  const categories = Array.from(new Set(
    items
      .filter(item => item.type === 'course')
      .map(item => item.category)
  )).filter(Boolean);

  // Export data
  const exportData = () => {
    const csvContent = [
      ['Nombre', 'Tipo', 'Categoría/Nivel', 'Descripción', 'Estado', 'Fecha Creación'].join(','),
      ...filteredItems.map(item => [
        `"${item.name}"`,
        `"${item.type === 'group' ? 'Grupo Académico' : 'Curso/Materia'}"`,
        `"${item.type === 'group' ? item.level_name : item.category}"`,
        `"${item.description || ''}"`,
        `"${item.is_active ? 'Activo' : 'Inactivo'}"`,
        `"${new Date(item.created_at).toLocaleDateString('es-ES')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `datos_unificados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', 'Archivo CSV exportado exitosamente');
  };

  // Stats
  const stats = {
    total: items.filter(item => !item.is_archived).length,
    groups: items.filter(item => item.type === 'group' && !item.is_archived).length,
    courses: items.filter(item => item.type === 'course' && !item.is_archived).length,
    active: items.filter(item => item.is_active && !item.is_archived).length,
    archived: items.filter(item => item.is_archived).length
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
            {showArchived ? 'Elementos Archivados' : 'Panel Unificado'}
          </h1>
          <p className="text-gray-600 mt-1">
            {showArchived 
              ? 'Administra los grupos y cursos archivados del sistema'
              : 'Gestión unificada de grupos académicos y cursos/materias'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowArchived(!showArchived);
              setSearchQuery('');
              setTypeFilter('all');
              setCategoryFilter('all');
              setLevelFilter('all');
              setStatusFilter('all');
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
              onClick={handleCreateItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Elemento
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Elementos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grupos Académicos</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.groups}</p>
            </div>
            <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cursos y Materias</p>
              <p className="text-2xl font-bold text-purple-600">{stats.courses}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {showArchived ? 'Total Archivados' : 'Elementos Activos'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {showArchived ? stats.archived : stats.active}
              </p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              {showArchived ? (
                <Archive className="h-5 w-5 text-gray-600" />
              ) : (
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              )}
            </div>
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
                placeholder="Buscar por nombre, descripción, nivel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'group' | 'course')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los tipos</option>
              <option value="group">Grupos Académicos</option>
              <option value="course">Cursos y Materias</option>
            </select>

            {typeFilter === 'course' && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            )}

            {typeFilter === 'group' && (
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los niveles</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            )}

            {!showArchived && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            )}

            <button
              onClick={exportData}
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
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm font-medium">Tarjetas</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando datos...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showArchived ? 'No hay elementos archivados' : 'No hay elementos disponibles'}
          </h3>
          <p className="text-gray-600 mb-6">
            {showArchived 
              ? 'No se encontraron elementos archivados que coincidan con los filtros aplicados.'
              : searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || levelFilter !== 'all' || statusFilter !== 'all'
                ? 'No se encontraron elementos que coincidan con los filtros aplicados.'
                : 'Comienza creando tu primer elemento.'
            }
          </p>
          {!showArchived && !searchQuery && typeFilter === 'all' && categoryFilter === 'all' && levelFilter === 'all' && statusFilter === 'all' && (
            <button
              onClick={handleCreateItem}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Crear Primer Elemento
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={handleEditItem}
              onDelete={() => handleDeleteItem(item.id, item.type, item.name)}
              onToggleArchive={() => handleToggleArchive(item.id, item.type, item.is_archived, item.name)}
              showArchived={showArchived}
            />
          ))}
        </div>
      ) : (
        <ItemTable
          items={filteredItems}
          onEdit={handleEditItem}
          onDelete={(id, type, name) => handleDeleteItem(id, type, name)}
          onToggleArchive={(id, type, isArchived, name) => handleToggleArchive(id, type, isArchived, name)}
          showArchived={showArchived}
        />
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <UnifiedItemForm
          mode={formMode}
          item={selectedItem}
          onSubmit={handleSaveItem}
          onCancel={() => setIsFormOpen(false)}
          levels={levels}
        />
      )}
    </div>
  );
}

// Item Card Component
function ItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleArchive, 
  showArchived 
}: { 
  item: UnifiedItem; 
  onEdit: (item: UnifiedItem) => void; 
  onDelete: () => void; 
  onToggleArchive: () => void; 
  showArchived: boolean;
}) {
  const getTypeIcon = () => {
    if (item.type === 'group') return <Users className="w-5 h-5 text-emerald-600" />;
    return <BookOpen className="w-5 h-5 text-purple-600" />;
  };

  const getTypeColor = () => {
    if (item.type === 'group') return 'bg-emerald-100 text-emerald-800';
    return 'bg-purple-100 text-purple-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Ciencias': 'bg-blue-100 text-blue-800',
      'Humanidades': 'bg-purple-100 text-purple-800',
      'Tecnología': 'bg-green-100 text-green-800',
      'Ciencias Sociales': 'bg-yellow-100 text-yellow-800',
      'Artes': 'bg-pink-100 text-pink-800',
      'Deportes': 'bg-orange-100 text-orange-800',
      'Grupo Académico': 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden ${
      item.is_archived ? 'opacity-75' : ''
    }`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center">
              {getTypeIcon()}
              <span className="ml-2">{item.name}</span>
              {item.is_archived && (
                <Archive className="w-4 h-4 ml-2 text-gray-400" />
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor()}`}>
                {item.type === 'group' ? 'Grupo Académico' : 'Curso/Materia'}
              </span>
              {item.type === 'group' && item.level_name && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {item.level_name}
                </span>
              )}
              {item.type === 'course' && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
              )}
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.is_archived 
              ? 'bg-gray-100 text-gray-800' 
              : item.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
          }`}>
            {item.is_archived ? 'Archivado' : item.is_active ? 'Activo' : 'Inactivo'}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {item.description}
          </p>
        )}

        {/* Additional Info */}
        {item.type === 'group' && (
          <div className="space-y-2 text-sm">
            {item.academic_year && (
              <div className="flex items-center text-gray-600">
                <span className="font-medium mr-2">Año académico:</span>
                {item.academic_year}
              </div>
            )}
            {item.max_capacity !== undefined && item.current_capacity !== undefined && (
              <div className="flex items-center text-gray-600">
                <span className="font-medium mr-2">Capacidad:</span>
                {item.current_capacity}/{item.max_capacity}
                <div className="ml-2 w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (item.current_capacity / item.max_capacity) > 0.9 ? 'bg-red-500' :
                      (item.current_capacity / item.max_capacity) > 0.7 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(item.current_capacity / item.max_capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-gray-500 mt-4">
          Creado: {formatDate(item.created_at)}
        </div>
      </div>

      {/* Footer with actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={onToggleArchive}
            className={`p-2 ${
              item.is_archived 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-orange-600 hover:bg-orange-50'
            } rounded-lg transition-all duration-200 transform hover:scale-110`}
            title={item.is_archived ? 'Desarchivar' : 'Archivar'}
          >
            {item.is_archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Item Table Component
function ItemTable({ 
  items, 
  onEdit, 
  onDelete, 
  onToggleArchive, 
  showArchived 
}: { 
  items: UnifiedItem[]; 
  onEdit: (item: UnifiedItem) => void; 
  onDelete: (id: string, type: 'group' | 'course', name: string) => void; 
  onToggleArchive: (id: string, type: 'group' | 'course', isArchived: boolean, name: string) => void; 
  showArchived: boolean;
}) {
  const [sortField, setSortField] = useState<keyof UnifiedItem>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof UnifiedItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'created_at' || sortField === 'updated_at') {
      aValue = new Date(aValue || '').getTime();
      bValue = new Date(bValue || '').getTime();
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center"
                >
                  Nombre
                  {sortField === 'name' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center"
                >
                  Tipo
                  {sortField === 'type' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría/Nivel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('is_active')}
                  className="flex items-center"
                >
                  Estado
                  {sortField === 'is_active' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center"
                >
                  Creado
                  {sortField === 'created_at' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                      {item.type === 'group' ? (
                        <Users className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.type === 'group' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.type === 'group' ? 'Grupo Académico' : 'Curso/Materia'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.type === 'group' ? (
                    <span className="text-sm text-gray-900">{item.level_name}</span>
                  ) : (
                    <span className="text-sm text-gray-900">{item.category}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      item.is_archived ? 'bg-gray-500' : 
                      item.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      item.is_archived ? 'text-gray-600' :
                      item.is_active ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.is_archived ? 'Archivado' : item.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onToggleArchive(item.id, item.type, item.is_archived, item.name)}
                      className={`p-2 ${
                        item.is_archived 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-orange-600 hover:bg-orange-50'
                      } rounded-lg transition-all duration-200 transform hover:scale-110`}
                      title={item.is_archived ? 'Desarchivar' : 'Archivar'}
                    >
                      {item.is_archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => onDelete(item.id, item.type, item.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Unified Item Form Component
function UnifiedItemForm({ 
  mode, 
  item, 
  onSubmit, 
  onCancel,
  levels
}: { 
  mode: 'create' | 'edit'; 
  item: UnifiedItem | null; 
  onSubmit: (data: any) => Promise<void>; 
  onCancel: () => void;
  levels: Level[];
}) {
  const [formData, setFormData] = useState({
    type: 'group',
    name: '',
    description: '',
    category: 'Ciencias',
    level_id: '',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    max_capacity: 30,
    tutor_id: '',
    is_active: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutors, setTutors] = useState<{id: string; name: string}[]>([]);

  // Load tutors (teachers)
  useEffect(() => {
    const loadTutors = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'TEACHER')
          .eq('status', 'ACTIVE');
        
        if (error) throw error;
        setTutors(data || []);
      } catch (err) {
        console.error('Error loading tutors:', err);
        // Fallback to empty array
        setTutors([]);
      }
    };
    
    loadTutors();
  }, []);

  // Initialize form data when editing
  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        type: item.type,
        name: item.name,
        description: item.description || '',
        category: item.category || 'Ciencias',
        level_id: item.level_id || '',
        academic_year: item.academic_year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        max_capacity: item.max_capacity || 30,
        tutor_id: item.tutor_id || '',
        is_active: item.is_active
      });
    } else {
      // Default values for new item
      setFormData({
        type: 'group',
        name: '',
        description: '',
        category: 'Ciencias',
        level_id: levels.length > 0 ? levels[0].id : '',
        academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        max_capacity: 30,
        tutor_id: tutors.length > 0 ? tutors[0].id : '',
        is_active: true
      });
    }
  }, [item, mode, levels, tutors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (formData.type === 'group') {
      if (!formData.level_id) {
        newErrors.level_id = 'Debe seleccionar un nivel educativo';
      }
      
      if (!formData.academic_year.trim()) {
        newErrors.academic_year = 'El año académico es obligatorio';
      }
      
      if (formData.max_capacity < 1 || formData.max_capacity > 100) {
        newErrors.max_capacity = 'La capacidad debe estar entre 1 y 100 estudiantes';
      }
      
      if (!formData.tutor_id) {
        newErrors.tutor_id = 'Debe seleccionar un tutor';
      }
    } else {
      if (!formData.category.trim()) {
        newErrors.category = 'La categoría es obligatoria';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ general: 'Error al guardar. Por favor, intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: 'group' | 'course') => {
    setFormData(prev => ({ ...prev, type }));
    // Clear type-specific errors when changing type
    const newErrors = { ...errors };
    if (type === 'group') {
      delete newErrors.category;
    } else {
      delete newErrors.level_id;
      delete newErrors.academic_year;
      delete newErrors.max_capacity;
      delete newErrors.tutor_id;
    }
    setErrors(newErrors);
  };

  // Categories for courses
  const categories = [
    'Ciencias',
    'Humanidades',
    'Tecnología',
    'Ciencias Sociales',
    'Artes',
    'Deportes'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Crear Nuevo Elemento' : 'Editar Elemento'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {errors.general}
            </div>
          )}

          {/* Type Selection */}
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Elemento *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleTypeChange('group')}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                    formData.type === 'group' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Users className="w-8 h-8 mb-2 text-emerald-600" />
                  <span className="font-medium">Grupo Académico</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('course')}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                    formData.type === 'course' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <BookOpen className="w-8 h-8 mb-2 text-purple-600" />
                  <span className="font-medium">Curso/Materia</span>
                </button>
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={formData.type === 'group' ? "Ej: 10° Grado A" : "Ej: Matemáticas Avanzadas"}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {formData.type === 'group' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel Educativo *
                </label>
                <select
                  value={formData.level_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, level_id: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.level_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar nivel</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
                {errors.level_id && <p className="text-red-500 text-sm mt-1">{errors.level_id}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            )}
          </div>

          {/* Type-specific Fields */}
          {formData.type === 'group' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año Académico *
                </label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.academic_year ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2024-2025"
                  disabled={isSubmitting}
                />
                {errors.academic_year && <p className="text-red-500 text-sm mt-1">{errors.academic_year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad Máxima *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_capacity: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.max_capacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.max_capacity && <p className="text-red-500 text-sm mt-1">{errors.max_capacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutor Responsable *
                </label>
                <select
                  value={formData.tutor_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, tutor_id: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.tutor_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar tutor</option>
                  {tutors.map(tutor => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.name}
                    </option>
                  ))}
                </select>
                {errors.tutor_id && <p className="text-red-500 text-sm mt-1">{errors.tutor_id}</p>}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Descripción detallada..."
              disabled={isSubmitting}
            />
          </div>

          {/* Estado activo */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              disabled={isSubmitting}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Elemento Activo
            </label>
            <span className="text-xs text-gray-500">
              Los elementos inactivos no aparecerán en las asignaciones
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>{isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Elemento' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}