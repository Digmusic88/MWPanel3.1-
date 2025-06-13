import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { Subject } from '../../../types/subjects';

interface SubjectTabsProps {
  subjects: Subject[];
  activeTab: string;
  onTabChange: (subjectId: string) => void;
  onTabClose: (subjectId: string) => void;
}

export default function SubjectTabs({ subjects, activeTab, onTabChange, onTabClose }: SubjectTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex overflow-x-auto">
        {subjects.map(subject => (
          <div
            key={subject.id}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 cursor-pointer transition-colors min-w-0 ${
              activeTab === subject.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-transparent hover:bg-gray-50 text-gray-700'
            }`}
            onClick={() => onTabChange(subject.id)}
          >
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: subject.color + '20', color: subject.color }}
            >
              <BookOpen className="w-2.5 h-2.5" />
            </div>
            <span className="text-sm font-medium truncate max-w-32">{subject.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(subject.id);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}