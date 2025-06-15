import React, { useMemo } from 'react';
import { Users, Layers, BookOpen, BarChart3 } from 'lucide-react';
import StatCard from '../../components/UI/StatCard';
import { useUsers } from '../../context/UsersContext';
import { useGroups } from '../../context/GroupsContext';
import { useSubjects } from '../../context/SubjectsContext';

export default function ReportsAnalysis() {
  const { users, getUsersByRole } = useUsers();
  const { groups, getActiveGroups, getArchivedGroups } = useGroups();
  const { subjects } = useSubjects();

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalTeachers: getUsersByRole('teacher').length,
      activeGroups: getActiveGroups().length,
      archivedGroups: getArchivedGroups().length,
      activeSubjects: subjects.filter(s => s.isActive).length,
    };
  }, [users, subjects, groups]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600">Visión general de la actividad en la plataforma</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuarios"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Profesores"
          value={stats.totalTeachers}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Grupos Activos"
          value={stats.activeGroups}
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Grupos Archivados"
          value={stats.archivedGroups}
          icon={Layers}
          color="red"
        />
        <StatCard
          title="Asignaturas Activas"
          value={stats.activeSubjects}
          icon={BarChart3}
          color="yellow"
        />
      </div>

      {/* Placeholders para gráficas/tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-64 flex items-center justify-center text-gray-400">
          Gráficas de rendimiento (Próximamente)
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-64 flex items-center justify-center text-gray-400">
          Tablas detalladas (Próximamente)
        </div>
      </div>
    </div>
  );
}
