import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ReportsAnalysis from '../src/pages/admin/ReportsAnalysis';

describe('ReportsAnalysis page', () => {
  it('renders without crashing', () => {
    expect(() => renderToString(<ReportsAnalysis />)).not.toThrow();
  });

  it('contains heading text', () => {
    const html = renderToString(<ReportsAnalysis />);
    expect(html).toContain('Reportes y Análisis');
  });
});
