import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('./components/Landing', () => ({
  Landing: () => <div data-testid="landing">Landing</div>,
}));

vi.mock('./components/AdminDashboard', () => ({
  AdminDashboard: () => <div data-testid="admin-dashboard">Admin Dashboard</div>,
}));

vi.mock('./components/ShootForm', () => ({
  ShootForm: () => <div data-testid="shoot-form">Shoot Form</div>,
}));

vi.mock('./components/form/ShootFormWizard', () => ({
  ShootFormWizard: () => <div data-testid="shoot-form-wizard">Shoot Form Wizard</div>,
}));

vi.mock('./components/ShootDetails', () => ({
  ShootDetails: () => <div data-testid="shoot-details">Shoot Details</div>,
}));

vi.mock('./components/PinProtection', () => ({
  PinProtection: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./components/NotificationContainer', () => ({
  NotificationContainer: () => null,
}));

vi.mock('./components/TermsModal', () => ({
  TermsModal: () => null,
}));

vi.mock('./services/shootService', () => ({
  fetchShootByIdAdmin: vi.fn(),
  fetchShootByShareToken: vi.fn(),
  updateShoot: vi.fn(),
}));

vi.mock('./services/authService', () => ({
  getCurrentAdminUser: vi.fn(),
}));

vi.mock('./services/shareLinkService', () => ({
  acceptTermsViaShareLink: vi.fn(),
}));

const renderAt = async (hash: string) => {
  window.location.hash = hash;
  const { default: App } = await import('./App');
  render(<App />);
};

describe('App Routes', () => {
  it('renders landing on root route', async () => {
    await renderAt('#/');
    expect(screen.getByTestId('landing')).toBeInTheDocument();
  });

  it('renders admin dashboard on /studio', async () => {
    await renderAt('#/studio');
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
  });

  it('redirects unknown routes to landing', async () => {
    await renderAt('#/unknown-route');
    expect(screen.getByTestId('landing')).toBeInTheDocument();
  });

  it('redirects legacy gift-card route to landing', async () => {
    await renderAt('#/gift-card');
    expect(screen.getByTestId('landing')).toBeInTheDocument();
  });

  it('redirects legacy gift-card success route to landing', async () => {
    await renderAt('#/gift-card/success');
    expect(screen.getByTestId('landing')).toBeInTheDocument();
  });
});
