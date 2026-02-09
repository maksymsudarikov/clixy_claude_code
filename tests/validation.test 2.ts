import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidUrl, sanitizeUrl, validateShootForm } from '../utils/validation.ts';

test('isValidUrl accepts http/https and empty string', () => {
  assert.equal(isValidUrl(''), true);
  assert.equal(isValidUrl('https://example.com/path?q=1'), true);
  assert.equal(isValidUrl('http://localhost:3000'), true);
});

test('isValidUrl rejects unsupported protocols and invalid URLs', () => {
  assert.equal(isValidUrl('ftp://example.com/file'), false);
  assert.equal(isValidUrl('not-a-url'), false);
});

test('sanitizeUrl trims and removes dangerous protocols', () => {
  assert.equal(sanitizeUrl('  https://example.com  '), 'https://example.com');
  assert.equal(sanitizeUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeUrl('data:text/html;base64,abc'), '');
  assert.equal(sanitizeUrl('file:///etc/passwd'), '');
});

test('validateShootForm enforces required fields and URL validity', () => {
  const result = validateShootForm({
    title: '',
    client: '',
    date: '',
    description: '',
    locationAddress: '',
    coverImage: 'invalid-url',
    moodboardUrl: 'javascript:alert(1)',
    callSheetUrl: 'https://example.com/call-sheet.pdf',
    finalPhotosUrl: 'invalid-url',
    stylingUrl: 'https://example.com/style',
    locationMapUrl: 'invalid-url',
    projectType: 'photo_shoot',
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.includes('Title is required'));
  assert.ok(result.errors.includes('Client is required'));
  assert.ok(result.errors.includes('Date is required'));
  assert.ok(result.errors.includes('Description is required'));
  assert.ok(result.errors.includes('Location address is required'));
  assert.ok(result.errors.includes('Cover image URL is invalid'));
  assert.ok(result.errors.includes('Moodboard URL is invalid'));
  assert.ok(result.errors.includes('Final photos URL is invalid'));
  assert.ok(result.errors.includes('Location map URL is invalid'));
});

test('validateShootForm does not require location for video projects', () => {
  const result = validateShootForm({
    title: 'Campaign Reel',
    client: 'Acme',
    date: '2026-02-07',
    description: 'Short vertical video campaign.',
    locationAddress: '',
    coverImage: '',
    projectType: 'video_project',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
});
