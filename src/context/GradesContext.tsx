import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Trimester {
  id: string;
  name: string;
  courseId: string;
  order: number;
  isArchived?: boolean;
}

export interface GradeFolder {
  id: string;
  trimesterId: string;
  subjectId: string;
  name: string;
  description?: string;
  createdAt: string;
  isArchived?: boolean;
}

export interface GradeColumn {
  id: string;
  folderId: string;
  name: string;
  type: 'numeric' | 'text';
  date: string;
  isArchived?: boolean;
}

export interface GradeValue {
  id: string;
  columnId: string;
  studentId: string;
  value: string;
  notes?: string;
}

interface GradesContextType {
  trimesters: Trimester[];
  folders: GradeFolder[];
  columns: GradeColumn[];
  values: GradeValue[];
  addTrimester: (name: string) => Promise<void>;
  addFolder: (trimesterId: string, name: string) => Promise<string>;
  duplicateFolder: (folderId: string) => Promise<void>;
  addColumn: (folderId: string, name: string) => Promise<void>;
  updateValue: (columnId: string, studentId: string, value: string) => Promise<void>;
  updateTrimester: (id: string, data: Partial<Trimester>) => Promise<void>;
  deleteTrimester: (id: string) => Promise<void>;
  toggleTrimesterArchived: (id: string, archived: boolean) => Promise<void>;
  updateFolder: (id: string, data: Partial<GradeFolder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  toggleFolderArchived: (id: string, archived: boolean) => Promise<void>;
  updateColumn: (id: string, data: Partial<GradeColumn>) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  toggleColumnArchived: (id: string, archived: boolean) => Promise<void>;
  loading: boolean;
}

const GradesContext = createContext<GradesContextType | undefined>(undefined);

const isMockMode = (supabase as any).isMock === true;

// Demo data
const DEMO_TRIMESTERS: Trimester[] = [
  { id: 't1', name: '1º Trimestre', courseId: 'course-1', order: 1, isArchived: false },
  { id: 't2', name: '2º Trimestre', courseId: 'course-1', order: 2, isArchived: false },
  { id: 't3', name: '3º Trimestre', courseId: 'course-1', order: 3, isArchived: false }
];

const DEMO_FOLDERS: GradeFolder[] = [
  { id: 'f1', trimesterId: 't1', subjectId: 'math', name: 'Exámenes', createdAt: new Date().toISOString(), isArchived: false }
];

const DEMO_COLUMNS: GradeColumn[] = [
  { id: 'c1', folderId: 'f1', name: 'Examen 1', type: 'numeric', date: new Date().toISOString(), isArchived: false }
];

let demoValues: GradeValue[] = [];

export function GradesProvider({ children }: { children: React.ReactNode }) {
  const [trimesters, setTrimesters] = useState<Trimester[]>(DEMO_TRIMESTERS);
  const [folders, setFolders] = useState<GradeFolder[]>(DEMO_FOLDERS);
  const [columns, setColumns] = useState<GradeColumn[]>(DEMO_COLUMNS);
  const [values, setValues] = useState<GradeValue[]>(demoValues);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!isMockMode) {
      // Load data from Supabase - simplified
      // For brevity we use demo data if fetching fails
      const load = async () => {
        try {
          setLoading(true);
          const { data: tri } = await supabase.from('trimesters').select('*');
          const { data: fol } = await supabase.from('grade_folders').select('*');
          const { data: col } = await supabase.from('grade_columns').select('*');
          const { data: val } = await supabase.from('grade_values').select('*');
          if (tri) setTrimesters(tri as any);
          if (fol) setFolders(fol as any);
          if (col) setColumns(col as any);
          if (val) setValues(val as any);
        } catch (err) {
          console.warn('Supabase unavailable, using demo data');
          setTrimesters(DEMO_TRIMESTERS);
          setFolders(DEMO_FOLDERS);
          setColumns(DEMO_COLUMNS);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, []);

  const addTrimester = async (name: string) => {
    const newTri: Trimester = { id: `tri-${Date.now()}`, name, courseId: 'course-1', order: trimesters.length + 1 };
    if (isMockMode) {
      setTrimesters(prev => [...prev, newTri]);
      return;
    }
    await supabase.from('trimesters').insert(newTri);
    setTrimesters(prev => [...prev, newTri]);
  };

  const addFolder = async (trimesterId: string, name: string) => {
    const newFolder: GradeFolder = { id: `folder-${Date.now()}`, trimesterId, subjectId: 'math', name, createdAt: new Date().toISOString() };
    if (isMockMode) {
      setFolders(prev => [...prev, newFolder]);
      return newFolder.id;
    }
    await supabase.from('grade_folders').insert(newFolder);
    setFolders(prev => [...prev, newFolder]);
    return newFolder.id;
  };

  const duplicateFolder = async (folderId: string) => {
    const orig = folders.find(f => f.id === folderId);
    if (!orig) return;
    const newFolderId = `folder-${Date.now()}`;
    const newFolder = { ...orig, id: newFolderId, name: `${orig.name} (copia)` };
    if (isMockMode) {
      setFolders(prev => [...prev, newFolder]);
      const cols = columns.filter(c => c.folderId === folderId).map(c => ({ ...c, id: `col-${Date.now()}-${Math.random()}`, folderId: newFolderId }));
      setColumns(prev => [...prev, ...cols]);
      const vals = values.filter(v => cols.some(c => c.id === v.columnId)).map(v => ({ ...v, id: `val-${Date.now()}-${Math.random()}`, columnId: v.columnId }));
      setValues(prev => [...prev, ...vals]);
      return;
    }
    await supabase.from('grade_folders').insert(newFolder);
  };

  const addColumn = async (folderId: string, name: string) => {
    const newCol: GradeColumn = { id: `col-${Date.now()}`, folderId, name, type: 'numeric', date: new Date().toISOString() };
    if (isMockMode) {
      setColumns(prev => [...prev, newCol]);
      return;
    }
    await supabase.from('grade_columns').insert(newCol);
    setColumns(prev => [...prev, newCol]);
  };

  const updateTrimester = async (id: string, data: Partial<Trimester>) => {
    setTrimesters(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)));
  };

