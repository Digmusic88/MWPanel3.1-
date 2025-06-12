import React from 'react';
import { BookOpen, Edit, Trash2, Archive, ArchiveRestore, Calendar, Tag } from 'lucide-react';
import { CursoMateria } from '../../services/cursosMateriasService';

interface CursoMateriasCardProps {
  curso: CursoMateria;
  onEdit: (curso: CursoMateria) => void;
  onDelete: (id: string, nombre: string) => void;
  onArchivar: (id: string, nombre: string) => void;
  onDesarchivar: (id: string, nombre: string) => void;
  showArchived: boolean;
}

export default function CursoMateriasCard({ 
  curso, 
  onEdit, 
  onDelete, 
  onArchivar, 
  onDesarchivar, 
  showArchived 
}: CursoMateriasCardProps) {
  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Ciencias': 'bg-blue-100 text-blue-800 border-blue-200',
      'Humanidades': 'bg-purple-100 text-purple-800 border-purple-200',
      'Tecnología': 'bg-green-100 text-green-800 border-green-200',
      'Ciencias Sociales': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Artes': 'bg-pink-100 text-pink-800 border-pink-200',
      'Deportes': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden ${
      curso.archivado ? 'opacity-75' : ''
    }`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              {curso.nombre}
              {curso.archivado && (
                <Archive className="w-4 h-4 ml-2 text-gray-400" />
              )}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoriaColor(curso.categoria)}`}>
              <Tag className="w-3 h-3 mr-1" />
              {curso.categoria}
            </span>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            curso.archivado 
              ? 'bg-gray-100 text-gray-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {curso.archivado ? 'Archivado' : 'Activo'}
          </div>
        </div>

        {/* Descripción */}
        {curso.descripcion && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {curso.descripcion}
          </p>
        )}

        {/* Fecha de creación */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Creado: {formatDate(curso.creado_en)}</span>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          {!curso.archivado ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(curso)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                title="Editar curso"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Curso archivado
            </div>
          )}

          <div className="flex space-x-2">
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
        </div>
      </div>
    </div>
  );
}