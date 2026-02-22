import { describe, it, expect } from 'vitest';

// Pure helper we'll extract from AdminAuth
function getAdminAuthState(session: unknown): 'loading' | 'authenticated' | 'unauthenticated' {
  if (session === undefined) return 'loading';
  if (session === null) return 'unauthenticated';
  return 'authenticated';
}

describe('getAdminAuthState', () => {
  it('returns loading when session is undefined', () => {
    expect(getAdminAuthState(undefined)).toBe('loading');
  });
  it('returns unauthenticated when session is null', () => {
    expect(getAdminAuthState(null)).toBe('unauthenticated');
  });
  it('returns authenticated when session object exists', () => {
    expect(getAdminAuthState({ user: { email: 'a@b.com' } })).toBe('authenticated');
  });
});
