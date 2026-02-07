import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('./ContactHub', () => ({
  ContactHub: () => <div data-testid="contact-hub">Contact Hub</div>,
}));

const renderLanding = async (tenant: 'olga' | 'generic') => {
  vi.resetModules();
  vi.stubEnv('VITE_TENANT', tenant);
  const { Landing } = await import('./Landing');
  render(
    <BrowserRouter>
      <Landing />
    </BrowserRouter>
  );
};

describe('Landing', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows package catalog block for olga tenant', async () => {
    await renderLanding('olga');

    expect(screen.getByText('Photography Sessions')).toBeInTheDocument();
    expect(screen.getByText(/Couple Photoshoot/i)).toBeInTheDocument();
    expect(screen.getByText(/Street Style/i)).toBeInTheDocument();
    expect(screen.getByText(/Family Photoshoot/i)).toBeInTheDocument();
  });

  it('hides package catalog block for generic tenant', async () => {
    await renderLanding('generic');

    expect(screen.queryByText('Photography Sessions')).not.toBeInTheDocument();
    expect(screen.queryByText(/Couple Photoshoot/i)).not.toBeInTheDocument();
  });

  it('does not render gift-card links', async () => {
    await renderLanding('olga');
    expect(screen.queryByText(/Gift Cards/i)).not.toBeInTheDocument();
  });

  it('renders core hero and cta links', async () => {
    await renderLanding('olga');

    expect(screen.getByText('CLIXY')).toBeInTheDocument();
    expect(screen.getByText('Studio Olga Prudka®')).toBeInTheDocument();
    expect(screen.getByText(/Team Access/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Work With Us/i).length).toBeGreaterThan(0);
  });

  it('renders contact hub placeholder', async () => {
    await renderLanding('olga');
    expect(screen.getByTestId('contact-hub')).toBeInTheDocument();
  });
});
