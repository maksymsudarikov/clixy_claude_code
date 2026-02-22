import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

vi.mock('../config/features', () => ({
  FEATURES: { giftCards: false },
}));

import { getAdminAuthState } from '../components/AdminAuth';

describe('getAdminAuthState', () => {
  it('returns loading when session is undefined', () => {
    expect(getAdminAuthState(undefined)).toBe('loading');
  });
  it('returns unauthenticated when session is null', () => {
    expect(getAdminAuthState(null)).toBe('unauthenticated');
  });
  it('returns authenticated when session object exists', () => {
    expect(getAdminAuthState({ user: { email: 'a@b.com' } } as any)).toBe('authenticated');
  });
});
