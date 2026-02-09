import { describe, it, expect } from 'vitest';
import { normalizePhotoStatus, normalizeVideoStatus } from '../utils/statusNormalization';

describe('statusNormalization', () => {
  it('normalizePhotoStatus keeps canonical values', () => {
    expect(normalizePhotoStatus('pending')).toBe('pending');
    expect(normalizePhotoStatus('selection_ready')).toBe('selection_ready');
    expect(normalizePhotoStatus('selection_in_progress')).toBe('selection_in_progress');
    expect(normalizePhotoStatus('selected')).toBe('selected');
    expect(normalizePhotoStatus('editing')).toBe('editing');
    expect(normalizePhotoStatus('delivered')).toBe('delivered');
  });

  it('normalizePhotoStatus maps legacy values and unknowns', () => {
    expect(normalizePhotoStatus('editing_in_progress')).toBe('editing');
    expect(normalizePhotoStatus('completed')).toBe('delivered');
    expect(normalizePhotoStatus('unknown')).toBe('pending');
    expect(normalizePhotoStatus(undefined)).toBe('pending');
  });

  it('normalizeVideoStatus keeps canonical values', () => {
    expect(normalizeVideoStatus('pending')).toBe('pending');
    expect(normalizeVideoStatus('draft')).toBe('draft');
    expect(normalizeVideoStatus('editing')).toBe('editing');
    expect(normalizeVideoStatus('review')).toBe('review');
    expect(normalizeVideoStatus('final')).toBe('final');
  });

  it('normalizeVideoStatus maps legacy values and unknowns', () => {
    expect(normalizeVideoStatus('in_progress')).toBe('editing');
    expect(normalizeVideoStatus('in_review')).toBe('review');
    expect(normalizeVideoStatus('revision_requested')).toBe('review');
    expect(normalizeVideoStatus('approved')).toBe('final');
    expect(normalizeVideoStatus('delivered')).toBe('final');
    expect(normalizeVideoStatus('unknown')).toBe('pending');
    expect(normalizeVideoStatus(undefined)).toBe('pending');
  });
});
