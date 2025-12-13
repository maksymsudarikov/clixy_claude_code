import React, { useState, useEffect } from 'react';
import { verifyPin, rateLimiter } from '../utils/pinSecurity';

interface PinProtectionProps {
  children: React.ReactNode;
}

const SESSION_KEY = 'clixy_session_id';
const RATE_LIMIT_KEY = 'clixy_rate_limit_id';

// Get PIN hash from environment variable
const ADMIN_PIN_HASH = import.meta.env.VITE_ADMIN_PIN_HASH;

// Fallback hash for development (PIN: 9634)
// IMPORTANT: Set VITE_ADMIN_PIN_HASH in your .env file for production!
const DEFAULT_PIN_HASH = 'ebe922af8d4560c73368a88eeac07d16';

export const PinProtection: React.FC<PinProtectionProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Get or create rate limit identifier
  const getRateLimitId = () => {
    let id = localStorage.getItem(RATE_LIMIT_KEY);
    if (!id) {
      id = `rl_${Date.now()}_${Math.random()}`;
      localStorage.setItem(RATE_LIMIT_KEY, id);
    }
    return id;
  };

  // Проверяем сессию при монтировании компонента
  useEffect(() => {
    const currentSessionId = sessionStorage.getItem(SESSION_KEY);

    // Если сессии нет - это новое посещение, требуем PIN
    if (!currentSessionId) {
      setIsVerified(false);
      return;
    }

    // Если сессия есть, проверяем что она валидна
    setIsVerified(true);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rateLimitId = getRateLimitId();

    // Check rate limit
    const { allowed, waitTime } = rateLimiter.checkAttempt(rateLimitId);

    if (!allowed && waitTime) {
      setIsLocked(true);
      setLockoutTime(waitTime);
      setError(`Too many failed attempts. Please wait ${waitTime} seconds.`);
      return;
    }

    // Use environment PIN hash or fallback
    const pinHash = ADMIN_PIN_HASH || DEFAULT_PIN_HASH;

    if (!pinHash) {
      setError('Security configuration error. Please contact administrator.');
      return;
    }

    if (verifyPin(pin, pinHash)) {
      // Создаем уникальный ID сессии (валиден только на время открытой вкладки)
      const sessionId = `session_${Date.now()}_${Math.random()}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);

      // Reset rate limit on successful login
      rateLimiter.resetAttempts(rateLimitId);

      setIsVerified(true);
      setError('');
      setIsLocked(false);
    } else {
      // Record failed attempt
      rateLimiter.recordFailedAttempt(rateLimitId);

      setError('Incorrect PIN. Please try again.');
      setPin('');

      // Check if we should lock after this attempt
      const { allowed: stillAllowed, waitTime: newWaitTime } = rateLimiter.checkAttempt(rateLimitId);
      if (!stillAllowed && newWaitTime) {
        setIsLocked(true);
        setLockoutTime(newWaitTime);
        setError(`Too many failed attempts. Please wait ${newWaitTime} seconds.`);
      }
    }
  };

  const handleLogout = () => {
    // Удаляем сессию - при следующем посещении потребуется PIN
    sessionStorage.removeItem(SESSION_KEY);
    setIsVerified(false);
    setPin('');
  };

  if (isVerified) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <a
            href="/#/gift-card"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border-2 border-[#141413] px-4 py-2 text-sm font-medium hover:bg-[#D8D9CF] transition-colors flex items-center gap-2"
          >
            🎁 Gift Card Link
          </a>
          <button
            onClick={handleLogout}
            className="bg-[#141413] text-white px-4 py-2 text-sm font-medium hover:bg-[#2a2a29] transition-colors"
          >
            Logout
          </button>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#D8D9CF] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#141413] p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#141413] mb-2">CLIXY</h1>
          <p className="text-[#9E9E98]">Private Portfolio Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-[#141413] mb-2">
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
              className="w-full px-4 py-3 border-2 border-[#141413] focus:outline-none focus:ring-2 focus:ring-[#141413] text-center text-2xl tracking-widest"
              placeholder="••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked}
            className={`w-full py-3 transition-colors font-medium ${
              isLocked
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-[#141413] text-white hover:bg-[#2a2a29]'
            }`}
          >
            {isLocked ? `LOCKED (${lockoutTime}s)` : 'UNLOCK'}
          </button>
        </form>

        {!isLocked && error && (
          <div className="mt-4 text-xs text-[#9E9E98] text-center">
            💡 Tip: After 5 failed attempts, you'll be locked out for 15 minutes
          </div>
        )}

        <div className="mt-8 text-center text-sm text-[#9E9E98]">
          <p>Looking for gift cards?</p>
          <a
            href="/#/gift-card"
            className="text-[#141413] hover:underline font-medium mt-1 inline-block"
          >
            Purchase a Gift Card →
          </a>
        </div>
      </div>
    </div>
  );
};
