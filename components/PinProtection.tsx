import React, { useEffect, useState } from 'react';
import {
  getCurrentAdminUser,
  onAdminAuthStateChange,
  sendAdminLoginCode,
  signOutAdmin,
  verifyAdminLoginCode,
} from '../services/authService';

interface PinProtectionProps {
  children: React.ReactNode;
}

export const PinProtection: React.FC<PinProtectionProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      const user = await getCurrentAdminUser();
      if (!mounted) return;
      setIsVerified(!!user);
      setCheckingSession(false);
    };
    loadSession();

    const unsubscribe = onAdminAuthStateChange(async () => {
      const user = await getCurrentAdminUser();
      if (!mounted) return;
      setIsVerified(!!user);
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await sendAdminLoginCode(email);
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send login code');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await verifyAdminLoginCode(email, code);
      setIsVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await signOutAdmin();
      setIsVerified(false);
      setCode('');
      setCodeSent(false);
    } finally {
      setBusy(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#D8D9CF] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-[#141413] p-6 max-w-md w-full text-center shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
          <p className="text-sm uppercase tracking-widest text-[#141413]">Checking Session...</p>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <>
        <div className="sticky top-0 z-50 backdrop-blur-sm bg-[#D8D9CF]/95 border-b border-[#141413]/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end">
            <button
              onClick={handleLogout}
              disabled={busy}
              className="bg-[#141413] text-white px-4 py-2 text-sm font-medium hover:bg-white hover:text-[#141413] border-2 border-[#141413] transition-colors disabled:opacity-60"
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
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#141413] mb-2">CLIXY</h1>
          <p className="text-sm sm:text-base text-[#9E9E98]">Admin Email Login</p>
        </div>

        {!codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#141413] mb-2 uppercase tracking-wider">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border-2 border-[#141413] focus:outline-none focus:ring-2 focus:ring-[#141413]"
                placeholder="you@company.com"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-[#141413] text-white hover:bg-[#2a2a29] disabled:opacity-60 font-bold text-sm uppercase tracking-wider"
            >
              {busy ? 'Sending...' : 'Send Login Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-[#141413] mb-2 uppercase tracking-wider">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                className="w-full px-4 py-3 border-2 border-[#141413] focus:outline-none focus:ring-2 focus:ring-[#141413] text-center text-xl tracking-[0.3em]"
                placeholder="123456"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-[#141413] text-white hover:bg-[#2a2a29] disabled:opacity-60 font-bold text-sm uppercase tracking-wider"
            >
              {busy ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setCodeSent(false);
                setCode('');
                setError('');
              }}
              className="w-full py-2 text-xs uppercase tracking-widest text-[#141413] border border-[#141413] hover:bg-[#141413] hover:text-white transition-colors"
            >
              Use a Different Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
