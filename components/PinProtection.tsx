import React, { useState, useEffect } from 'react';
import {
  verifyPinWithMigration,
  checkLockout,
  recordFailedAttempt,
  resetAttempts,
  setAuthenticated,
  isAuthenticated,
  clearAuthentication
} from '../utils/pinSecurity';

interface PinProtectionProps {
  children: React.ReactNode;
}

// Get PIN hash from environment variable
const ADMIN_PIN_HASH = import.meta.env.VITE_ADMIN_PIN_HASH;

// Fallback hash for development (PIN: 9634)
// IMPORTANT: Set VITE_ADMIN_PIN_HASH in your .env file for production!
// Legacy MD5 hash - will be deprecated
const DEFAULT_PIN_HASH = 'ebe922af8d4560c73368a88eeac07d16';

export const PinProtection: React.FC<PinProtectionProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Проверяем сессию при монтировании компонента
  useEffect(() => {
    // Используем новую функцию isAuthenticated из pinSecurity
    if (isAuthenticated()) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }

    // Проверяем блокировку
    const lockStatus = checkLockout();
    if (lockStatus.isLocked && lockStatus.remainingSeconds) {
      setIsLocked(true);
      setLockoutTime(lockStatus.remainingSeconds);
      setError(`Too many failed attempts. Please wait ${lockStatus.remainingSeconds} seconds.`);
    }
  }, []);

  // Update lockout timer
  useEffect(() => {
    if (!isLocked || lockoutTime <= 0) return;

    const timer = setInterval(() => {
      setLockoutTime(prev => {
        if (prev <= 1) {
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin || pin.length < 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    // Check if locked out
    const lockStatus = checkLockout();
    if (lockStatus.isLocked && lockStatus.remainingSeconds) {
      setIsLocked(true);
      setLockoutTime(lockStatus.remainingSeconds);
      setError(`Too many failed attempts. Please wait ${lockStatus.remainingSeconds} seconds.`);
      return;
    }

    // Use environment PIN hash or fallback
    const pinHash = ADMIN_PIN_HASH || DEFAULT_PIN_HASH;

    if (!pinHash) {
      setError('Security configuration error. Please contact administrator.');
      return;
    }

    try {
      // Verify PIN (supports both MD5 legacy and bcrypt)
      const isValid = await verifyPinWithMigration(pin, pinHash);

      if (isValid) {
        // Mark as authenticated in session
        setAuthenticated();

        // Reset failed attempts
        resetAttempts();

        setIsVerified(true);
        setError('');
        setIsLocked(false);
      } else {
        // Record failed attempt
        const result = recordFailedAttempt();

        setError('Incorrect PIN. Please try again.');
        setPin('');

        // Check if locked after this attempt
        if (result.locked && result.lockoutSeconds) {
          setIsLocked(true);
          setLockoutTime(result.lockoutSeconds);
          setError(`Too many failed attempts. Please wait ${result.lockoutSeconds} seconds.`);
        }
      }
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setError('An error occurred. Please try again.');
    }
  };

  const handleLogout = () => {
    // Удаляем сессию - при следующем посещении потребуется PIN
    clearAuthentication();
    setIsVerified(false);
    setPin('');
  };

  if (isVerified) {
    return (
      <>
        {/* Sticky header with backdrop */}
        <div className="sticky top-0 z-50 backdrop-blur-sm bg-[#D8D9CF]/95 border-b border-[#141413]/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end gap-2">
            <a
              href="/#/gift-card"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-[#141413] px-3 md:px-4 py-2 text-xs md:text-sm font-medium hover:bg-[#141413] hover:text-white transition-colors flex items-center gap-2 touch-manipulation"
            >
              🎁 <span className="hidden sm:inline">Gift Card Link</span><span className="sm:hidden">Gift Card</span>
            </a>
            <button
              onClick={handleLogout}
              className="bg-[#141413] text-white px-3 md:px-4 py-2 text-xs md:text-sm font-medium hover:bg-white hover:text-[#141413] border-2 border-[#141413] transition-colors touch-manipulation"
            >
              Logout
            </button>
          </div>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#D8D9CF] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border-2 border-[#141413] p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#141413] mb-2">CLIXY</h1>
          <p className="text-sm sm:text-base text-[#9E9E98]">Private Portfolio Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-[#141413] mb-2 uppercase tracking-wider">
              Enter PIN Code
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              className="w-full px-4 py-4 sm:py-3 border-2 border-[#141413] focus:outline-none focus:ring-2 focus:ring-[#141413] text-center text-2xl sm:text-3xl tracking-widest touch-manipulation"
              placeholder="••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked}
            className={`w-full py-4 sm:py-3 transition-colors font-bold text-sm uppercase tracking-wider touch-manipulation ${
              isLocked
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-[#141413] text-white hover:bg-[#2a2a29] active:bg-[#000000]'
            }`}
          >
            {isLocked ? `LOCKED (${lockoutTime}s)` : 'UNLOCK'}
          </button>
        </form>

        {!isLocked && error && (
          <div className="mt-4 text-xs text-[#9E9E98] text-center px-2">
            💡 Tip: After 5 failed attempts, you'll be locked out for 15 minutes
          </div>
        )}

        <div className="mt-6 sm:mt-8 text-center text-sm text-[#9E9E98]">
          <p className="mb-1">Looking for gift cards?</p>
          <a
            href="/#/gift-card"
            className="text-[#141413] hover:underline font-medium inline-block py-2 touch-manipulation"
          >
            Purchase a Gift Card →
          </a>
        </div>
      </div>
    </div>
  );
};
