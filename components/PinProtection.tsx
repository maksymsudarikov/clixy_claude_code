import React, { useState, useEffect } from 'react';

interface PinProtectionProps {
  children: React.ReactNode;
}

const CORRECT_PIN = '9634'; // Change this to your desired PIN
const SESSION_KEY = 'clixy_session_id';

export const PinProtection: React.FC<PinProtectionProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Проверяем сессию при монтировании компонента
  useEffect(() => {
    const currentSessionId = sessionStorage.getItem(SESSION_KEY);

    // Если сессии нет - это новое посещение, требуем PIN
    if (!currentSessionId) {
      setIsVerified(false);
      return;
    }

    // Если сессия есть, проверяем что она валидна
    // (в будущем можно добавить проверку на время)
    setIsVerified(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pin === CORRECT_PIN) {
      // Создаем уникальный ID сессии (валиден только на время открытой вкладки)
      const sessionId = `session_${Date.now()}_${Math.random()}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);

      setIsVerified(true);
      setError('');
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
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
            className="w-full bg-[#141413] text-white py-3 hover:bg-[#2a2a29] transition-colors font-medium"
          >
            UNLOCK
          </button>
        </form>

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
