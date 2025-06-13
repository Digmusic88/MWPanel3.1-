import React, { useState, useEffect } from 'react';
import { X, GraduationCap, FileText, Hash, Save } from 'lucide-react';
import { SubjectLevel } from '../../../types/subjects';

interface LevelEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: SubjectLevel;
  onSave: (levelData: Partial<SubjectLevel>) => Promise<void>;
}

export default function LevelEditModal({ isOpen, onClose, level, onSave }: LevelEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxStudents: 30,
    requirements: [] as string[]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (level && isOpen) {
      setFormData({
        name: level.name,
        description: level.description,
        maxStudents: level.maxStudents,
        requirements: level.requirements || []
      });
    }
  }, [level, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del nivel es obligatorio';
    }

    if (formData.maxStudents < 1 || formData.maxStudents > 100) {
      newErrors.maxStudents = 'La capacidad debe estar entre 1 y 100 estudiantes';
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
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        maxStudents: formData.maxStudents,
        requirements: formData.requirements
      });
      onClose();
    } catch (error) {
      console.error('Error saving level:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            Editar Nivel
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre del Nivel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="w-4 h-4 inline mr-2" />
              Nombre del Nivel *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Básico, Intermedio, Avanzado"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Descripción detallada del nivel..."
              disabled={isSubmitting}
            />
          </div>

          {/* Capacidad Máxima */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-2" />
              Capacidad Máxima de Estudiantes *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.maxStudents}
              onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 1 }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.maxStudents ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.maxStudents && <p className="text-red-500 text-sm mt-1">{errors.maxStudents}</p>}
            <p className="text-gray-500 text-sm mt-1">
              Número máximo de estudiantes que pueden estar en este nivel
            </p>
          </div>

          {/* Información Actual */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Información Actual</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Estudiantes actuales:</span>
                <span className="ml-2 text-blue-800">{level.currentStudents}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Orden:</span>
                <span className="ml-2 text-blue-800">{level.order}</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}