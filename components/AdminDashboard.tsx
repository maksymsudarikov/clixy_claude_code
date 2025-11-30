import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shoot } from '../types';
import { fetchAllShoots, deleteShoot } from '../services/sheetService';
import { useNotification } from '../contexts/NotificationContext';
import { IconTrash, IconEdit, IconSearch } from './Icons';

export const AdminDashboard: React.FC = () => {
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => {
    loadShoots();
  }, []);

  const loadShoots = async () => {
    try {
      setLoading(true);
      const data = await fetchAllShoots();
      const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setShoots(sorted);
    } catch (err) {
      addNotification('error', 'Failed to load shoots');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      try {
        await deleteShoot(id);
        addNotification('success', 'Shoot deleted successfully');
        loadShoots();
      } catch (err) {
        addNotification('error', 'Failed to delete shoot');
      }
    }
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const baseUrl = window.location.href.split('#')[0];
    const shareUrl = `${baseUrl}#/shoot/${id}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopiedId(id);
        addNotification('success', 'Link copied to clipboard!', 2000);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        addNotification('error', 'Failed to copy link');
      });
  };

  const filteredShoots = shoots.filter(
    shoot =>
      shoot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shoot.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingShoots = filteredShoots.filter(s => new Date(s.date) >= today);
  const pastShoots = filteredShoots.filter(s => new Date(s.date) < today).reverse();

  const ShootRow = ({ shoot }: { shoot: Shoot }) => {
    const isToday = new Date(shoot.date).toDateString() === new Date().toDateString();

    return (
      <div className="grid grid-cols-12 gap-4 p-6 border-b border-[#141413] items-center hover:bg-[#F0F0EB] transition-colors bg-white group last:border-b-0">
        <div className="col-span-5">
          <Link to={`/shoot/${shoot.id}`} className="block">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-[#141413] uppercase tracking-tight">
                {shoot.title}
              </h3>
              {isToday && (
                <span className="px-2 py-0.5 bg-[#141413] text-white text-[10px] font-bold uppercase tracking-wider">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-[#9E9E98] uppercase tracking-widest mt-1 group-hover:text-[#141413]">
              {shoot.client}
            </p>
          </Link>
        </div>
        <div className="col-span-3 text-sm font-mono text-[#141413]">
          {new Date(shoot.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <div className="col-span-4 flex justify-end items-center space-x-3">
          <Link
            to={`/admin/edit/${shoot.id}`}
            className="text-[#9E9E98] hover:text-[#141413] transition-colors p-2"
            title="Edit Shoot"
            aria-label={`Edit ${shoot.title}`}
          >
            <IconEdit className="w-4 h-4" />
          </Link>
          <button
            onClick={e => handleShare(e, shoot.id)}
            className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border transition-all ${
              copiedId === shoot.id
                ? 'bg-[#141413] text-white border-[#141413]'
                : 'border-[#141413] hover:bg-[#141413] hover:text-white text-[#141413] bg-transparent'
            }`}
            aria-label="Copy share link"
          >
            {copiedId === shoot.id ? 'Copied' : 'Copy Link'}
          </button>
          <button
            onClick={e => handleDelete(e, shoot.id, shoot.title)}
            className="text-[#9E9E98] hover:text-red-600 transition-colors p-2"
            title="Delete Shoot"
            aria-label={`Delete ${shoot.title}`}
          >
            <IconTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D8D9CF]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-4 bg-black rounded-full mb-2 animate-bounce"></div>
          <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">
            Loading
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#141413] pb-8">
          <div>
            <h1 className="text-4xl font-medium uppercase tracking-tight text-[#141413] mb-2">
              Producer Admin
            </h1>
            <p className="text-[#141413] text-xs uppercase tracking-[0.2em] font-bold">
              Studio Olga Prudka
            </p>
          </div>
          <Link
            to="/admin/create"
            className="mt-6 md:mt-0 bg-[#141413] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] border border-[#141413] transition-colors"
          >
            + New Project
          </Link>
        </div>

        {shoots.length > 0 && (
          <div className="mb-8">
            <div className="relative">
              <IconSearch className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9E9E98]" />
              <input
                type="text"
                placeholder="SEARCH BY TITLE OR CLIENT..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#141413] pl-12 pr-4 py-3 text-sm uppercase placeholder-[#9E9E98] text-[#141413] focus:border-[#141413] outline-none tracking-wider"
                aria-label="Search shoots"
              />
            </div>
          </div>
        )}

        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#141413] font-bold mb-6">
            Upcoming Productions
          </h2>
          <div className="bg-white border border-[#141413] shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]">
            {upcomingShoots.length === 0 ? (
              <div className="p-12 text-center text-[#9E9E98] text-sm uppercase tracking-widest">
                {searchQuery ? 'No matching upcoming shoots.' : 'No upcoming shoots scheduled.'}
              </div>
            ) : (
              upcomingShoots.map(shoot => <ShootRow key={shoot.id} shoot={shoot} />)
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#9E9E98] font-bold mb-6">Archive</h2>
          <div className="bg-[#EAEBE6] border border-[#9E9E98]">
            {pastShoots.length === 0 ? (
              <div className="p-12 text-center text-[#9E9E98] text-sm uppercase tracking-widest">
                {searchQuery ? 'No matching past shoots.' : 'No past shoots.'}
              </div>
            ) : (
              pastShoots.map(shoot => <ShootRow key={shoot.id} shoot={shoot} />)
            )}
          </div>
        </div>

        <div className="mt-24 text-center">
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-widest text-[#9E9E98] hover:text-[#141413] border-b border-transparent hover:border-[#141413] pb-0.5 transition-all"
          >
            Return to Client Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
