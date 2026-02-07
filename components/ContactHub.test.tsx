import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const renderContactHub = async (tenant: 'olga' | 'generic') => {
  vi.resetModules();
  vi.stubEnv('VITE_TENANT', tenant);
  const { ContactHub } = await import('./ContactHub');
  render(<ContactHub />);
};

describe('ContactHub', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows tally cards for olga tenant', async () => {
    await renderContactHub('olga');

    expect(screen.getByText('Work With Us')).toBeInTheDocument();
    expect(screen.getByText("I'm a Model")).toBeInTheDocument();
    expect(screen.getByText('Brand Partnership')).toBeInTheDocument();
    expect(screen.getByText('Share Your Vision')).toBeInTheDocument();
    expect(screen.getByText('Shoot Details')).toBeInTheDocument();
    expect(screen.getByText('art@olgaprudka.com')).toBeInTheDocument();
  });

  it('shows generic contact variant for generic tenant', async () => {
    await renderContactHub('generic');

    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
    expect(screen.getByText(/Interested in Clixy/i)).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.queryByText("I'm a Model")).not.toBeInTheDocument();
  });

  it('uses secure external-link attributes for tally forms', async () => {
    await renderContactHub('olga');

    const links = screen.getAllByRole('link').filter((link) =>
      link.getAttribute('href')?.includes('tally.so')
    );
    expect(links.length).toBe(4);
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
