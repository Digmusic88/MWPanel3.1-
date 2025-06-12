import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Edit, Trash2, Archive, ArchiveRestore, BookOpen, Calendar, Tag } from 'lucide-react';
import { CursoMateria } from '../../services/cursosMateriasService';

interface CursoMateriasTableProps {
  cursos: CursoMateria[];
  onEdit: (curso: CursoMateria) => void;
  onDelete: (id: string, nombre: string) => void;
  onArchivar: (id: string, nombre: string) => void;
  onDesarchivar: (id: string, nombre: string) => void;
  showArchived: boolean;
}

type SortField = 'nombre' | 'categoria' | 'creado_en';
type SortDirection = 'asc' | 'desc';

export default function CursoMateriasTable({ 
  cursos, 
  onEdit, 
  onDelete, 
  onArchivar, 
  onDesarchivar, 
  showArchived 
}: CursoMateriasTableProps) {
  const [sortField, setSortField] = useState<SortField>('creado_en');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCursos = [...cursos].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'creado_en') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Ciencias': 'bg-blue-100 text-blue-800',
      'Humanidades': 'bg-purple-100 text-purple-800',
      'Tecnología': 'bg-green-100 text-green-800',
      'Ciencias Sociales': 'bg-yellow-100 text-yellow-800',
      'Artes': 'bg-pink-100 text-pink-800',
      'Deportes': 'bg-orange-100 text-orange-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-blue-600 transition-colors group"
    >
      <span>{children}</span>
      <div className="flex flex-col">
        <ChevronUp className={`w-3 h-3 transition-colors ${
          sortField === field && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
        }`} />
        <ChevronDown className={`w-3 h-3 -mt-1 transition-colors ${
          sortField === field && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
        }`} />
      </div>
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="nombre">Curso</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="categoria">Categoría</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="creado_en">Fecha Creación</SortButton>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCursos.map((curso) => (
              <tr key={curso.id} className={`hover:bg-gray-50 transition-colors ${curso.archivado ? 'opacity-75' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {curso.nombre}
                        {curso.archivado && (
                          <Archive className="w-4 h-4 ml-2 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getCategoriaColor(curso.categoria)}`}>
                    <Tag className="w-3 h-3 mr-1" />
                    {curso.categoria}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {curso.descripcion || (
                      <span className="text-gray-400 italic">Sin descripción</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      curso.archivado ? 'bg-gray-500' : 'bg-green-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      curso.archivado ? 'text-gray-600' : 'text-green-600'
                    }`}>
                      {curso.archivado ? 'Archivado' : 'Activo'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(curso.creado_en)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {!curso.archivado && (
                      <button
                        onClick={() => onEdit(curso)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Editar curso"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    
                    {!curso.archivado ? (
                      <>
                        <button
                          onClick={() => onArchivar(curso.id, curso.nombre)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Archivar curso"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(curso.id, curso.nombre)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Eliminar curso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onDesarchivar(curso.id, curso.nombre)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Desarchivar curso"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}