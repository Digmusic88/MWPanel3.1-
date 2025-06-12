import React, { useState, useEffect } from 'react';
import { X, BookOpen, FileText, Tag } from 'lucide-react';
import { CursoMateria } from '../../services/cursosMateriasService';

interface CursoMateriasFormProps {
  mode: 'create' | 'edit';
  curso?: CursoMateria | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  categorias: string[];
}

interface FormData {
  nombre: string;
  descripcion: string;
  categoria: string;
}

export default function CursoMateriasForm({ 
  mode, 
  curso, 
  onSubmit, 
  onCancel, 
  categorias 
}: CursoMateriasFormProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    categoria: categorias[0] || 'Ciencias'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (curso && mode === 'edit') {
      setFormData({
        nombre: curso.nombre,
        descripcion: curso.descripcion || '',
        categoria: curso.categoria
      });
    }
  }, [curso, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es obligatoria';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
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
      await onSubmit({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        categoria: formData.categoria
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Crear Nuevo Curso' : 'Editar Curso'}
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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Nombre del Curso *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Matemáticas Avanzadas"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.nombre.length}/100 caracteres
            </p>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Categoría *
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => handleInputChange('categoria', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.categoria ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.descripcion ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descripción detallada del curso (opcional)..."
              disabled={isSubmitting}
              maxLength={500}
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.descripcion.length}/500 caracteres
            </p>
          </div>

          {/* Preview */}
          {formData.nombre && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</h4>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{formData.nombre}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {formData.categoria}
                  </span>
                </div>
                {formData.descripcion && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {formData.descripcion}
                  </p>
                )}
              </div>
            </div>
          )}

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
              disabled={isSubmitting || !formData.nombre.trim()}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>
                {isSubmitting 
                  ? 'Guardando...' 
                  : mode === 'create' 
                    ? 'Crear Curso' 
                    : 'Guardar Cambios'
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}