import { describe, it, expect } from 'vitest';
import { getVisiblePhases, getDefaultPhase } from '../components/ShootDetails';
import { Shoot } from '../types';

const baseShoot: Partial<Shoot> = {
  status: 'pending',
  projectType: 'photo_shoot',
  photoStatus: undefined,
  videoStatus: undefined,
};

describe('getVisiblePhases', () => {
  it('shows only pre-production when status is pending', () => {
    const phases = getVisiblePhases({ ...baseShoot, status: 'pending' } as Shoot);
    expect(phases).toEqual(['pre-production']);
  });

  it('shows pre-production and production when in_progress', () => {
    const phases = getVisiblePhases({ ...baseShoot, status: 'in_progress' } as Shoot);
    expect(phases).toEqual(['pre-production', 'production']);
  });

  it('shows all three phases when completed', () => {
    const phases = getVisiblePhases({ ...baseShoot, status: 'completed' } as Shoot);
    expect(phases).toEqual(['pre-production', 'production', 'post-production']);
  });

  it('shows all three phases when delivered', () => {
    const phases = getVisiblePhases({ ...baseShoot, status: 'delivered' } as Shoot);
    expect(phases).toEqual(['pre-production', 'production', 'post-production']);
  });

  it('shows post-production early if photoStatus is set while in_progress', () => {
    const phases = getVisiblePhases({ ...baseShoot, status: 'in_progress', photoStatus: 'selection_ready' } as Shoot);
    expect(phases).toEqual(['pre-production', 'production', 'post-production']);
  });

  it('shows post-production early if videoStatus is set while in_progress', () => {
    const phases = getVisiblePhases({ ...baseShoot, status: 'in_progress', videoStatus: 'draft' } as Shoot);
    expect(phases).toEqual(['pre-production', 'production', 'post-production']);
  });
});

describe('getDefaultPhase', () => {
  it('defaults to most advanced visible phase', () => {
    expect(getDefaultPhase(['pre-production', 'production'])).toBe('production');
    expect(getDefaultPhase(['pre-production'])).toBe('pre-production');
    expect(getDefaultPhase(['pre-production', 'production', 'post-production'])).toBe('post-production');
  });
});
