import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ReportsAnalysis from '../src/pages/admin/ReportsAnalysis';
import { AuthProvider } from '../src/context/AuthContext';
import { UsersProvider } from '../src/context/UsersContext';
import { GroupsProvider } from '../src/context/GroupsContext';
import { SubjectsProvider } from '../src/context/SubjectsContext';

// Mock localStorage for server environment
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
} as any;

function renderWithProviders(ui: React.ReactElement) {
  return renderToString(
    <AuthProvider>
      <UsersProvider>
        <SubjectsProvider>
          <GroupsProvider>{ui}</GroupsProvider>
        </SubjectsProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

function rtlRenderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <UsersProvider>
        <SubjectsProvider>
          <GroupsProvider>{ui}</GroupsProvider>
        </SubjectsProvider>
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

  it('renders a StatCard with expected title', () => {
    rtlRenderWithProviders(<ReportsAnalysis />);
    const card = screen.getByText('Total de Usuarios');
    expect(card).toBeInTheDocument();
  });
});
