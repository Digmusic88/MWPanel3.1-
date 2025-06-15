import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface GeneralSettings {
  nombreCentro: string;
  logo: string | null;
  direccion: string;
  horaEntrada: string;
  horaSalida: string;
  horaRecreo: string;
  idiomas: string[];
  zonaHoraria: string;
  anioEscolar: string;
  formatoFecha: string;
}

interface EstructuraAcademica {
  etapas: { infantil: boolean; primaria: boolean; secundaria: boolean };
  nivelesPorEtapa: string;
  gruposPorNivel: string;
  asignaturasBase: string;
  trimestres: { inicio: string; fin: string }[];
}

interface GestionAcademica {
  tipoEvaluacion: string;
  tareasOnline: boolean;
  mostrarCalificaciones: boolean;
  porcentajeAprobado: number;
}

interface GestionUsuarios {
  roles: string[];
  permisosPorRol: string;
  registroAutomatico: boolean;
  camposObligatorios: string[];
  autenticacion: string[];
}

interface Notificaciones {
  correosAutomaticos: boolean;
  smtpHost: string;
  smtpPuerto: string;
  smtpUser: string;
  smtpPass: string;
  alertasPorRol: string[];
  plantillasCorreo: string;
}

interface Diseno {
  tema: 'claro' | 'oscuro';
  favicon: string | null;
  tipografia: string;
  mensajeBienvenida: string;
}

interface Seguridad {
  frecuenciaBackup: string;
  destinoBackup: string;
  expiracionSesion: number;
  dosPasos: boolean;
  politicaContrasena: string;
}

interface Laboratorio {
  funcionesBeta: boolean;
  herramientasDocentes: boolean;
}

export interface PanelSettings {
  id?: string;
  general: GeneralSettings;
  estructura_academica: EstructuraAcademica;
  gestion_academica: GestionAcademica;
  gestion_usuarios: GestionUsuarios;
  comunicaciones: Notificaciones;
  diseno: Diseno;
  seguridad: Seguridad;
  laboratorio: Laboratorio;
}

const defaultSettings: PanelSettings = {
  general: {
    nombreCentro: '',
    logo: null,
    direccion: '',
    horaEntrada: '',
    horaSalida: '',
    horaRecreo: '',
    idiomas: [],
    zonaHoraria: '',
    anioEscolar: '',
    formatoFecha: 'DD/MM/YYYY HH:mm'
  },
  estructura_academica: {
    etapas: { infantil: false, primaria: false, secundaria: false },
    nivelesPorEtapa: '',
    gruposPorNivel: '',
    asignaturasBase: '',
    trimestres: [
      { inicio: '', fin: '' },
      { inicio: '', fin: '' },
      { inicio: '', fin: '' }
    ]
  },
  gestion_academica: {
    tipoEvaluacion: 'Numerica',
    tareasOnline: false,
    mostrarCalificaciones: false,
    porcentajeAprobado: 50
  },
  gestion_usuarios: {
    roles: [],
    permisosPorRol: '',
    registroAutomatico: false,
    camposObligatorios: [],
    autenticacion: []
  },
  comunicaciones: {
    correosAutomaticos: false,
    smtpHost: '',
    smtpPuerto: '',
    smtpUser: '',
    smtpPass: '',
    alertasPorRol: [],
    plantillasCorreo: ''
  },
  diseno: {
    tema: 'claro',
    favicon: null,
    tipografia: '',
    mensajeBienvenida: ''
  },
  seguridad: {
    frecuenciaBackup: '',
    destinoBackup: '',
    expiracionSesion: 60,
    dosPasos: false,
    politicaContrasena: ''
  },
  laboratorio: {
    funcionesBeta: false,
    herramientasDocentes: false
  }
};

