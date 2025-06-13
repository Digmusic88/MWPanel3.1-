import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, BookOpen, GraduationCap, Filter } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useSubjects } from '../../context/SubjectsContext';
import { useUsers } from '../../context/UsersContext';
import SubjectSidebar from './components/SubjectSidebar';
import SubjectTabs from './components/SubjectTabs';
import StudentCard from './components/StudentCard';
import DroppableArea from './components/DroppableArea';
import { Subject, StudentEnrollment } from '../../types/subjects';
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
    enrollStudent, 
    transferStudent, 
    removeStudent, 
    changeLevelStudent,
    getEnrollmentsBySubject,
    getAvailableGroups
  } = useSubjects();
  
  const { getUsersByRole } = useUsers();
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const students = getUsersByRole('student');

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
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
    </div>
  );
}