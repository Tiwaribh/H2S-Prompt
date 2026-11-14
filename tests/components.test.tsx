import React from 'react';
import { renderToString } from 'react-dom/server';
import { AQIBadge } from '../src/components/AQIBadge';

describe('Component Rendering & Accessibility Tests', () => {
  it('renders AQIBadge with accessible role and label for moderate air quality', () => {
    const html = renderToString(<AQIBadge aqi={142} size="md" showCategory={true} />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Air Quality Index 142, Moderate"');
    expect(html).toContain('142');
    expect(html).toContain('Moderate');
  });

  it('renders AQIBadge for good air quality', () => {
    const html = renderToString(<AQIBadge aqi={35} size="lg" showCategory={true} />);
    expect(html).toContain('Good');
    expect(html).toContain('35');
  });

  it('renders AQIBadge gracefully for null data', () => {
    const html = renderToString(<AQIBadge aqi={null} />);
    expect(html).toContain('N/A');
    expect(html).toContain('Air Quality Index unavailable');
  });
});
