export interface GroupInfo {
  maxCapacity: number;
  currentCapacity: number;
  students: string[];
}

/**
 * Validates a batch of student assignments.
 * @param studentIds IDs of students to assign.
 * @param group Current group information.
 * @returns Error message if validation fails, otherwise null.
 */
export function validateAssignment(studentIds: string[], group: GroupInfo): string | null {
  if (studentIds.length === 0) {
    return 'Debe seleccionar al menos un estudiante';
  }

  const remainingCapacity = group.maxCapacity - group.currentCapacity;
  if (studentIds.length > remainingCapacity) {
    return `Solo quedan ${remainingCapacity} espacios disponibles en el grupo`;
  }

  const alreadyAssigned = studentIds.filter(id => group.students.includes(id));
  if (alreadyAssigned.length > 0) {
    return 'Algunos estudiantes ya están asignados a este grupo';
  }

  return null;
}
