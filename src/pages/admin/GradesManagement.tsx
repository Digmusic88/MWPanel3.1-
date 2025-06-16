import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Copy,
} from 'lucide-react';
import { GradesProvider, useGrades, Trimester, GradeFolder, GradeColumn } from '../../context/GradesContext';

function ColumnTable({ folder }: { folder: GradeFolder }) {
  const { columns, addColumn, updateColumn, deleteColumn, toggleColumnArchived } = useGrades();
  const folderColumns = columns.filter(c => c.folderId === folder.id && !c.isArchived);

  const handleAdd = async () => {
    const name = window.prompt('Nombre de la columna');
    if (name) await addColumn(folder.id, name);
  };

  const handleRename = async (col: GradeColumn) => {
    const name = window.prompt('Nuevo nombre', col.name);
    if (name && name !== col.name) await updateColumn(col.id, { name });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Columnas</h4>
        <button
          onClick={handleAdd}
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <ul className="space-y-1">
        {folderColumns.map(col => (
          <li key={col.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between">
            <span>{col.name}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleRename(col)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleColumnArchived(col.id, !col.isArchived)}
                className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                title={col.isArchived ? 'Desarchivar' : 'Archivar'}
              >
                {col.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              </button>
              <button
                onClick={() => deleteColumn(col.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
        {folderColumns.length === 0 && (
          <li className="text-sm text-gray-500">No hay columnas</li>
        )}
      </ul>
    </div>
  );
}

function FolderCard({ folder, onSelect }: { folder: GradeFolder; onSelect: () => void }) {
  const { duplicateFolder, updateFolder, deleteFolder, toggleFolderArchived } = useGrades();
  const handleRename = async () => {
    const name = window.prompt('Nuevo nombre', folder.name);
    if (name && name !== folder.name) await updateFolder(folder.id, { name });
  };
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 space-y-2 ${folder.isArchived ? 'opacity-60' : ''}` }>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" onClick={onSelect}>{folder.name}</h3>
        <div className="flex items-center space-x-2">
          <button onClick={handleRename} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => duplicateFolder(folder.id)} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Duplicar">
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleFolderArchived(folder.id, !folder.isArchived)}
            className="p-1 text-orange-600 hover:bg-orange-50 rounded"
            title={folder.isArchived ? 'Desarchivar' : 'Archivar'}
          >
            {folder.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
          </button>
          <button onClick={() => deleteFolder(folder.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <ColumnTable folder={folder} />
    </div>
  );
}

function TrimesterSection({ trimester }: { trimester: Trimester }) {
  const { folders, addFolder, updateTrimester, deleteTrimester, toggleTrimesterArchived } = useGrades();
  const [show, setShow] = useState(false);
  const triFolders = folders.filter(f => f.trimesterId === trimester.id && !f.isArchived);

  const handleAddFolder = async () => {
    const name = window.prompt('Nombre de la carpeta');
    if (name) await addFolder(trimester.id, name);
  };

  const handleRename = async () => {
    const name = window.prompt('Nuevo nombre', trimester.name);
    if (name && name !== trimester.name) await updateTrimester(trimester.id, { name });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={() => setShow(!show)} className="font-semibold text-gray-900">
            {trimester.name}
          </button>
          {trimester.isArchived && <Archive className="w-4 h-4 text-gray-400" />}
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleRename} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleTrimesterArchived(trimester.id, !trimester.isArchived)}
            className="p-1 text-orange-600 hover:bg-orange-50 rounded"
            title={trimester.isArchived ? 'Desarchivar' : 'Archivar'}
          >
            {trimester.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
          </button>
          <button onClick={() => deleteTrimester(trimester.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {show && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <button onClick={handleAddFolder} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Agregar carpeta">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {triFolders.map(f => (
              <FolderCard key={f.id} folder={f} onSelect={() => {}} />
            ))}
            {triFolders.length === 0 && (
              <p className="text-sm text-gray-500">No hay carpetas</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GradesManagementContent() {
  const { trimesters, addTrimester } = useGrades();

  const handleAddTrimester = async () => {
    const name = window.prompt('Nombre del trimestre');
    if (name) await addTrimester(name);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Calificaciones</h1>
        <button
          onClick={handleAddTrimester}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" /> <span>Nuevo Trimestre</span>
        </button>
      </div>
      <div className="space-y-4">
        {trimesters.map(t => (
          <TrimesterSection key={t.id} trimester={t} />
        ))}
        {trimesters.length === 0 && (
          <p className="text-gray-500">No hay trimestres</p>
        )}
      </div>
    </div>
  );
}

export default function GradesManagement() {
  return (
    <GradesProvider>
      <GradesManagementContent />
    </GradesProvider>
  );
}