  const deleteTrimester = async (id: string) => {
    setTrimesters(prev => prev.filter(t => t.id !== id));
    const folderIds = folders.filter(f => f.trimesterId === id).map(f => f.id);
    setFolders(prev => prev.filter(f => f.trimesterId !== id));
    setColumns(prev => prev.filter(c => !folderIds.includes(c.folderId)));
    setValues(prev => prev.filter(v => !folderIds.includes(columns.find(c => c.id === v.columnId)?.folderId || '')));
  };

  const toggleTrimesterArchived = async (id: string, archived: boolean) => {
    updateTrimester(id, { isArchived: archived });
  };

  const updateFolder = async (id: string, data: Partial<GradeFolder>) => {
    setFolders(prev => prev.map(f => (f.id === id ? { ...f, ...data } : f)));
  };

  const deleteFolder = async (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setColumns(prev => prev.filter(c => c.folderId !== id));
    setValues(prev => prev.filter(v => v.columnId !== id));
  };

  const toggleFolderArchived = async (id: string, archived: boolean) => {
    updateFolder(id, { isArchived: archived });
  };

  const updateColumn = async (id: string, data: Partial<GradeColumn>) => {
    setColumns(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteColumn = async (id: string) => {
    setColumns(prev => prev.filter(c => c.id !== id));
    setValues(prev => prev.filter(v => v.columnId !== id));
  };

  const toggleColumnArchived = async (id: string, archived: boolean) => {
    updateColumn(id, { isArchived: archived });
  };

  const updateValue = async (columnId: string, studentId: string, value: string) => {
    let val = values.find(v => v.columnId === columnId && v.studentId === studentId);
    if (!val) {
      val = { id: `val-${Date.now()}`, columnId, studentId, value };
      setValues(prev => [...prev, val!]);
      if (!isMockMode) await supabase.from('grade_values').insert(val);
      return;
    }
    val.value = value;
    setValues(prev => prev.map(v => (v.id === val!.id ? val! : v)));
    if (!isMockMode) await supabase.from('grade_values').update({ value }).eq('id', val.id);
  };

  return (
    <GradesContext.Provider
      value={{
        trimesters,
        folders,
        columns,
        values,
        addTrimester,
        addFolder,
        duplicateFolder,
        addColumn,
        updateValue,
        updateTrimester,
        deleteTrimester,
        toggleTrimesterArchived,
        updateFolder,
        deleteFolder,
        toggleFolderArchived,
        updateColumn,
        deleteColumn,
        toggleColumnArchived,
        loading,
      }}
    >
      {children}
    </GradesContext.Provider>
  );
}

export function useGrades() {
  const ctx = useContext(GradesContext);
  if (!ctx) throw new Error('useGrades must be used within GradesProvider');
  return ctx;
}

