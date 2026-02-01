import { MOCK_SHOOTS } from '../constants';
import { Shoot } from '../types';

const STORAGE_KEY = 'clixy_shoots_data';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

const getStoredShoots = (): Shoot[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SHOOTS));
    return MOCK_SHOOTS;
  } catch (e) {
    console.error('Storage error:', e);
    throw new StorageError('Failed to access local storage');
  }
};

const saveShootsToStorage = (shoots: Shoot[]): void => {
  try {
    const data = JSON.stringify(shoots);

    if (data.length > MAX_STORAGE_SIZE) {
      throw new StorageError('Storage limit exceeded. Please remove some shoots.');
    }

    localStorage.setItem(STORAGE_KEY, data);
  } catch (e) {
    if (e instanceof StorageError) throw e;

    if (e instanceof Error && e.name === 'QuotaExceededError') {
      throw new StorageError('Storage quota exceeded. Please clear some data.');
    }

    throw new StorageError('Failed to save data');
  }
};

export const fetchShootById = async (id: string): Promise<Shoot | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const shoots = getStoredShoots();
  return shoots.find(s => s.id === id);
};

export const fetchAllShoots = async (): Promise<Shoot[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return getStoredShoots();
};

export const createShoot = async (shoot: Shoot): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const currentShoots = getStoredShoots();

  if (currentShoots.some(s => s.id === shoot.id)) {
    throw new Error('A shoot with this ID already exists');
  }

  const updatedShoots = [shoot, ...currentShoots];
  saveShootsToStorage(updatedShoots);
};

export const updateShoot = async (shoot: Shoot): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const currentShoots = getStoredShoots();
  const index = currentShoots.findIndex(s => s.id === shoot.id);

  if (index === -1) {
    throw new Error('Shoot not found');
  }

  currentShoots[index] = shoot;
  saveShootsToStorage(currentShoots);
};

export const deleteShoot = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const currentShoots = getStoredShoots();
  const updatedShoots = currentShoots.filter(s => s.id !== id);

  if (updatedShoots.length === currentShoots.length) {
    throw new Error('Shoot not found');
  }

  saveShootsToStorage(updatedShoots);
};
