import assert from 'node:assert/strict';
import test from 'node:test';
import { generateSecureToken, isValidTokenFormat } from '../utils/tokenUtils.ts';

test('generateSecureToken returns a valid 32-char lowercase hex token', () => {
  const token = generateSecureToken();
  assert.equal(token.length, 32);
  assert.match(token, /^[a-f0-9]{32}$/);
  assert.equal(isValidTokenFormat(token), true);
});

test('generateSecureToken produces unique values across samples', () => {
  const sampleSize = 64;
  const tokens = new Set<string>();

  for (let i = 0; i < sampleSize; i += 1) {
    tokens.add(generateSecureToken());
  }

  assert.equal(tokens.size, sampleSize);
});

test('isValidTokenFormat rejects invalid values', () => {
  assert.equal(isValidTokenFormat(undefined), false);
  assert.equal(isValidTokenFormat(null), false);
  assert.equal(isValidTokenFormat(''), false);
  assert.equal(isValidTokenFormat('abc123'), false);
  assert.equal(isValidTokenFormat('A'.repeat(32)), false);
  assert.equal(isValidTokenFormat('g'.repeat(32)), false);
});