export default function SystemSettings() {
  const [settings, setSettings] = useState<PanelSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
    fetchRoles();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('panel_settings')
        .select('*')
        .maybeSingle();
      if (data) {
        setSettings({ ...defaultSettings, ...data });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const { data } = await supabase.from('users').select('role');
    const unique = Array.from(new Set((data || []).map(u => u.role)));
    setAvailableRoles(unique);
  };

  const handleChange = (
    section: keyof PanelSettings,
    field: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value
      }
    }));
  };

  const handleTrimestreChange = (
    index: number,
    field: 'inicio' | 'fin',
    value: string
  ) => {
    setSettings(prev => {
      const updated = [...prev.estructura_academica.trimestres];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        estructura_academica: { ...prev.estructura_academica, trimestres: updated }
      };
    });
  };

  const saveSettings = async () => {
    if (loading) return;
    const payload = { ...settings, updated_at: new Date().toISOString() };
    if (settings.id) {
      await supabase.from('panel_settings').update(payload).eq('id', settings.id);
    } else {
      const { data } = await supabase
        .from('panel_settings')
        .insert(payload)
        .select()
        .single();
      if (data) setSettings(prev => ({ ...prev, id: data.id }));
    }
    alert('Configuración guardada');
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Panel</h1>
          <p className="text-gray-600">Ajusta los parámetros globales del sistema</p>
        </div>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          saveSettings();
        }}
        className="space-y-6"
      >
        {/* Sección General */}
        <details className="border rounded-lg p-4" open>
          <summary className="font-semibold cursor-pointer">1. Configuración General del Centro</summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del centro</label>
              <input
                type="text"
                value={settings.general.nombreCentro}
                onChange={e => handleChange('general', 'nombreCentro', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input
                type="text"
                value={settings.general.direccion}
                onChange={e => handleChange('general', 'direccion', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora de entrada</label>
              <input
                type="time"
                value={settings.general.horaEntrada}
                onChange={e => handleChange('general', 'horaEntrada', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora de salida</label>
              <input
                type="time"
                value={settings.general.horaSalida}
                onChange={e => handleChange('general', 'horaSalida', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora de recreo</label>
              <input
                type="time"
                value={settings.general.horaRecreo}
                onChange={e => handleChange('general', 'horaRecreo', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Idiomas disponibles</label>
              <input
                type="text"
                placeholder="es,en,fr"
                value={settings.general.idiomas.join(',')}
                onChange={e => handleChange('general', 'idiomas', e.target.value.split(','))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zona horaria</label>
              <input
                type="text"
                value={settings.general.zonaHoraria}
                onChange={e => handleChange('general', 'zonaHoraria', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Año escolar actual</label>
              <input
                type="text"
                value={settings.general.anioEscolar}
                onChange={e => handleChange('general', 'anioEscolar', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Formato de fecha y hora</label>
              <input
                type="text"
                value={settings.general.formatoFecha}
                onChange={e => handleChange('general', 'formatoFecha', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </details>

        {/* Sección Estructura Académica */}
        <details className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">2. Estructura Académica</summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Etapas activas</label>
              <div className="space-x-3">
                {['infantil', 'primaria', 'secundaria'].map(etapa => (
                  <label key={etapa} className="inline-flex items-center space-x-1 mr-2">
                    <input
                      type="checkbox"
                      checked={(settings.estructura_academica.etapas as any)[etapa]}
                      onChange={e =>
                        handleChange('estructura_academica', 'etapas', {
                          ...settings.estructura_academica.etapas,
                          [etapa]: e.target.checked
                        })
                      }
                    />
                    <span className="capitalize">{etapa}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Niveles por etapa</label>
              <textarea
                value={settings.estructura_academica.nivelesPorEtapa}
                onChange={e => handleChange('estructura_academica', 'nivelesPorEtapa', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grupos por nivel</label>
              <textarea
                value={settings.estructura_academica.gruposPorNivel}
                onChange={e => handleChange('estructura_academica', 'gruposPorNivel', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Asignaturas base por nivel</label>
              <textarea
                value={settings.estructura_academica.asignaturasBase}
                onChange={e => handleChange('estructura_academica', 'asignaturasBase', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {settings.estructura_academica.trimestres.map((t, i) => (
                <div key={i} className="border p-2 rounded">
                  <div className="font-medium mb-2">Trimestre {i + 1}</div>
                  <label className="block text-sm mb-1">Inicio</label>
                  <input
                    type="date"
                    value={t.inicio}
                    onChange={e => handleTrimestreChange(i, 'inicio', e.target.value)}
                    className="w-full px-2 py-1 border rounded mb-2"
                  />
                  <label className="block text-sm mb-1">Fin</label>
                  <input
                    type="date"
                    value={t.fin}
                    onChange={e => handleTrimestreChange(i, 'fin', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        </details>

        {/* Gestión Académica */}
        <details className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">3. Gestión Académica</summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de evaluación</label>
              <select
                value={settings.gestion_academica.tipoEvaluacion}
                onChange={e => handleChange('gestion_academica', 'tipoEvaluacion', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option>Rubricas</option>
                <option>Numerica</option>
                <option>Descriptiva</option>
                <option>Mixta</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.gestion_academica.tareasOnline}
                onChange={e => handleChange('gestion_academica', 'tareasOnline', e.target.checked)}
              />
              <span>Entrega de tareas online</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.gestion_academica.mostrarCalificaciones}
                onChange={e => handleChange('gestion_academica', 'mostrarCalificaciones', e.target.checked)}
              />
              <span>Mostrar calificaciones a familias</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Porcentaje mínimo para aprobar</label>
              <input
                type="number"
                value={settings.gestion_academica.porcentajeAprobado}
                onChange={e => handleChange('gestion_academica', 'porcentajeAprobado', Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </details>

        {/* Gestión de Usuarios */}
        <details className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">4. Gestión de Usuarios</summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Roles del sistema</label>
              <div className="space-y-1">
                {availableRoles.map(role => (
                  <label key={role} className="block">
                    <input
                      type="checkbox"
                      checked={settings.gestion_usuarios.roles.includes(role)}
                      onChange={e => {
                        const roles = settings.gestion_usuarios.roles.includes(role)
                          ? settings.gestion_usuarios.roles.filter(r => r !== role)
                          : [...settings.gestion_usuarios.roles, role];
                        handleChange('gestion_usuarios', 'roles', roles);
                      }}
                      className="mr-1"
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Permisos por rol</label>
              <textarea
                value={settings.gestion_usuarios.permisosPorRol}
                onChange={e => handleChange('gestion_usuarios', 'permisosPorRol', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.gestion_usuarios.registroAutomatico}
                onChange={e => handleChange('gestion_usuarios', 'registroAutomatico', e.target.checked)}
              />
              <span>Registro automático</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Campos obligatorios</label>
              <input
                type="text"
                placeholder="nombre,email,..."
                value={settings.gestion_usuarios.camposObligatorios.join(',')}
                onChange={e => handleChange('gestion_usuarios', 'camposObligatorios', e.target.value.split(','))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Opciones de autenticación</label>
              <input
                type="text"
                placeholder="email,google,facebook"
                value={settings.gestion_usuarios.autenticacion.join(',')}
                onChange={e => handleChange('gestion_usuarios', 'autenticacion', e.target.value.split(','))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </details>

        {/* Notificaciones */}
        <details className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">5. Notificaciones y Comunicación</summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.comunicaciones.correosAutomaticos}
                onChange={e => handleChange('comunicaciones', 'correosAutomaticos', e.target.checked)}
              />
              <span>Enviar correos automáticos</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Host</label>
              <input
                type="text"
                value={settings.comunicaciones.smtpHost}
                onChange={e => handleChange('comunicaciones', 'smtpHost', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Puerto</label>
              <input
                type="text"
                value={settings.comunicaciones.smtpPuerto}
                onChange={e => handleChange('comunicaciones', 'smtpPuerto', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Usuario</label>
              <input
                type="text"
                value={settings.comunicaciones.smtpUser}
                onChange={e => handleChange('comunicaciones', 'smtpUser', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Contraseña</label>
              <input
                type="password"
                value={settings.comunicaciones.smtpPass}
                onChange={e => handleChange('comunicaciones', 'smtpPass', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alertas internas por rol</label>
              <input
                type="text"
                value={settings.comunicaciones.alertasPorRol.join(',')}
                onChange={e => handleChange('comunicaciones', 'alertasPorRol', e.target.value.split(','))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Plantillas de correo</label>
              <textarea
                value={settings.comunicaciones.plantillasCorreo}
                onChange={e => handleChange('comunicaciones', 'plantillasCorreo', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </details>

        {/* Diseño */}
        <details className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">6. Diseño y Marca</summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tema visual</label>
              <select
                value={settings.diseno.tema}
                onChange={e => handleChange('diseno', 'tema', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="claro">Claro</option>
                <option value="oscuro">Oscuro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipografía</label>
              <input
                type="text"
                value={settings.diseno.tipografia}
                onChange={e => handleChange('diseno', 'tipografia', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Mensaje de bienvenida</label>
              <textarea
                value={settings.diseno.mensajeBienvenida}
                onChange={e => handleChange('diseno', 'mensajeBienvenida', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </details>

        {/* Seguridad y Backup */}
        <details className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">7. Copia de Seguridad y Seguridad</summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Frecuencia de backup</label>
              <input
                type="text"
                value={settings.seguridad.frecuenciaBackup}
                onChange={e => handleChange('seguridad', 'frecuenciaBackup', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Destino de backup</label>
              <input
                type="text"
                value={settings.seguridad.destinoBackup}
                onChange={e => handleChange('seguridad', 'destinoBackup', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tiempo de expiración de sesión (minutos)</label>
              <input
                type="number"
                value={settings.seguridad.expiracionSesion}
                onChange={e => handleChange('seguridad', 'expiracionSesion', Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.seguridad.dosPasos}
                onChange={e => handleChange('seguridad', 'dosPasos', e.target.checked)}
              />
              <span>Autenticación en dos pasos</span>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Política de contraseñas</label>
              <textarea
                value={settings.seguridad.politicaContrasena}
                onChange={e => handleChange('seguridad', 'politicaContrasena', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </details>

        {/* Laboratorio */}
        <details className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">8. Laboratorio de Funciones Experimentales</summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.laboratorio.funcionesBeta}
                onChange={e => handleChange('laboratorio', 'funcionesBeta', e.target.checked)}
              />
              <span>Activar funciones en beta</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.laboratorio.herramientasDocentes}
                onChange={e => handleChange('laboratorio', 'herramientasDocentes', e.target.checked)}
              />
              <span>Mostrar herramientas nuevas para docentes</span>
            </div>
          </div>
        </details>

        <button
          type="submit"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
