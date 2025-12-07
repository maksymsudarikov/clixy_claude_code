import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ShootDetails } from './components/ShootDetails';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ShootForm } from './components/ShootForm';
import { GiftCardPurchase } from './components/giftcard/GiftCardPurchase';
import { GiftCardSuccess } from './components/giftcard/GiftCardSuccess';
import { PinProtection } from './components/PinProtection';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationContainer } from './components/NotificationContainer';
import { Shoot } from './types';
import { fetchShootById, fetchAllShoots } from './services/sheetService';

const ShootRoute = () => {
  const { id } = useParams<{ id: string }>();
  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchShootById(id);
        if (data) {
          setShoot(data);
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
  }, [id]);

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
          <Route path="/gift-card" element={<GiftCardPurchase />} />
          <Route path="/gift-card/success/:id" element={<GiftCardSuccess />} />

          {/* Protected routes - PIN required */}
          <Route path="/" element={<PinProtection><HomeRoute /></PinProtection>} />
          <Route path="/admin" element={<PinProtection><AdminDashboard /></PinProtection>} />
          <Route path="/admin/create" element={<PinProtection><ShootForm /></PinProtection>} />
          <Route path="/admin/edit/:id" element={<PinProtection><ShootForm /></PinProtection>} />
          <Route path="/shoot/:id" element={<PinProtection><ShootRoute /></PinProtection>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </HashRouter>
  );
};

export default App;
