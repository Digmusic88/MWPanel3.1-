import React from 'react';
import { useGrades, GradesProvider } from '../../context/GradesContext';

function GradesSummary() {
  const { trimesters, folders, columns } = useGrades();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Calificaciones</h1>
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <h2 className="font-semibold mb-2">Resumen</h2>
        <p>{trimesters.length} trimestres</p>
        <p>{folders.length} carpetas</p>
        <p>{columns.length} columnas de calificaciones</p>
      </div>
    </div>
  );
}

export default function GradesManagement() {
  return (
    <GradesProvider>
      <GradesSummary />
    </GradesProvider>
  );
}

