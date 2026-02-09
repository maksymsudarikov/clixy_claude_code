import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeUrl, validateShootForm } from '../utils/validation';

describe('validation', () => {
  it('isValidUrl accepts http/https and empty string', () => {
    expect(isValidUrl('')).toBe(true);
    expect(isValidUrl('https://example.com/path?q=1')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
  });

  it('isValidUrl rejects unsupported protocols and invalid URLs', () => {
    expect(isValidUrl('ftp://example.com/file')).toBe(false);
    expect(isValidUrl('not-a-url')).toBe(false);
  });

  it('sanitizeUrl trims and removes dangerous protocols', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('data:text/html;base64,abc')).toBe('');
    expect(sanitizeUrl('file:///etc/passwd')).toBe('');
  });

  it('validateShootForm enforces required fields and URL validity', () => {
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

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
    expect(result.errors).toContain('Client is required');
    expect(result.errors).toContain('Date is required');
    expect(result.errors).toContain('Description is required');
    expect(result.errors).toContain('Location address is required');
    expect(result.errors).toContain('Cover image URL is invalid');
    expect(result.errors).toContain('Moodboard URL is invalid');
    expect(result.errors).toContain('Final photos URL is invalid');
    expect(result.errors).toContain('Location map URL is invalid');
  });

  it('validateShootForm does not require location for video projects', () => {
    const result = validateShootForm({
      title: 'Campaign Reel',
      client: 'Acme',
      date: '2026-02-07',
      description: 'Short vertical video campaign.',
      locationAddress: '',
      coverImage: '',
      projectType: 'video_project',
    });

    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});
