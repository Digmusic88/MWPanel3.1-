import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { User, GripVertical, X } from 'lucide-react';
import { User as UserType } from '../../../types';
import { StudentEnrollment } from '../../../types/subjects';

interface StudentCardProps {
  student: UserType;
  enrollment: StudentEnrollment;
  subjectId: string;
  levelId: string;
  groupId: string;
  onRemove?: () => void;
}

export default function StudentCard({ 
  student, 
  enrollment, 
  subjectId, 
  levelId, 
  groupId,
  onRemove 
}: StudentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `student-${student.id}-${subjectId}-${groupId}`,
    data: {
      studentId: student.id,
      sourceSubjectId: subjectId,
      sourceLevelId: levelId,
      sourceGroupId: groupId,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600 bg-green-100';
    if (attendance >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-3 transition-all ${
        isDragging ? 'opacity-50 shadow-lg scale-105' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Drag Handle */}
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Student Avatar */}
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-blue-600" />
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500">{student.email}</span>
            {student.grade && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {student.grade}
              </span>
            )}
          </div>
        </div>

        {/* Attendance Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceColor(enrollment.attendance)}`}>
          {Math.round(enrollment.attendance)}%
        </div>

        {/* Remove Button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
            title="Remover del grupo"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Additional Info */}
      {enrollment.grade && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Calificación:</span>
            <span className="font-medium text-gray-900">{enrollment.grade}/10</span>
          </div>
        </div>
      )}
    </div>
  );
}