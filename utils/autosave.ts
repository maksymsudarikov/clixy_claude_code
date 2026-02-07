/**
 * Auto-save utilities for form data
 *
 * Automatically saves form drafts to localStorage at regular intervals
 * and provides utilities for loading and clearing drafts.
 */

const AUTOSAVE_PREFIX = 'clixy_draft_';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export interface AutoSaveOptions {
  key: string;
  data: any;
  enabled?: boolean;
}

/**
 * Get the localStorage key for a draft
 */
export const getDraftKey = (key: string): string => {
  return `${AUTOSAVE_PREFIX}${key}`;
};

/**
 * Save draft to localStorage
 */
export const saveDraft = (key: string, data: any): void => {
  try {
    const draftKey = getDraftKey(key);
    const draftData = {
      data,
      savedAt: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
  } catch (error) {
    console.warn('Failed to save draft:', error);
  }
};

/**
 * Load draft from localStorage
 */
export const loadDraft = <T>(key: string): T | null => {
  try {
    const draftKey = getDraftKey(key);
    const saved = localStorage.getItem(draftKey);

    if (!saved) return null;

    const parsed = JSON.parse(saved);
    return parsed.data as T;
  } catch (error) {
    console.warn('Failed to load draft:', error);
    return null;
  }
};

/**
 * Get draft metadata (when it was saved)
 */
export const getDraftMetadata = (key: string): { savedAt: string } | null => {
  try {
    const draftKey = getDraftKey(key);
    const saved = localStorage.getItem(draftKey);

    if (!saved) return null;

    const parsed = JSON.parse(saved);
    return { savedAt: parsed.savedAt };
  } catch (error) {
    return null;
  }
};

/**
 * Clear draft from localStorage
 */
export const clearDraft = (key: string): void => {
  try {
    const draftKey = getDraftKey(key);
    localStorage.removeItem(draftKey);
  } catch (error) {
    console.warn('Failed to clear draft:', error);
  }
};

/**
 * Check if a draft exists
 */
export const hasDraft = (key: string): boolean => {
  try {
    const draftKey = getDraftKey(key);
    return localStorage.getItem(draftKey) !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Get formatted time since draft was saved
 */
export const getTimeSinceSave = (savedAt: string): string => {
  const now = new Date();
  const saved = new Date(savedAt);
  const diffMs = now.getTime() - saved.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

/**
 * Clear all drafts (useful for cleanup)
 */
export const clearAllDrafts = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(AUTOSAVE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear drafts:', error);
  }
};

/**
 * React hook for auto-saving form data
 */
export const useAutoSave = (key: string, data: any, enabled: boolean = true, interval: number = AUTOSAVE_INTERVAL) => {
  // This is a placeholder - actual implementation would use useEffect
  // The hook will be implemented in the component that uses it
  return {
    saveDraft: () => saveDraft(key, data),
    loadDraft: () => loadDraft(key),
    clearDraft: () => clearDraft(key),
    hasDraft: () => hasDraft(key)
  };
};
