import React, { useEffect, useState } from 'react';

interface Settings {
  institutionName: string;
  academicYear: string;
  enableNotifications: boolean;
  darkMode: boolean;
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<Settings>({
    institutionName: '',
    academicYear: '',
    enableNotifications: true,
    darkMode: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('system_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        /* ignore invalid data */
      }
    }
  }, []);

  const handleChange = (
    field: keyof Settings,
    value: string | boolean
  ) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('system_settings', JSON.stringify(settings));
    alert('Configuración guardada');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600">Ajusta los parámetros globales de la plataforma</p>
        </div>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSave();
        }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Institución
            </label>
            <input
              type="text"
              value={settings.institutionName}
              onChange={e => handleChange('institutionName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año Académico Actual
            </label>
            <input
              type="text"
              value={settings.academicYear}
              onChange={e => handleChange('academicYear', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <input
              id="notifications"
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={e => handleChange('enableNotifications', e.target.checked)}
              className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
            />
            <label htmlFor="notifications" className="text-sm text-gray-700">
              Habilitar notificaciones
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              id="darkmode"
              type="checkbox"
              checked={settings.darkMode}
              onChange={e => handleChange('darkMode', e.target.checked)}
              className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
            />
            <label htmlFor="darkmode" className="text-sm text-gray-700">
              Modo oscuro
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 hover:shadow-lg transition-all"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

