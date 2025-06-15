import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ReportsAnalysis from '../src/pages/admin/ReportsAnalysis';
import { AuthProvider } from '../src/context/AuthContext';
import { UsersProvider } from '../src/context/UsersContext';
import { GroupsProvider } from '../src/context/GroupsContext';
import { SubjectsProvider } from '../src/context/SubjectsContext';

function renderWithProviders(ui: React.ReactElement) {
  return renderToString(
    <AuthProvider>
      <UsersProvider>
        <GroupsProvider>
          <SubjectsProvider>{ui}</SubjectsProvider>
        </GroupsProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

describe('ReportsAnalysis page', () => {
  it('renders without crashing', () => {
    expect(() => renderWithProviders(<ReportsAnalysis />)).not.toThrow();
  });

  it('contains heading text', () => {
    const html = renderWithProviders(<ReportsAnalysis />);
    expect(html).toContain('Reportes y Análisis');
  });
});
