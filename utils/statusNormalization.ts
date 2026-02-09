import type { Shoot } from '../types';

export const normalizePhotoStatus = (value?: string): Shoot['photoStatus'] => {
  switch (value) {
    case 'selection_ready':
    case 'selection_in_progress':
    case 'selected':
    case 'editing':
    case 'delivered':
    case 'pending':
      return value;
    case 'editing_in_progress':
      return 'editing';
    case 'completed':
      return 'delivered';
    default:
      return 'pending';
  }
};

export const normalizeVideoStatus = (value?: string): Shoot['videoStatus'] => {
  switch (value) {
    case 'pending':
    case 'draft':
    case 'editing':
    case 'review':
    case 'final':
      return value;
    case 'in_progress':
      return 'editing';
    case 'in_review':
    case 'revision_requested':
      return 'review';
    case 'approved':
    case 'delivered':
      return 'final';
    default:
      return 'pending';
  }
};
