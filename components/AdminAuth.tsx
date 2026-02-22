import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { FEATURES } from '../config/features';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export function getAdminAuthState(session: Session | null | undefined): AuthState {
  if (session === undefined) return 'loading';
  if (session === null) return 'unauthenticated';
  return 'authenticated';
}

interface AdminAuthProps {
  children: React.ReactNode;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const authState = getAdminAuthState(session);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-[#D8D9CF] flex items-center justify-center">
        <div className="text-[#141413] text-sm uppercase tracking-widest animate-pulse">Loading...</div>
      </div>
    );
  }

  if (authState === 'authenticated') {
    return (
      <>
        <div className="sticky top-0 z-50 backdrop-blur-sm bg-[#D8D9CF]/95 border-b border-[#141413]/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end gap-2">
            {FEATURES.giftCards && (
              <a
                href="/#/gift-card"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border-2 border-[#141413] px-3 md:px-4 py-2 text-xs md:text-sm font-medium hover:bg-[#141413] hover:text-white transition-colors flex items-center gap-2 touch-manipulation"
              >
                🎁 <span className="hidden sm:inline">Gift Card Link</span><span className="sm:hidden">Gift Card</span>
              </a>
            )}
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

  // Unauthenticated: show magic link form
  return (
    <div className="min-h-screen bg-[#D8D9CF] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border-2 border-[#141413] p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#141413] mb-2">CLIXY</h1>
          <p className="text-sm sm:text-base text-[#9E9E98]">Private Studio Access</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">✉️</div>
            <p className="font-bold uppercase tracking-wider text-sm">Check your email</p>
            <p className="text-sm text-[#9E9E98]">
              A login link was sent to <strong>{email}</strong>.<br />
              Click the link to access the studio.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-xs text-[#9E9E98] hover:text-[#141413] underline mt-4"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#141413] mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border-2 border-[#141413] focus:outline-none focus:ring-2 focus:ring-[#141413] text-base touch-manipulation"
                placeholder="your@email.com"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 sm:py-3 font-bold text-sm uppercase tracking-wider transition-colors touch-manipulation ${
                loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-[#141413] text-white hover:bg-[#2a2a29] active:bg-[#000000]'
              }`}
            >
              {loading ? 'Sending...' : 'Send Login Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
