import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Users, Trash2 } from 'lucide-react';

interface DroppableAreaProps {
  subjectId: string;
  levelId: string;
  groupId: string;
  title: string;
  subtitle?: string;
  type: 'group' | 'remove';
  children: React.ReactNode;
  className?: string;
}

export default function DroppableArea({
  subjectId,
  levelId,
  groupId,
  title,
  subtitle,
  type,
  children,
  className = ''
}: DroppableAreaProps) {
  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id: `droppable-${type}-${subjectId}-${levelId}-${groupId}`,
    data: {
      subjectId,
      levelId,
      groupId,
      type,
    },
  });

  const getDropzoneStyles = () => {
    if (type === 'remove') {
      return isOver 
        ? 'bg-red-100 border-red-400 border-2 border-dashed' 
        : 'bg-red-50 border-red-200 border-2 border-dashed';
    }
    
    return isOver 
      ? 'bg-blue-50 border-blue-400 border-2 border-solid' 
      : 'bg-white border-gray-200 border';
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 transition-all ${getDropzoneStyles()} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {type === 'remove' ? (
            <Trash2 className="w-4 h-4 text-red-600" />
          ) : (
            <Users className="w-4 h-4 text-gray-600" />
          )}
          <h4 className={`font-medium ${type === 'remove' ? 'text-red-900' : 'text-gray-900'}`}>
            {title}
          </h4>
        </div>
        {subtitle && (
          <span className={`text-xs ${type === 'remove' ? 'text-red-600' : 'text-gray-500'}`}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[100px]">
        {children}
      </div>

      {/* Drop Indicator */}
      {isOver && (
        <div className={`mt-3 p-2 rounded border-2 border-dashed text-center ${
          type === 'remove' 
            ? 'border-red-400 bg-red-100 text-red-700' 
            : 'border-blue-400 bg-blue-100 text-blue-700'
        }`}>
          <p className="text-sm font-medium">
            {type === 'remove' ? 'Soltar para remover' : 'Soltar para asignar'}
          </p>
        </div>
      )}
    </div>
  );
}