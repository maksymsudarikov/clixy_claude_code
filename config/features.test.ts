import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadFeatures = async () => import('./features');

describe('Feature Flags', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('uses Olga config when VITE_TENANT=olga', async () => {
    vi.stubEnv('VITE_TENANT', 'olga');
    const { FEATURES, CURRENT_TENANT, isFeatureEnabled } = await loadFeatures();

    expect(CURRENT_TENANT).toBe('olga');
    expect(FEATURES.giftCards).toBe(false);
    expect(FEATURES.packageCatalog).toBe(true);
    expect(FEATURES.tallyForms).toBe(true);
    expect(FEATURES.aiAssistant).toBe(false);
    expect(isFeatureEnabled('formWizard')).toBe(true);
  });

  it('uses Generic config when VITE_TENANT=generic', async () => {
    vi.stubEnv('VITE_TENANT', 'generic');
    const { FEATURES, CURRENT_TENANT, isFeatureEnabled } = await loadFeatures();

    expect(CURRENT_TENANT).toBe('generic');
    expect(FEATURES.giftCards).toBe(false);
    expect(FEATURES.packageCatalog).toBe(false);
    expect(FEATURES.tallyForms).toBe(false);
    expect(FEATURES.notifications).toBe(false);
    expect(isFeatureEnabled('formWizard')).toBe(true);
  });

  it('defaults to Olga when VITE_TENANT is not set', async () => {
    const { FEATURES, CURRENT_TENANT } = await loadFeatures();

    expect(CURRENT_TENANT).toBe('olga');
    expect(FEATURES.packageCatalog).toBe(true);
  });
});
