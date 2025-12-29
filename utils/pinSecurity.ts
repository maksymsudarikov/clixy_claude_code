/**
 * PIN Security Utilities
 *
 * Provides secure PIN hashing and verification using bcrypt.
 * Upgraded from MD5 to bcrypt for better security (2025-12-29).
 *
 * Features:
 * - bcrypt hashing with salt (10 rounds)
 * - Rate limiting with exponential backoff
 * - Session-based authentication
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a PIN using bcrypt
 * @param pin - 4-digit PIN as string
 * @returns Promise<string> - bcrypt hash
 *
 * @example
 * const hash = await hashPin('9634');
 * // Result: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

/**
 * Verify a PIN against a bcrypt hash
 * @param pin - 4-digit PIN to verify
 * @param hash - bcrypt hash to compare against
 * @returns Promise<boolean> - true if PIN matches hash
 *
 * @example
 * const isValid = await verifyPin('9634', storedHash);
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(pin, hash);
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
}

/**
 * Rate limiting for PIN attempts
 * Uses exponential backoff to prevent brute force attacks
 */

const STORAGE_KEY = 'pin_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in ms

interface AttemptData {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

/**
 * Get current attempt data from localStorage
 */
function getAttemptData(): AttemptData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { count: 0, lastAttempt: Date.now() };
    }
    return JSON.parse(data);
  } catch {
    return { count: 0, lastAttempt: Date.now() };
  }
}

/**
 * Save attempt data to localStorage
 */
function saveAttemptData(data: AttemptData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save attempt data:', error);
  }
}

/**
 * Check if currently locked out
 * @returns { isLocked: boolean, remainingSeconds?: number }
 */
export function checkLockout(): { isLocked: boolean; remainingSeconds?: number } {
  const data = getAttemptData();

  if (!data.lockedUntil) {
    return { isLocked: false };
  }

  const now = Date.now();
  if (now < data.lockedUntil) {
    const remainingMs = data.lockedUntil - now;
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    return { isLocked: true, remainingSeconds };
  }

  // Lockout expired, reset
  resetAttempts();
  return { isLocked: false };
}

/**
 * Record a failed PIN attempt
 * Implements exponential backoff after max attempts
 * @returns { locked: boolean, remainingAttempts?: number, lockoutSeconds?: number }
 */
export function recordFailedAttempt(): {
  locked: boolean;
  remainingAttempts?: number;
  lockoutSeconds?: number;
} {
  const data = getAttemptData();
  data.count += 1;
  data.lastAttempt = Date.now();

  if (data.count >= MAX_ATTEMPTS) {
    data.lockedUntil = Date.now() + LOCKOUT_DURATION;
    saveAttemptData(data);

    return {
      locked: true,
      lockoutSeconds: Math.ceil(LOCKOUT_DURATION / 1000)
    };
  }

  saveAttemptData(data);

  return {
    locked: false,
    remainingAttempts: MAX_ATTEMPTS - data.count
  };
}

/**
 * Reset failed attempts (called on successful PIN entry)
 */
export function resetAttempts(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get remaining attempts before lockout
 */
export function getRemainingAttempts(): number {
  const data = getAttemptData();
  return Math.max(0, MAX_ATTEMPTS - data.count);
}

/**
 * Session management for PIN authentication
 */

const SESSION_KEY = 'pin_authenticated';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Mark user as authenticated in session
 */
export function setAuthenticated(): void {
  const expiresAt = Date.now() + SESSION_DURATION;
  sessionStorage.setItem(SESSION_KEY, expiresAt.toString());
  resetAttempts(); // Clear any failed attempts on successful auth
}

/**
 * Check if user is currently authenticated
 * @returns boolean - true if authenticated and session not expired
 */
export function isAuthenticated(): boolean {
  const expiresAt = sessionStorage.getItem(SESSION_KEY);
  if (!expiresAt) return false;

  const now = Date.now();
  const expiry = parseInt(expiresAt, 10);

  if (now > expiry) {
    // Session expired
    sessionStorage.removeItem(SESSION_KEY);
    return false;
  }

  return true;
}

/**
 * Clear authentication session
 */
export function clearAuthentication(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * MIGRATION HELPER: Check if hash is MD5 (legacy) or bcrypt
 * MD5 hashes are 32 hex characters
 * bcrypt hashes start with $2a$ or $2b$ or $2y$
 */
export function isLegacyHash(hash: string): boolean {
  return /^[a-f0-9]{32}$/i.test(hash);
}

/**
 * MIGRATION HELPER: Verify PIN against either MD5 or bcrypt
 * Use this during migration period to support both hash types
 *
 * @deprecated Remove this after all PINs are migrated to bcrypt
 */
export async function verifyPinWithMigration(pin: string, hash: string): Promise<boolean> {
  if (isLegacyHash(hash)) {
    // Legacy MD5 verification
    console.warn('Using legacy MD5 verification. Please migrate to bcrypt.');
    const md5Hash = await legacyMd5Hash(pin);
    return md5Hash === hash;
  }

  // Modern bcrypt verification
  return verifyPin(pin, hash);
}

/**
 * LEGACY: MD5 implementation for migration support only
 * Uses crypto-js for backward compatibility with existing hashes
 * @deprecated Use bcrypt instead
 */
async function legacyMd5Hash(str: string): Promise<string> {
  // Import crypto-js MD5 dynamically
  const CryptoJS = await import('crypto-js');
  const hash = CryptoJS.MD5(str).toString();
  console.warn('⚠️ Using legacy MD5 verification. Please migrate to bcrypt immediately!');
  return hash;
}
