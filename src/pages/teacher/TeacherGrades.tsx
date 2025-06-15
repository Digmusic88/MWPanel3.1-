import React, { useMemo, useState } from 'react';
import { Plus, Copy } from 'lucide-react';
import { useGrades, GradesProvider } from '../../context/GradesContext';
import { useUsers } from '../../context/UsersContext';

function GradesTable({ folderId }: { folderId: string }) {
  const { columns, values, addColumn, updateValue } = useGrades();
  const { users } = useUsers();
  const students = useMemo(() => users.filter(u => u.role === 'student'), [users]);
  const folderColumns = columns.filter(c => c.folderId === folderId);

  const handleAddColumn = async () => {
    const name = window.prompt('Nombre de la calificación');
    if (name) await addColumn(folderId, name);
  };

  const getValue = (colId: string, studentId: string) => {
    const val = values.find(v => v.columnId === colId && v.studentId === studentId);
    return val ? val.value : '';
  };

  const handleChange = (colId: string, studentId: string, value: string) => {
    updateValue(colId, studentId, value);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button onClick={handleAddColumn} className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg flex items-center gap-1">
          <Plus className="w-4 h-4" /> Añadir columna
        </button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 border">Alumno</th>
              {folderColumns.map(col => (
                <th key={col.id} className="px-2 py-1 border text-left">{col.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(st => (
              <tr key={st.id} className="hover:bg-gray-50">
                <td className="px-2 py-1 border font-medium">{st.name}</td>
                {folderColumns.map(col => (
                  <td key={col.id} className="px-2 py-1 border">
                    <input
                      className="w-20 border rounded px-1 text-sm"
                      value={getValue(col.id, st.id)}
                      onChange={e => handleChange(col.id, st.id, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GradesContent() {
  const { trimesters, folders, addTrimester, addFolder, duplicateFolder } = useGrades();
  const [activeTrimester, setActiveTrimester] = useState(trimesters[0]?.id);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const handleAddTrimester = async () => {
    const name = window.prompt('Nombre del trimestre');
    if (name) await addTrimester(name);
  };

  const handleAddFolder = async () => {
    if (!activeTrimester) return;
    const name = window.prompt('Nombre de la carpeta');
    if (name) {
      const id = await addFolder(activeTrimester, name);
      setActiveFolder(id);
    }
  };

  const foldersByTrim = folders.filter(f => f.trimesterId === activeTrimester);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {trimesters.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTrimester(t.id); setActiveFolder(null); }}
            className={`px-4 py-2 rounded-lg text-sm ${activeTrimester === t.id ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}
          >
            {t.name}
          </button>
        ))}
        <button onClick={handleAddTrimester} className="px-2 py-2 rounded-lg bg-blue-500 text-white text-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-4">
        <div className="w-48 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Carpetas</h3>
            <button onClick={handleAddFolder} className="text-emerald-600"><Plus className="w-4 h-4" /></button>
          </div>
          <ul className="space-y-1">
            {foldersByTrim.map(f => (
              <li key={f.id}>
                <button
                  onClick={() => setActiveFolder(f.id)}
                  className={`w-full text-left px-2 py-1 rounded ${activeFolder === f.id ? 'bg-emerald-100' : 'bg-gray-100'}`}
                >
                  {f.name}
                </button>
                <button onClick={() => duplicateFolder(f.id)} className="ml-1 text-xs text-gray-500"><Copy className="w-3 h-3" /></button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          {activeFolder ? <GradesTable folderId={activeFolder} /> : <p className="text-gray-600">Selecciona una carpeta.</p>}
        </div>
      </div>
    </div>
  );
}

export default function TeacherGrades() {
  return (
    <GradesProvider>
      <GradesContent />
    </GradesProvider>
  );
}

