import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, BookOpen, GraduationCap, Filter, Edit, Trash2, X } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useSubjects } from '../../context/SubjectsContext';
import { useUsers } from '../../context/UsersContext';
import SubjectSidebar from './components/SubjectSidebar';
import SubjectTabs from './components/SubjectTabs';
import StudentCard from './components/StudentCard';
import DroppableArea from './components/DroppableArea';
import AddSubjectModal from './components/AddSubjectModal';
import StudentManagementModal from './components/StudentManagementModal';
import LevelEditModal from './components/LevelEditModal';
import { Subject, StudentEnrollment } from '../../types/subjects';
import SubjectForm from './components/SubjectForm';
import { User } from '../../types';

interface DragData {
  studentId: string;
  sourceSubjectId: string;
  sourceLevelId: string;
  sourceGroupId: string;
}

export default function CursosMateriasPage() {
  const { 
    subjects, 
    enrollments, 
    deleteGroup,
    deleteSubject,
    updateSubject,
    updateGroup,
    addSubject,
    enrollStudent, 
    transferStudent, 
    removeStudent, 
    changeLevelStudent,
    updateLevel,
    getEnrollmentsBySubject,
    getAvailableGroups
  } = useSubjects();
  
  const { getUsersByRole, users } = useUsers();
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentManagementModal, setStudentManagementModal] = useState<{
    isOpen: boolean;
    subject?: Subject;
    level?: any;
    group?: any;
  }>({ isOpen: false });
  const [subjectEditModal, setSubjectEditModal] = useState<{
    isOpen: boolean;
    subject?: Subject;
  }>({ isOpen: false });
  const [levelEditModal, setLevelEditModal] = useState<{
    isOpen: boolean;
    subject?: Subject;
    level?: any;
  }>({ isOpen: false });
  const [groupEditModal, setGroupEditModal] = useState<{
    isOpen: boolean;
    subject?: Subject;
    group?: any;
  }>({ isOpen: false });

  const students = getUsersByRole('student');
  const teachers = getUsersByRole('teacher').map(teacher => ({
    id: teacher.id,
    name: teacher.name,
    email: teacher.email
  }));

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

  const handleAddSubject = async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addSubject(subjectData);
      showNotification('success', 'Materia creada exitosamente');
    } catch (error: any) {
      console.error('Error creating subject:', error);
      showNotification('error', error.message || 'Error al crear la materia');
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setSubjectEditModal({
      isOpen: true,
      subject
    });
  };

  const handleUpdateSubject = async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!subjectEditModal.subject) return;
      
      await updateSubject(subjectEditModal.subject.id, subjectData);
      showNotification('success', 'Materia actualizada exitosamente');
      setSubjectEditModal({ isOpen: false });
    } catch (error: any) {
      console.error('Error updating subject:', error);
      showNotification('error', error.message || 'Error al actualizar la materia');
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta materia? Esta acción eliminará todos los grupos y asignaciones asociadas.')) {
      return;
    }

    try {
      await deleteSubject(subjectId);
      
      // Remove from selected subjects and tabs
      setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
      if (activeTab === subjectId) {
        const newSelected = selectedSubjects.filter(id => id !== subjectId);
        setActiveTab(newSelected.length > 0 ? newSelected[0] : '');
      }
      
      showNotification('success', 'Materia eliminada exitosamente');
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      showNotification('error', error.message || 'Error al eliminar la materia');
    }
  };

  const handleEditGroup = (subject: Subject, group: any) => {
    setGroupEditModal({
      isOpen: true,
      subject,
      group
    });
  };

  const handleUpdateGroup = async (groupData: any) => {
    try {
      if (!groupEditModal.subject || !groupEditModal.group) return;
      
      await updateGroup(groupEditModal.subject.id, groupEditModal.group.id, groupData);
      showNotification('success', 'Grupo actualizado exitosamente');
      setGroupEditModal({ isOpen: false });
    } catch (error: any) {
      console.error('Error updating group:', error);
      showNotification('error', error.message || 'Error al actualizar el grupo');
    }
  };

  const handleEditStudents = (subject: Subject, level: any, group: any) => {
    setStudentManagementModal({
      isOpen: true,
      subject,
      level,
      group
    });
  };

  const handleCloseStudentManagement = () => {
    setStudentManagementModal({ isOpen: false });
  };

  const handleEditLevel = (subject: Subject, level: any) => {
    setLevelEditModal({
      isOpen: true,
      subject,
      level
    });
  };

  const handleCloseLevelEdit = () => {
    setLevelEditModal({ isOpen: false });
  };

  const handleDeleteGroup = async (subject: Subject, level: any, group: any) => {
    const groupName = `${group.name} - ${group.teacherName || 'Sin profesor'}`;
    
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el grupo "${groupName}"?\n\nEsta acción no se puede deshacer y se perderán todas las asignaciones de estudiantes.`)) {
      return;
    }

    try {
      // Primero remover todos los estudiantes del grupo
      const groupEnrollments = getStudentEnrollments(subject.id).filter(
        enrollment => enrollment.groupId === group.id && enrollment.status === 'active'
      );

      for (const enrollment of groupEnrollments) {
        await removeStudent(enrollment.studentId, subject.id, 'Grupo eliminado');
      }

      // Luego eliminar el grupo usando deleteGroup del contexto
      await deleteGroup(subject.id, group.id);
      
      showNotification('success', `Grupo "${groupName}" eliminado exitosamente`);
    } catch (error: any) {
      console.error('Error deleting group:', error);
      showNotification('error', error.message || 'Error al eliminar el grupo');
    }
  };

  const handleSubjectSelect = (subjectId: string) => {
    if (!selectedSubjects.includes(subjectId)) {
      const newSelected = [...selectedSubjects, subjectId];
      setSelectedSubjects(newSelected);
      if (!activeTab) {
        setActiveTab(subjectId);
      }
    }
  };

  const handleTabClose = (subjectId: string) => {
    const newSelected = selectedSubjects.filter(id => id !== subjectId);
    setSelectedSubjects(newSelected);
    
    if (activeTab === subjectId) {
      setActiveTab(newSelected.length > 0 ? newSelected[0] : '');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as DragData;
    setActiveDragData(dragData);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragData(null);

    if (!over) return;

    const dragData = active.data.current as DragData;
    const dropData = over.data.current;

    if (!dragData || !dropData) return;

    const { studentId, sourceSubjectId, sourceLevelId, sourceGroupId } = dragData;
    const { subjectId: targetSubjectId, levelId: targetLevelId, groupId: targetGroupId, type } = dropData;

    try {
      if (type === 'remove') {
        await removeStudent(studentId, sourceSubjectId, 'Removido por drag and drop');
        showNotification('success', 'Estudiante removido exitosamente');
      } else if (sourceSubjectId === targetSubjectId) {
        // Same subject, change level/group
        if (sourceLevelId !== targetLevelId || sourceGroupId !== targetGroupId) {
          await changeLevelStudent(studentId, sourceSubjectId, targetLevelId, targetGroupId, 'Reasignado por drag and drop');
          showNotification('success', 'Estudiante reasignado exitosamente');
        }
      } else {
        // Different subject, transfer
        await transferStudent(studentId, sourceGroupId, targetSubjectId, targetLevelId, targetGroupId, 'Transferido por drag and drop');
        showNotification('success', 'Estudiante transferido exitosamente');
      }
    } catch (error: any) {
      console.error('Error in drag and drop:', error);
      showNotification('error', error.message || 'Error al procesar la acción');
    }
  };

  const handleSaveLevel = async (levelData: any) => {
    if (!levelEditModal.subject || !levelEditModal.level) return;

    try {
      await updateLevel(levelEditModal.subject.id, levelEditModal.level.id, levelData);
      showNotification('success', 'Nivel actualizado exitosamente');
      setLevelEditModal({ isOpen: false });
    } catch (error: any) {
      console.error('Error updating level:', error);
      showNotification('error', error.message || 'Error al actualizar el nivel');
    }
  };

  const getActiveSubject = () => {
    return subjects.find(s => s.id === activeTab);
  };

  const getStudentEnrollments = (subjectId: string) => {
    return getEnrollmentsBySubject(subjectId);
  };

  const getStudentById = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSubject = getActiveSubject();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cursos y Materias</h1>
            <p className="text-gray-600">Gestiona las asignaciones de estudiantes a materias y niveles</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Materia</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Materias</p>
                <p className="text-2xl font-bold text-blue-900">{subjects.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Estudiantes Inscritos</p>
                <p className="text-2xl font-bold text-green-900">{enrollments.filter(e => e.status === 'active').length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Niveles Activos</p>
                <p className="text-2xl font-bold text-purple-900">{subjects.reduce((acc, s) => acc + s.levels.length, 0)}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Grupos Totales</p>
                <p className="text-2xl font-bold text-orange-900">{subjects.reduce((acc, s) => acc + s.groups.length, 0)}</p>
              </div>
              <Filter className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-gray-50">
            <SubjectSidebar
              subjects={subjects}
              selectedSubjects={selectedSubjects}
              onSubjectSelect={handleSubjectSelect}
              enrollments={enrollments}
            />
          </div>

          {/* Main Panel */}
          <div className="flex-1 flex flex-col">
            {selectedSubjects.length > 0 && (
              <SubjectTabs
                subjects={subjects.filter(s => selectedSubjects.includes(s.id))}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onTabClose={handleTabClose}
              />
            )}

            <div className="flex-1 overflow-auto">
              {activeSubject ? (
                <div className="p-6">
                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar estudiantes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Subject Content */}
                  <div className="space-y-8">
                    {activeSubject.levels.map(level => (
                      <div key={level.id} className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                          {level.name}
                          <span className="ml-2 text-sm text-gray-500">({level.currentStudents}/{level.maxStudents})</span>
                          <button
                            onClick={() => handleEditLevel(activeSubject, level)}
                            className="ml-auto p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 transform hover:scale-110"
                            title="Editar nivel"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditSubject(activeSubject)}
                            className="ml-2 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 transform hover:scale-110"
                            title="Editar materia"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(activeSubject.id)}
                            className="ml-2 p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 transform hover:scale-110"
                            title="Eliminar materia"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {activeSubject.groups
                            .filter(group => group.levelId === level.id)
                            .map(group => (
                              <DroppableArea
                                key={group.id}
                                subjectId={activeSubject.id}
                                levelId={level.id}
                                groupId={group.id}
                                title={`${group.name} - ${group.teacherName || 'Sin profesor'}`}
                                subtitle={`${group.currentStudents}/${group.maxStudents} estudiantes`}
                                type="group"
                                onEditStudents={() => handleEditStudents(activeSubject, level, group)}
                                onDeleteGroup={() => handleDeleteGroup(activeSubject, level, group)}
                                onEditGroup={() => handleEditGroup(activeSubject, group)}
                              >
                                <div className="space-y-2">
                                  {getStudentEnrollments(activeSubject.id)
                                    .filter(enrollment => 
                                      enrollment.groupId === group.id && 
                                      enrollment.status === 'active' &&
                                      getStudentById(enrollment.studentId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map(enrollment => {
                                      const student = getStudentById(enrollment.studentId);
                                      if (!student) return null;
                                      
                                      return (
                                        <StudentCard
                                          key={enrollment.id}
                                          student={student}
                                          enrollment={enrollment}
                                          subjectId={activeSubject.id}
                                          levelId={level.id}
                                          groupId={group.id}
                                        />
                                      );
                                    })}
                                  
                                  {group.currentStudents === 0 && (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                      <p className="text-sm">Arrastra estudiantes aquí</p>
                                    </div>
                                  )}
                                </div>
                              </DroppableArea>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Remove Area */}
                  <div className="mt-8">
                    <DroppableArea
                      subjectId={activeSubject.id}
                      levelId=""
                      groupId=""
                      title="Quitar de la Materia"
                      subtitle="Arrastra aquí para remover estudiantes"
                      type="remove"
                      className="bg-red-50 border-red-200 border-2 border-dashed"
                    >
                      <div className="text-center py-8 text-red-600">
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Zona de Remoción</p>
                      </div>
                    </DroppableArea>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una Materia</h3>
                    <p className="text-gray-600">Elige una materia del sidebar para gestionar sus estudiantes</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeDragData && (
              <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">Moviendo estudiante...</span>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubject}
        teachers={teachers}
      />

      {/* Student Management Modal */}
      {studentManagementModal.isOpen && studentManagementModal.subject && studentManagementModal.level && studentManagementModal.group && (
        <StudentManagementModal
          isOpen={studentManagementModal.isOpen}
          onClose={handleCloseStudentManagement}
          subject={studentManagementModal.subject}
          level={studentManagementModal.level}
          group={studentManagementModal.group}
          onStudentsUpdated={() => {
            // Trigger a refresh of the data if needed
            showNotification('success', 'Estudiantes actualizados');
          }}
        />
      )}

      {/* Level Edit Modal */}
      {levelEditModal.isOpen && levelEditModal.subject && levelEditModal.level && (
        <LevelEditModal
          isOpen={levelEditModal.isOpen}
          onClose={handleCloseLevelEdit}
          level={levelEditModal.level}
          onSave={handleSaveLevel}
        />
      )}

      {/* Subject Edit Modal */}
      {subjectEditModal.isOpen && subjectEditModal.subject && (
        <SubjectForm
          subject={subjectEditModal.subject}
          mode="edit"
          onSubmit={handleUpdateSubject}
          onCancel={() => setSubjectEditModal({ isOpen: false })}
        />
      )}

      {/* Group Edit Modal */}
      {groupEditModal.isOpen && groupEditModal.subject && groupEditModal.group && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Editar Grupo
              </h2>
              <button
                onClick={() => setGroupEditModal({ isOpen: false })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const groupData = {
                name: formData.get('name') as string,
                teacherId: formData.get('teacherId') as string,
                maxStudents: parseInt(formData.get('maxStudents') as string)
              };
              handleUpdateGroup(groupData);
            }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Grupo
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={groupEditModal.group.name}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profesor
                </label>
                <select
                  name="teacherId"
                  defaultValue={groupEditModal.group.teacherId}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-gray-300"
                  required
                >
                  <option value="">Seleccionar profesor</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad Máxima
                </label>
                <input
                  type="number"
                  name="maxStudents"
                  defaultValue={groupEditModal.group.maxStudents}
                  min="1"
                  max="50"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-gray-300"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setGroupEditModal({ isOpen: false })}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}