import React, { useState, useEffect } from 'react';
import { X, Users, Search, UserPlus, UserMinus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSubjects } from '../../../context/SubjectsContext';
import { useUsers } from '../../../context/UsersContext';
import { Subject, SubjectGroup, SubjectLevel } from '../../../types/subjects';
import { User } from '../../../types';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  level: SubjectLevel;
  group: SubjectGroup;
  onStudentsUpdated?: () => void;
}

export default function StudentManagementModal({
  isOpen,
  onClose,
  subject,
  level,
  group,
  onStudentsUpdated
}: StudentManagementModalProps) {
  const { 
    enrollments, 
    enrollStudent, 
    removeStudent, 
    getEnrollmentsBySubject 
  } = useSubjects();
  
  const { getUsersByRole } = useUsers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const students = getUsersByRole('student').filter(s => s.isActive);
  
  // Get current enrollments for this group
  const groupEnrollments = getEnrollmentsBySubject(subject.id).filter(
    e => e.groupId === group.id && e.status === 'active'
  );
  
  const enrolledStudentIds = groupEnrollments.map(e => e.studentId);
  const availableStudents = students.filter(s => !enrolledStudentIds.includes(s.id));

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) return;

    // Check capacity
    const remainingCapacity = group.maxStudents - group.currentStudents;
    if (selectedStudents.length > remainingCapacity) {
      showNotification('error', `Solo quedan ${remainingCapacity} espacios disponibles en el grupo`);
      return;
    }

    try {
      setIsProcessing(true);
      
      for (const studentId of selectedStudents) {
        await enrollStudent(studentId, subject.id, level.id, group.id, 'Inscripción manual desde modal de gestión');
      }
      
      showNotification('success', `${selectedStudents.length} estudiante(s) inscrito(s) exitosamente`);
      setSelectedStudents([]);
      onStudentsUpdated?.();
    } catch (error: any) {
      console.error('Error enrolling students:', error);
      showNotification('error', error.message || 'Error al inscribir estudiantes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres remover a ${studentName} del grupo?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      await removeStudent(studentId, subject.id, 'Removido desde modal de gestión');
      showNotification('success', `${studentName} removido exitosamente`);
      onStudentsUpdated?.();
    } catch (error: any) {
      console.error('Error removing student:', error);
      showNotification('error', error.message || 'Error al remover estudiante');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllVisible = () => {
    const visibleStudents = filteredAvailableStudents.map(s => s.id);
    const remainingCapacity = group.maxStudents - group.currentStudents;
    const toSelect = visibleStudents.slice(0, remainingCapacity);
    setSelectedStudents(toSelect);
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  const filteredAvailableStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.grade && student.grade.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const enrolledStudents = students.filter(s => enrolledStudentIds.includes(s.id));

  if (!isOpen) return null;

  const remainingCapacity = group.maxStudents - group.currentStudents;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestionar Estudiantes</h2>
            <p className="text-sm text-gray-600 mt-1">
              {subject.name} - {level.name} - {group.name}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="text-gray-600">
                Capacidad: {group.currentStudents}/{group.maxStudents}
              </span>
              <span className="text-blue-600">
                Espacios disponibles: {remainingCapacity}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`p-4 border-b ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enrolled Students */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Estudiantes Inscritos ({enrolledStudents.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {enrolledStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay estudiantes inscritos</p>
                  </div>
                ) : (
                  enrolledStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                          {student.grade && (
                            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded mt-1 inline-block">
                              {student.grade}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student.id, student.name)}
                        disabled={isProcessing}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Remover del grupo"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Students */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                  Estudiantes Disponibles ({filteredAvailableStudents.length})
                </h3>
                {filteredAvailableStudents.length > 0 && remainingCapacity > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={selectAllVisible}
                      disabled={isProcessing}
                      className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      Seleccionar visibles
                    </button>
                    {selectedStudents.length > 0 && (
                      <button
                        onClick={clearSelection}
                        disabled={isProcessing}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        Limpiar ({selectedStudents.length})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar estudiantes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isProcessing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* Capacity Warning */}
              {remainingCapacity === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Grupo completo - No se pueden agregar más estudiantes
                    </span>
                  </div>
                </div>
              )}

              {/* Available Students List */}
              <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {filteredAvailableStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>
                      {searchQuery 
                        ? 'No se encontraron estudiantes' 
                        : 'No hay estudiantes disponibles'
                      }
                    </p>
                  </div>
                ) : (
                  filteredAvailableStudents.map(student => {
                    const isSelected = selectedStudents.includes(student.id);
                    const isDisabled = remainingCapacity === 0 || isProcessing;
                    
                    return (
                      <div 
                        key={student.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isDisabled && toggleStudentSelection(student.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && toggleStudentSelection(student.id)}
                            disabled={isDisabled}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                            {student.grade && (
                              <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                                {student.grade}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Enroll Button */}
              {selectedStudents.length > 0 && remainingCapacity > 0 && (
                <div className="mt-4">
                  <button
                    onClick={handleEnrollStudents}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Inscribiendo...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Inscribir {selectedStudents.length} estudiante(s)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Capacidad:</span> {group.currentStudents}/{group.maxStudents} estudiantes
            {selectedStudents.length > 0 && (
              <span className="ml-4 text-blue-600">
                +{selectedStudents.length} seleccionados
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}