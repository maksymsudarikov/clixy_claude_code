import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_TENANT: 'olga',
  },
});
