import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ShootDetails } from './components/ShootDetails';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ShootForm } from './components/ShootForm';
import { GiftCardPurchase } from './components/giftcard/GiftCardPurchase';
import { GiftCardSuccess } from './components/giftcard/GiftCardSuccess';
import { Landing } from './components/Landing';
import { PinProtection } from './components/PinProtection';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationContainer } from './components/NotificationContainer';
import { Shoot } from './types';
import { fetchShootById, fetchAllShoots } from './services/shootService';
import { isValidTokenFormat } from './utils/tokenUtils';

const ShootRoute = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchShootById(id);
        if (data) {
          const urlToken = searchParams.get('token');
          const storageKey = `shoot_token_${id}`;
          const savedToken = localStorage.getItem(storageKey);

          // Check if URL has valid token
          if (urlToken && urlToken === data.accessToken) {
            // Save token to localStorage for future access
            localStorage.setItem(storageKey, urlToken);
            setShoot(data);
            setAccessDenied(false);
          }
          // Check if saved token is valid
          else if (savedToken && savedToken === data.accessToken) {
            setShoot(data);
            setAccessDenied(false);
          }
          // No valid token found
          else {
            setAccessDenied(true);
          }
        } else {
          setError('Shoot not found');
        }
      } catch (err) {
        setError('Failed to load shoot details');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D8D9CF]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-4 bg-black rounded-full mb-2 animate-bounce"></div>
          <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">
            Loading Clixy
          </span>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D8D9CF] px-6">
        <div className="bg-white border-2 border-[#141413] p-8 max-w-md w-full text-center shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold mb-3 uppercase tracking-tight">Access Denied</h1>
          <p className="text-sm text-[#9E9E98] mb-6 leading-relaxed">
            This shoot requires a valid access token. Please check your link or contact the studio for access.
          </p>
          <a
            href="/#/"
            className="inline-block bg-[#141413] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-[#141413] border-2 border-[#141413] transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  if (error || !shoot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D8D9CF]">
        <div className="text-center">
          <h1 className="text-xl font-light mb-2">Shoot Not Found</h1>
          <p className="text-sm text-gray-500">Please check your URL and try again.</p>
          <a href="/" className="mt-8 inline-block text-xs border-b border-black pb-0.5">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return <ShootDetails shoot={shoot} />;
};

const HomeRoute = () => {
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllShoots()
      .then(setShoots)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D8D9CF]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-4 bg-black rounded-full mb-2 animate-bounce"></div>
          <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">Loading</span>
        </div>
      </div>
    );
  }

  return <Dashboard shoots={shoots} />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <NotificationProvider>
        <NotificationContainer />
        <Routes>
          {/* Public routes - no PIN required */}
          <Route path="/" element={<Landing />} />
          <Route path="/gift-card" element={<GiftCardPurchase />} />
          <Route path="/gift-card/success" element={<GiftCardSuccess />} />
          <Route path="/shoot/:id" element={<ShootRoute />} />

          {/* Protected routes - PIN required */}
          <Route path="/dashboard" element={<PinProtection><HomeRoute /></PinProtection>} />
          <Route path="/admin" element={<PinProtection><AdminDashboard /></PinProtection>} />
          <Route path="/admin/create" element={<PinProtection><ShootForm /></PinProtection>} />
          <Route path="/admin/edit/:id" element={<PinProtection><ShootForm /></PinProtection>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </HashRouter>
  );
};

export default App;
