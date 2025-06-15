import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Users,
  Layers,
  BookOpen,
  BarChart3,
  Download,
  Save
} from 'lucide-react';
import StatCard from '../../components/UI/StatCard';
import { useUsers } from '../../context/UsersContext';
import { useGroups } from '../../context/GroupsContext';
import { useSubjects } from '../../context/SubjectsContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function ReportsAnalysis() {
  const { users, getUsersByRole } = useUsers();
  const { groups, levels, getActiveGroups, getArchivedGroups } = useGroups();
  const { subjects } = useSubjects();

  const [filters, setFilters] = useState({
    role: 'all',
    group: 'all',
    level: 'all'
  });
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState<{ name: string; filters: typeof filters }[]>(() => {
    const saved = localStorage.getItem('report_presets');
    return saved ? JSON.parse(saved) : [];
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const savePreset = () => {
    if (!presetName.trim()) return;
    const newPresets = [...presets, { name: presetName, filters }];
    setPresets(newPresets);
    localStorage.setItem('report_presets', JSON.stringify(newPresets));
    setPresetName('');
  };

  const loadPreset = (name: string) => {
    const preset = presets.find(p => p.name === name);
    if (preset) setFilters(preset.filters);
  };

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalTeachers: getUsersByRole('teacher').length,
      activeGroups: getActiveGroups().length,
      archivedGroups: getArchivedGroups().length,
      activeSubjects: subjects.filter(s => s.isActive).length,
    };
  }, [users, subjects, groups]);

  // Demo data for charts
  const attendanceChart = useMemo(() => {
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    return {
      labels,
      datasets: [
        {
          label: 'Grupo A',
          data: [95, 97, 96, 94, 98, 97],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.3)'
        },
        {
          label: 'Grupo B',
          data: [92, 90, 91, 93, 94, 92],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.3)'
        }
      ]
    };
  }, []);

  const gradesChart = useMemo(() => {
    const labels = ['T1', 'T2', 'T3'];
    return {
      labels,
      datasets: [
        {
          label: 'Matemáticas',
          data: [7.5, 8.0, 8.2],
          backgroundColor: '#6366f1'
        },
        {
          label: 'Ciencias',
          data: [7.0, 7.3, 7.8],
          backgroundColor: '#f59e0b'
        }
      ]
    };
  }, []);

  const userPie = useMemo(() => {
    const counts = {
      admin: getUsersByRole('admin').length,
      teacher: getUsersByRole('teacher').length,
      student: getUsersByRole('student').length,
      parent: getUsersByRole('parent').length
    };
    return {
      labels: ['Admins', 'Profesores', 'Estudiantes', 'Padres'],
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444']
        }
      ]
    };
  }, [users]);

  const progressChart = useMemo(() => {
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    return {
      labels,
      datasets: [
        {
          label: 'Rendimiento Promedio',
          data: [70, 72, 74, 75, 77, 80],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139,92,246,0.3)'
        }
      ]
    };
  }, []);

  const activityChart = useMemo(() => {
    const labels = ['Infantil', 'Primaria', 'Secundaria'];
    return {
      labels,
      datasets: [
        {
          label: 'Actividades',
          data: [30, 45, 25],
          backgroundColor: '#3b82f6'
        }
      ]
    };
  }, []);

  const exportCSV = () => {
    const csvRows = [
      ['Métrica', 'Valor'],
      ['Total Usuarios', stats.totalUsers.toString()],
      ['Profesores', stats.totalTeachers.toString()],
      ['Grupos Activos', stats.activeGroups.toString()],
      ['Grupos Archivados', stats.archivedGroups.toString()],
      ['Asignaturas Activas', stats.activeSubjects.toString()]
    ];
    const csvString = csvRows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.text('Reporte General', 10, 10);
    pdf.text(new Date().toLocaleDateString('es-ES'), 10, 16);
    pdf.addImage(imgData, 'PNG', 10, 20, width - 20, height);
    pdf.save('reporte.pdf');
  };

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

      {/* Filtros y presets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select
            className="mt-1 border-gray-300 rounded-md"
            value={filters.role}
            onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}
          >
            <option value="all">Todos</option>
            <option value="admin">Administrador</option>
            <option value="teacher">Profesor</option>
            <option value="student">Estudiante</option>
            <option value="parent">Padre</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Grupo</label>
          <select
            className="mt-1 border-gray-300 rounded-md"
            value={filters.group}
            onChange={e => setFilters(f => ({ ...f, group: e.target.value }))}
          >
            <option value="all">Todos</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nivel</label>
          <select
            className="mt-1 border-gray-300 rounded-md"
            value={filters.level}
            onChange={e => setFilters(f => ({ ...f, level: e.target.value }))}
          >
            <option value="all">Todos</option>
            {levels.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <input
            type="text"
            placeholder="Nombre preset"
            className="border-gray-300 rounded-md px-2 py-1"
            value={presetName}
            onChange={e => setPresetName(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center gap-1"
            onClick={savePreset}
          >
            <Save className="w-4 h-4" /> Guardar
          </button>
          {presets.length > 0 && (
            <select
              className="border-gray-300 rounded-md"
              onChange={e => loadPreset(e.target.value)}
            >
              <option value="">Aplicar preset</option>
              {presets.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Gráficas */}
      <div ref={reportRef} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="mb-2 font-semibold">Asistencia por Grupo</h3>
            <Line data={attendanceChart} height={200} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="mb-2 font-semibold">Notas Medias por Asignatura</h3>
            <Bar data={gradesChart} height={200} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="mb-2 font-semibold">Distribución de Usuarios</h3>
            <Pie data={userPie} height={200} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="mb-2 font-semibold">Progresión Académica</h3>
            <Line data={progressChart} height={200} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 lg:col-span-2">
            <h3 className="mb-2 font-semibold">Resumen de Actividad</h3>
            <Bar data={activityChart} height={200} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Tabla resumen */}
        <div className="bg-white rounded-xl shadow-sm border p-4 overflow-auto">
          <h3 className="mb-2 font-semibold">Resumen del Centro</h3>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Métrica</th>
                <th className="px-2 py-1 text-left">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-2 py-1">Total Usuarios</td>
                <td className="px-2 py-1">{stats.totalUsers}</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Profesores</td>
                <td className="px-2 py-1">{stats.totalTeachers}</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Grupos Activos</td>
                <td className="px-2 py-1">{stats.activeGroups}</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Grupos Archivados</td>
                <td className="px-2 py-1">{stats.archivedGroups}</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Asignaturas Activas</td>
                <td className="px-2 py-1">{stats.activeSubjects}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-1"
        >
          <Download className="w-4 h-4" /> CSV
        </button>
        <button
          onClick={exportPDF}
          className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-1"
        >
          <Download className="w-4 h-4" /> PDF
        </button>
      </div>
    </div>
  );
}
