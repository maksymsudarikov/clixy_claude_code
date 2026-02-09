import { describe, it, expect } from 'vitest';
import { generateSecureToken, isValidTokenFormat } from '../utils/tokenUtils';

describe('tokenUtils', () => {
  it('generateSecureToken returns a valid 32-char lowercase hex token', () => {
    const token = generateSecureToken();
    expect(token.length).toBe(32);
    expect(token).toMatch(/^[a-f0-9]{32}$/);
    expect(isValidTokenFormat(token)).toBe(true);
  });

  it('generateSecureToken produces unique values across samples', () => {
    const sampleSize = 64;
    const tokens = new Set<string>();

    for (let i = 0; i < sampleSize; i += 1) {
      tokens.add(generateSecureToken());
    }

    expect(tokens.size).toBe(sampleSize);
  });

  it('isValidTokenFormat rejects invalid values', () => {
    expect(isValidTokenFormat(undefined)).toBe(false);
    expect(isValidTokenFormat(null)).toBe(false);
    expect(isValidTokenFormat('')).toBe(false);
    expect(isValidTokenFormat('abc123')).toBe(false);
    expect(isValidTokenFormat('A'.repeat(32))).toBe(false);
    expect(isValidTokenFormat('g'.repeat(32))).toBe(false);
  });
});
