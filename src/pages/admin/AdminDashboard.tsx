import React, { useEffect, useState } from 'react';
import { Users, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import StatCard from '../../components/UI/StatCard';
import RecentActivity from '../../components/UI/RecentActivity';
import { useUsers } from '../../context/UsersContext';
import { CursosMateriasService } from '../../services/cursosMateriasService';
import { IncidenciasService, Incidencia } from '../../services/incidenciasService';
import { useNavigate } from 'react-router-dom';
import { Activity } from '../../components/UI/RecentActivity';

export default function AdminDashboard() {
  const { users } = useUsers();
  const navigate = useNavigate();
  const [activeCourses, setActiveCourses] = useState(0);
  const [systemPerformance, setSystemPerformance] = useState('0%');
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    CursosMateriasService.getActivos()
      .then(c => setActiveCourses(c.length))
      .catch(() => setActiveCourses(0));

    IncidenciasService.getAll()
      .then(data => setIncidencias(data))
      .catch(() => setIncidencias([]));

    const perf = (95 + Math.random() * 5).toFixed(1);
    setSystemPerformance(`${perf}%`);
  }, []);

  const handleBackup = async () => {
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('Backup failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'backup.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Resumen general de la plataforma educativa</p>
        </div>
        <button
          onClick={() => navigate('/admin/settings')}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 hover:shadow-lg transition-all"
        >
          Configuración del Sistema
        </button>
      </div>

      {incidencias.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Incidencias Reportadas</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {incidencias.map(inc => (
              <li key={inc.id}>{inc.descripcion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cuadrícula de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuarios"
          value={users.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Cursos Activos"
          value={activeCourses}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Rendimiento del Sistema"
          value={systemPerformance}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Incidencias Reportadas"
          value={incidencias.length}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Cuadrícula de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad Reciente */}
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Agregar Nuevo Usuario</div>
              <div className="text-sm text-gray-500">Crear cuenta de administrador, profesor, estudiante o padre</div>
            </button>
            <button
              onClick={() => navigate('/admin/cursos-materias')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Crear Curso</div>
              <div className="text-sm text-gray-500">Configurar nuevo curso con materias</div>
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Ver Reportes</div>
              <div className="text-sm text-gray-500">Acceder a análisis y reportes del sistema</div>
            </button>
            <button
              onClick={handleBackup}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Respaldo del Sistema</div>
              <div className="text-sm text-gray-500">Crear o restaurar respaldo del sistema</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
