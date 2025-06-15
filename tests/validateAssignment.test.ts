import { describe, it, expect } from 'vitest';
import { validateAssignment, GroupInfo } from '../src/utils/validateAssignment';

describe('validateAssignment', () => {
  const baseGroup: GroupInfo = {
    maxCapacity: 3,
    currentCapacity: 1,
    students: ['a']
  };

  it('returns error when no students selected', () => {
    const result = validateAssignment([], baseGroup);
    expect(result).toBe('Debe seleccionar al menos un estudiante');
  });

  it('returns error when capacity exceeded', () => {
    const result = validateAssignment(['b', 'c', 'd'], baseGroup);
    expect(result).toBe('Solo quedan 2 espacios disponibles en el grupo');
  });

  it('returns error when duplicate assignments', () => {
    const result = validateAssignment(['a', 'b'], baseGroup);
    expect(result).toBe('Algunos estudiantes ya están asignados a este grupo');
  });

  it('returns null when assignments are valid', () => {
    const result = validateAssignment(['b'], baseGroup);
    expect(result).toBeNull();
  });
});
