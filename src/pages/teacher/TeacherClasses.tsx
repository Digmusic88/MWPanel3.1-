import React, { useEffect, useState } from 'react';
import { ClipboardList, FilePlus, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface TeacherClass {
  id: string;
  name: string;
  level: string;
  academicYear: string;
  students: number;
}

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('academic_groups')
        .select(
          `id, name, academic_year, current_capacity, educational_levels(name)`
        )
        .eq('tutor_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
      } else {
        const formatted = (data || []).map(g => ({
          id: g.id as string,
          name: g.name as string,
          level: g.educational_levels?.name || '',
          academicYear: g.academic_year as string,
          students: g.current_capacity as number
        }));
        setClasses(formatted);
      }

      setLoading(false);
    };

    loadClasses();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis Clases</h1>
      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : classes.length === 0 ? (
        <p className="text-gray-600">Aún no tienes clases asignadas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div
              key={cls.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-600">Nivel: {cls.level}</p>
                <p className="text-sm text-gray-600">Año: {cls.academicYear}</p>
                <p className="text-sm text-gray-600">Alumnos: {cls.students}</p>
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
