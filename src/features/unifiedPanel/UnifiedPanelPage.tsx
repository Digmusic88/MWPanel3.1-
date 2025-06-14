import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Save, Trash2, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useGroups } from '../../context/GroupsContext';

interface UnifiedItem {
  id: string;
  name: string;
  description?: string;
  level_id?: string;
  level_name?: string;
  created_at: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function UnifiedPanelPage() {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level_id: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get educational levels from GroupsContext
  const { levels } = useGroups();

  // Load items on component mount
  useEffect(() => {
    loadItems();
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

  const loadItems = async () => {
    try {
      setLoading(true);
      
      // Check if we're using the mock client
      if ((supabase as any).isMock) {
        // Use demo data when in mock mode
        const mockItems: UnifiedItem[] = [
          {
            id: '1',
            name: 'Matemáticas Básicas',
            description: 'Curso básico de matemáticas',
            level_id: 'level-1',
            level_name: 'Educación Primaria',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Historia Universal',
            description: 'Curso de historia mundial',
            level_id: 'level-2',
            level_name: 'Educación Secundaria',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Física Avanzada',
            description: 'Curso avanzado de física',
            level_id: 'level-2',
            level_name: 'Educación Secundaria',
            created_at: new Date().toISOString()
          }
        ];
        setItems(mockItems);
        setLoading(false);
        return;
      }

      // Fetch real data from Supabase
      const { data, error } = await supabase
        .from('cursos_materias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading items:', error);
        showNotification('error', 'Error al cargar los datos');
        // Fall back to empty array
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error in loadItems:', error);
      showNotification('error', 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleCreateItem = () => {
    setFormMode('create');
    setSelectedItem(null);
    setFormData({
      name: '',
      description: '',
      level_id: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEditItem = (item: UnifiedItem) => {
    setFormMode('edit');
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      level_id: item.level_id || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }

    if (!formData.level_id) {
      errors.level_id = 'El nivel educativo es obligatorio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Find the selected level to get its name
      const selectedLevel = levels.find(level => level.id === formData.level_id);
      const level_name = selectedLevel ? selectedLevel.name : '';
      
      if (formMode === 'create') {
        // Check if we're using the mock client
        if ((supabase as any).isMock) {
          // Create a mock item
          const newItem: UnifiedItem = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            level_id: formData.level_id,
            level_name,
            created_at: new Date().toISOString()
          };
          setItems(prev => [newItem, ...prev]);
          showNotification('success', 'Elemento creado exitosamente');
        } else {
          // Create a real item in Supabase
          const { data, error } = await supabase
            .from('cursos_materias')
            .insert([{
              nombre: formData.name,
              descripcion: formData.description,
              nivel_id: formData.level_id,
              nivel_nombre: level_name
            }])
            .select();

          if (error) {
            console.error('Error creating item:', error);
            showNotification('error', `Error al crear: ${error.message}`);
            return;
          }

          showNotification('success', 'Elemento creado exitosamente');
          await loadItems(); // Reload items to get the new one
        }
      } else if (selectedItem) {
        // Check if we're using the mock client
        if ((supabase as any).isMock) {
          // Update the mock item
          setItems(prev => prev.map(item => 
            item.id === selectedItem.id 
              ? { 
                  ...item, 
                  name: formData.name, 
                  description: formData.description,
                  level_id: formData.level_id,
                  level_name
                } 
              : item
          ));
          showNotification('success', 'Elemento actualizado exitosamente');
        } else {
          // Update the real item in Supabase
          const { error } = await supabase
            .from('cursos_materias')
            .update({
              nombre: formData.name,
              descripcion: formData.description,
              nivel_id: formData.level_id,
              nivel_nombre: level_name
            })
            .eq('id', selectedItem.id);

          if (error) {
            console.error('Error updating item:', error);
            showNotification('error', `Error al actualizar: ${error.message}`);
            return;
          }

          showNotification('success', 'Elemento actualizado exitosamente');
          await loadItems(); // Reload items to get the updated one
        }
      }
      
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Error saving item:', error);
      showNotification('error', error.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // Check if we're using the mock client
      if ((supabase as any).isMock) {
        // Delete the mock item
        setItems(prev => prev.filter(item => item.id !== id));
        showNotification('success', 'Elemento eliminado exitosamente');
      } else {
        // Delete the real item from Supabase
        const { error } = await supabase
          .from('cursos_materias')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting item:', error);
          showNotification('error', `Error al eliminar: ${error.message}`);
          return;
        }

        showNotification('success', 'Elemento eliminado exitosamente');
        await loadItems(); // Reload items to reflect the deletion
      }
    } catch (error: any) {
      console.error('Error deleting item:', error);
      showNotification('error', error.message || 'Error al eliminar');
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.level_name && item.level_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className={`flex-shrink-0 ${
                notification.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Unificado</h1>
          <p className="text-gray-600">Gestión unificada de grupos, niveles, cursos y materias</p>
        </div>
        <button
          onClick={handleCreateItem}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Elemento
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o nivel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay elementos disponibles</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'No se encontraron elementos que coincidan con la búsqueda.'
              : 'Comienza creando tu primer elemento.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateItem}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Crear Primer Elemento
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">{item.description || 'Sin descripción'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.level_name || 'Sin nivel'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Editar elemento"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Eliminar elemento"
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
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-semibold text-gray-900">
                {formMode === 'create' ? 'Crear Nuevo Elemento' : 'Editar Elemento'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nombre del elemento"
                    disabled={isSubmitting}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel Educativo *
                  </label>
                  <select
                    value={formData.level_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, level_id: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.level_id ? 'border-red-500' : 'border-gray-300'
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
                  {formErrors.level_id && <p className="text-red-500 text-sm mt-1">{formErrors.level_id}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Descripción opcional..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
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
                  <span>{isSubmitting ? 'Guardando...' : formMode === 'create' ? 'Crear' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}