import React, { useState } from 'react';
import { X, BookOpen, FileText, Tag, Users, GraduationCap, Clock, MapPin } from 'lucide-react';
import { Subject, SubjectLevel, SubjectGroup, ClassSchedule } from '../../../types/subjects';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  teachers: Array<{ id: string; name: string; email: string }>;
}

interface FormData {
  name: string;
  description: string;
  code: string;
  department: string;
  credits: number;
  color: string;
  levels: Omit<SubjectLevel, 'id'>[];
  groups: Omit<SubjectGroup, 'id' | 'currentStudents' | 'students'>[];
}

const DEPARTMENTS = [
  'Ciencias Exactas',
  'Humanidades',
  'Tecnología',
  'Ciencias Sociales',
  'Artes',
  'Deportes'
];

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
  '#EC4899', '#6366F1', '#14B8A6', '#F59E0B'
];

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

export default function AddSubjectModal({ isOpen, onClose, onSubmit, teachers }: AddSubjectModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    code: '',
    department: DEPARTMENTS[0],
    credits: 3,
    color: COLORS[0],
    levels: [
      {
        name: 'Básico',
        description: 'Nivel básico de la materia',
        order: 1,
        requirements: [],
        maxStudents: 30,
        currentStudents: 0
      }
    ],
    groups: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'levels' | 'groups'>('basic');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    }

    if (formData.credits < 1 || formData.credits > 10) {
      newErrors.credits = 'Los créditos deben estar entre 1 y 10';
    }

    if (formData.levels.length === 0) {
      newErrors.levels = 'Debe tener al menos un nivel';
    }

    // Validate levels
    formData.levels.forEach((level, index) => {
      if (!level.name.trim()) {
        newErrors[`level_${index}_name`] = 'El nombre del nivel es obligatorio';
      }
      if (level.maxStudents < 1 || level.maxStudents > 50) {
        newErrors[`level_${index}_maxStudents`] = 'La capacidad debe estar entre 1 y 50';
      }
    });

    // Validate groups
    formData.groups.forEach((group, index) => {
      if (!group.name.trim()) {
        newErrors[`group_${index}_name`] = 'El nombre del grupo es obligatorio';
      }
      if (!group.teacherId) {
        newErrors[`group_${index}_teacher`] = 'Debe asignar un profesor';
      }
      if (group.maxStudents < 1 || group.maxStudents > 50) {
        newErrors[`group_${index}_maxStudents`] = 'La capacidad debe estar entre 1 y 50';
      }
    });

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
      
      const subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        code: formData.code.trim().toUpperCase(),
        department: formData.department,
        credits: formData.credits,
        color: formData.color,
        isActive: true,
        levels: formData.levels.map((level, index) => ({
          ...level,
          id: `level-${Date.now()}-${index}`,
          name: level.name.trim(),
          description: level.description.trim()
        })),
        groups: formData.groups.map((group, index) => {
          const teacher = teachers.find(t => t.id === group.teacherId);
          return {
            ...group,
            id: `group-${Date.now()}-${index}`,
            name: group.name.trim(),
            teacherName: teacher?.name,
            currentStudents: 0,
            students: []
          };
        })
      };

      await onSubmit(subjectData);
      handleClose();
    } catch (error) {
      console.error('Error creating subject:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      code: '',
      department: DEPARTMENTS[0],
      credits: 3,
      color: COLORS[0],
      levels: [
        {
          name: 'Básico',
          description: 'Nivel básico de la materia',
          order: 1,
          requirements: [],
          maxStudents: 30,
          currentStudents: 0
        }
      ],
      groups: []
    });
    setErrors({});
    setActiveTab('basic');
    onClose();
  };

  const addLevel = () => {
    setFormData(prev => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          name: '',
          description: '',
          order: prev.levels.length + 1,
          requirements: [],
          maxStudents: 30,
          currentStudents: 0
        }
      ]
    }));
  };

  const removeLevel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index)
    }));
  };

  const updateLevel = (index: number, field: keyof SubjectLevel, value: any) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.map((level, i) => 
        i === index ? { ...level, [field]: value } : level
      )
    }));
  };

  const addGroup = () => {
    setFormData(prev => ({
      ...prev,
      groups: [
        ...prev.groups,
        {
          name: `Grupo ${String.fromCharCode(65 + prev.groups.length)}`,
          levelId: prev.levels[0]?.name || '',
          teacherId: '',
          teacherName: '',
          schedule: [],
          maxStudents: 25
        }
      ]
    }));
  };

  const removeGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index)
    }));
  };

  const updateGroup = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, i) => 
        i === index ? { ...group, [field]: value } : group
      )
    }));
  };

  const addScheduleToGroup = (groupIndex: number) => {
    const newSchedule: ClassSchedule = {
      id: `schedule-${Date.now()}`,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:30',
      classroom: ''
    };

    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, i) => 
        i === groupIndex 
          ? { ...group, schedule: [...group.schedule, newSchedule] }
          : group
      )
    }));
  };

  const removeScheduleFromGroup = (groupIndex: number, scheduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, i) => 
        i === groupIndex 
          ? { ...group, schedule: group.schedule.filter((_, si) => si !== scheduleIndex) }
          : group
      )
    }));
  };

  const updateGroupSchedule = (groupIndex: number, scheduleIndex: number, field: keyof ClassSchedule, value: any) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, i) => 
        i === groupIndex 
          ? {
              ...group,
              schedule: group.schedule.map((schedule, si) =>
                si === scheduleIndex ? { ...schedule, [field]: value } : schedule
              )
            }
          : group
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-900">Nueva Materia</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'basic', label: 'Información Básica', icon: BookOpen },
              { id: 'levels', label: 'Niveles', icon: GraduationCap },
              { id: 'groups', label: 'Grupos', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      Nombre de la Materia *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Matemáticas Avanzadas"
                      disabled={isSubmitting}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-4 h-4 inline mr-2" />
                      Código *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.code ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: MAT101"
                      disabled={isSubmitting}
                    />
                    {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={isSubmitting}
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Créditos *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.credits}
                      onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) || 1 }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.credits ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.credits && <p className="text-red-500 text-sm mt-1">{errors.credits}</p>}
                  </div>
                </div>

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
                    placeholder="Descripción detallada de la materia..."
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color de Identificación
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Levels Tab */}
            {activeTab === 'levels' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Niveles de la Materia</h3>
                  <button
                    type="button"
                    onClick={addLevel}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    Agregar Nivel
                  </button>
                </div>

                {formData.levels.map((level, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Nivel {index + 1}</h4>
                      {formData.levels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLevel(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Nivel *
                        </label>
                        <input
                          type="text"
                          value={level.name}
                          onChange={(e) => updateLevel(index, 'name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`level_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Básico, Intermedio, Avanzado"
                          disabled={isSubmitting}
                        />
                        {errors[`level_${index}_name`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`level_${index}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capacidad Máxima *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={level.maxStudents}
                          onChange={(e) => updateLevel(index, 'maxStudents', parseInt(e.target.value) || 1)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`level_${index}_maxStudents`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors[`level_${index}_maxStudents`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`level_${index}_maxStudents`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={level.description}
                        onChange={(e) => updateLevel(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Descripción del nivel..."
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                ))}

                {errors.levels && <p className="text-red-500 text-sm">{errors.levels}</p>}
              </div>
            )}

            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Grupos de la Materia</h3>
                  <button
                    type="button"
                    onClick={addGroup}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={isSubmitting || formData.levels.length === 0}
                  >
                    Agregar Grupo
                  </button>
                </div>

                {formData.levels.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Primero debe crear al menos un nivel en la pestaña anterior</p>
                  </div>
                )}

                {formData.groups.map((group, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Grupo {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeGroup(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Grupo *
                        </label>
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => updateGroup(index, 'name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`group_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors[`group_${index}_name`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`group_${index}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nivel *
                        </label>
                        <select
                          value={group.levelId}
                          onChange={(e) => updateGroup(index, 'levelId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isSubmitting}
                        >
                          <option value="">Seleccionar nivel</option>
                          {formData.levels.map((level, levelIndex) => (
                            <option key={levelIndex} value={level.name}>{level.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profesor *
                        </label>
                        <select
                          value={group.teacherId}
                          onChange={(e) => updateGroup(index, 'teacherId', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`group_${index}_teacher`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={isSubmitting}
                        >
                          <option value="">Seleccionar profesor</option>
                          {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>
                        {errors[`group_${index}_teacher`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`group_${index}_teacher`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidad Máxima *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={group.maxStudents}
                        onChange={(e) => updateGroup(index, 'maxStudents', parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`group_${index}_maxStudents`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors[`group_${index}_maxStudents`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`group_${index}_maxStudents`]}</p>
                      )}
                    </div>

                    {/* Schedule */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Horarios
                        </label>
                        <button
                          type="button"
                          onClick={() => addScheduleToGroup(index)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          disabled={isSubmitting}
                        >
                          + Agregar Horario
                        </button>
                      </div>

                      {group.schedule.map((schedule, scheduleIndex) => (
                        <div key={scheduleIndex} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                          <div>
                            <select
                              value={schedule.dayOfWeek}
                              onChange={(e) => updateGroupSchedule(index, scheduleIndex, 'dayOfWeek', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              disabled={isSubmitting}
                            >
                              {DAYS_OF_WEEK.map(day => (
                                <option key={day.value} value={day.value}>{day.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) => updateGroupSchedule(index, scheduleIndex, 'startTime', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) => updateGroupSchedule(index, scheduleIndex, 'endTime', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={schedule.classroom}
                              onChange={(e) => updateGroupSchedule(index, scheduleIndex, 'classroom', e.target.value)}
                              placeholder="Aula"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => removeScheduleFromGroup(index, scheduleIndex)}
                              className="w-full px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                              disabled={isSubmitting}
                            >
                              <X className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            <span>{isSubmitting ? 'Creando...' : 'Crear Materia'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}