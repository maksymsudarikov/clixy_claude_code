import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePhotoStatus, normalizeVideoStatus } from '../utils/statusNormalization.ts';

test('normalizePhotoStatus keeps canonical values', () => {
  assert.equal(normalizePhotoStatus('pending'), 'pending');
  assert.equal(normalizePhotoStatus('selection_ready'), 'selection_ready');
  assert.equal(normalizePhotoStatus('selection_in_progress'), 'selection_in_progress');
  assert.equal(normalizePhotoStatus('selected'), 'selected');
  assert.equal(normalizePhotoStatus('editing'), 'editing');
  assert.equal(normalizePhotoStatus('delivered'), 'delivered');
});

test('normalizePhotoStatus maps legacy values and unknowns', () => {
  assert.equal(normalizePhotoStatus('editing_in_progress'), 'editing');
  assert.equal(normalizePhotoStatus('completed'), 'delivered');
  assert.equal(normalizePhotoStatus('unknown'), 'pending');
  assert.equal(normalizePhotoStatus(undefined), 'pending');
});

test('normalizeVideoStatus keeps canonical values', () => {
  assert.equal(normalizeVideoStatus('pending'), 'pending');
  assert.equal(normalizeVideoStatus('draft'), 'draft');
  assert.equal(normalizeVideoStatus('editing'), 'editing');
  assert.equal(normalizeVideoStatus('review'), 'review');
  assert.equal(normalizeVideoStatus('final'), 'final');
});

test('normalizeVideoStatus maps legacy values and unknowns', () => {
  assert.equal(normalizeVideoStatus('in_progress'), 'editing');
  assert.equal(normalizeVideoStatus('in_review'), 'review');
  assert.equal(normalizeVideoStatus('revision_requested'), 'review');
  assert.equal(normalizeVideoStatus('approved'), 'final');
  assert.equal(normalizeVideoStatus('delivered'), 'final');
  assert.equal(normalizeVideoStatus('unknown'), 'pending');
  assert.equal(normalizeVideoStatus(undefined), 'pending');
});
