import React, { useState } from 'react';
import { Search, BookOpen, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { Subject, StudentEnrollment } from '../../../types/subjects';

interface SubjectSidebarProps {
  subjects: Subject[];
  selectedSubjects: string[];
  onSubjectSelect: (subjectId: string) => void;
  enrollments: StudentEnrollment[];
}

export default function SubjectSidebar({ 
  subjects, 
  selectedSubjects, 
  onSubjectSelect, 
  enrollments 
}: SubjectSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);

  const toggleSubjectExpansion = (subjectId: string) => {
    setExpandedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const getSubjectEnrollmentCount = (subjectId: string) => {
    return enrollments.filter(e => e.subjectId === subjectId && e.status === 'active').length;
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    if (!acc[subject.department]) {
      acc[subject.department] = [];
    }
    acc[subject.department].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Materias</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar materias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Subject List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedSubjects).map(([department, departmentSubjects]) => (
          <div key={department} className="border-b border-gray-200">
            <div className="p-3 bg-gray-100 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">{department}</h3>
            </div>
            
            {departmentSubjects.map(subject => {
              const enrollmentCount = getSubjectEnrollmentCount(subject.id);
              const isSelected = selectedSubjects.includes(subject.id);
              const isExpanded = expandedSubjects.includes(subject.id);
              
              return (
                <div key={subject.id} className="border-b border-gray-100 last:border-b-0">
                  <div
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSubjectSelect(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: subject.color + '20', color: subject.color }}
                        >
                          <BookOpen className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {subject.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {subject.code} • {enrollmentCount} estudiantes
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubjectExpansion(subject.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="bg-gray-50 border-t border-gray-200">
                      {/* Levels */}
                      <div className="p-3">
                        <h4 className="text-xs font-medium text-gray-600 mb-2">Niveles</h4>
                        <div className="space-y-1">
                          {subject.levels.map(level => (
                            <div key={level.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-700">{level.name}</span>
                              <span className="text-gray-500">{level.currentStudents}/{level.maxStudents}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Groups */}
                      <div className="p-3 border-t border-gray-200">
                        <h4 className="text-xs font-medium text-gray-600 mb-2">Grupos</h4>
                        <div className="space-y-1">
                          {subject.groups.map(group => (
                            <div key={group.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-700">{group.name}</span>
                              <span className="text-gray-500">{group.currentStudents}/{group.maxStudents}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {filteredSubjects.length === 0 && (
          <div className="p-6 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">No se encontraron materias</p>
          </div>
        )}
      </div>
    </div>
  );
}