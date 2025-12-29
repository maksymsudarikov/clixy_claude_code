/**
 * Token utilities for secure shoot access
 * Generates cryptographically secure random tokens
 */

/**
 * Generate a secure random token for shoot access
 * Returns a URL-safe token string (32 characters)
 */
export const generateSecureToken = (): string => {
  // Use crypto.getRandomValues for cryptographically secure random
  const array = new Uint8Array(24); // 24 bytes = 32 chars in base64
  crypto.getRandomValues(array);

  // Convert to base64 and make URL-safe
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
};

/**
 * Validate if a token matches the expected format
 * @param token - Token to validate
 * @returns true if token is valid format
 */
export const isValidTokenFormat = (token: string | null | undefined): boolean => {
  if (!token) return false;
  // Token should be 32 hexadecimal characters
  return /^[a-f0-9]{32}$/.test(token);
};
