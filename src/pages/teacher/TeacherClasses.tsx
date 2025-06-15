import React, { useMemo } from 'react';
import { ClipboardList, FilePlus, BarChart3 } from 'lucide-react';
import { useSubjects } from '../../context/SubjectsContext';
import { useAuth } from '../../context/AuthContext';

export default function TeacherClasses() {
  const { subjects } = useSubjects();
  const { user } = useAuth();

  const classes = useMemo(() => {
    if (!user) return [];
    const result: {
      id: string;
      subjectName: string;
      levelName: string;
      students: number;
      schedule: { dayOfWeek: number; startTime: string; endTime: string }[];
    }[] = [];

    subjects.forEach(subject => {
      subject.groups.forEach(group => {
        if (group.teacherId === user.id) {
          const level = subject.levels.find(l => l.id === group.levelId);
          result.push({
            id: group.id,
            subjectName: subject.name,
            levelName: level ? level.name : '',
            students: group.currentStudents,
            schedule: group.schedule
          });
        }
      });
    });

    return result;
  }, [subjects, user]);

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const formatSchedule = (schedule: { dayOfWeek: number; startTime: string; endTime: string }[]) => {
    if (!schedule || schedule.length === 0) return 'Sin horario';
    return schedule
      .map(s => `${dayNames[s.dayOfWeek]} ${s.startTime}-${s.endTime}`)
      .join(', ');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis Clases</h1>
      {classes.length === 0 ? (
        <p className="text-gray-600">Aún no tienes clases asignadas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div
              key={cls.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">{cls.subjectName}</h3>
                <p className="text-sm text-gray-600">Nivel: {cls.levelName}</p>
                <p className="text-sm text-gray-600">Alumnos: {cls.students}</p>
                <p className="text-sm text-gray-600">Horario: {formatSchedule(cls.schedule)}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="flex items-center text-sm px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <ClipboardList className="w-4 h-4 mr-1" /> Lista
                </button>
                <button
                  className="flex items-center text-sm px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <FilePlus className="w-4 h-4 mr-1" /> Añadir tarea
                </button>
                <button
                  className="flex items-center text-sm px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-1" /> Progreso
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
