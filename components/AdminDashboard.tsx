import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shoot, ShootStatus } from '../types';
import { fetchAllShoots, deleteShoot, createShoot, updateShoot } from '../services/shootService';
import { useNotification } from '../contexts/NotificationContext';
import { generateSecureToken } from '../utils/tokenUtils';
import { IconTrash, IconEdit, IconSearch, IconDuplicate } from './Icons';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export const AdminDashboard: React.FC = () => {
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; shoot: Shoot | null }>({ isOpen: false, shoot: null });
  const { addNotification } = useNotification();

  useEffect(() => {
    loadShoots();
  }, []);

  const loadShoots = async () => {
    try {
      setLoading(true);
      const data = await fetchAllShoots();
      const sorted = [...data].sort((a, b) => new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime());
      setShoots(sorted);
    } catch (err) {
      addNotification('error', 'Failed to load shoots');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, shoot: Shoot) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, shoot });
  };

  const confirmDelete = async () => {
    if (!deleteModal.shoot) return;

    try {
      await deleteShoot(deleteModal.shoot.id);
      addNotification('success', 'Shoot deleted successfully');
      setDeleteModal({ isOpen: false, shoot: null });
      loadShoots();
    } catch (err) {
      addNotification('error', 'Failed to delete shoot');
    }
  };

  const handleStatusChange = async (shoot: Shoot, newStatus: ShootStatus) => {
    try {
      const updatedShoot = { ...shoot, status: newStatus };
      await updateShoot(updatedShoot);
      addNotification('success', `Status updated to ${newStatus}`);
      loadShoots();
    } catch (err) {
      console.error('Failed to update status:', err);
      addNotification('error', 'Failed to update status');
    }
  };

  const handleShare = (e: React.MouseEvent, shoot: Shoot) => {
    e.preventDefault();
    e.stopPropagation();

    const baseUrl = window.location.href.split('#')[0];
    // Include access token in the URL for secure access
    const shareUrl = `${baseUrl}#/shoot/${shoot.id}?token=${shoot.accessToken}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopiedId(shoot.id);
        addNotification('success', 'Private link copied to clipboard!', 2000);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        addNotification('error', 'Failed to copy link');
      });
  };

  const handleDuplicate = async (e: React.MouseEvent, shoot: Shoot) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Generate unique ID and token
      const timestamp = Date.now();
      const newId = `${shoot.id}-copy-${timestamp}`;
      const newToken = generateSecureToken();

      // Create duplicate with new ID, token, and reset key fields
      const duplicateShoot: Shoot = {
        ...shoot,
        id: newId,
        accessToken: newToken,
        title: `${shoot.title} (Copy)`,
        status: 'in_progress',
        date: new Date().toISOString().split('T')[0],
        photoSelectionUrl: '',
        finalPhotosUrl: '',
        videoUrl: '',
      };

      await createShoot(duplicateShoot);
      addNotification('success', 'Shoot duplicated successfully!');
      loadShoots();
    } catch (err) {
      console.error('Failed to duplicate shoot:', err);
      addNotification('error', 'Failed to duplicate shoot');
    }
  };

  const filteredShoots = shoots.filter(
    shoot =>
      shoot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shoot.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingShoots = filteredShoots.filter(s => new Date(s.date + 'T00:00:00') >= today);
  const pastShoots = filteredShoots.filter(s => new Date(s.date + 'T00:00:00') < today).reverse();

  const ShootRow = ({ shoot }: { shoot: Shoot }) => {
    const isToday = new Date(shoot.date + 'T00:00:00').toDateString() === new Date().toDateString();

    return (
      <>
        {/* Desktop/Tablet View */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-[#141413] items-center hover:bg-[#F0F0EB] transition-colors bg-white group last:border-b-0">
          <div className="col-span-5">
            <Link to={`/shoot/${shoot.id}?token=${shoot.accessToken}`} className="block">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-[#141413] uppercase tracking-tight">
                  {shoot.title}
                </h3>
                {isToday && (
                  <span className="px-2 py-0.5 bg-[#141413] text-white text-[10px] font-bold uppercase tracking-wider">
                    Today
                  </span>
                )}
                <select
                  value={shoot.status || 'pending'}
                  onChange={(e) => {
                    e.preventDefault();
                    handleStatusChange(shoot, e.target.value as ShootStatus);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-[#141413] bg-white hover:bg-[#141413] hover:text-white transition-colors cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <p className="text-xs text-[#9E9E98] uppercase tracking-widest mt-1 group-hover:text-[#141413]">
                {shoot.client}
              </p>
            </Link>
          </div>
          <div className="col-span-3 text-sm font-mono text-[#141413]">
            {new Date(shoot.date + 'T00:00:00').toLocaleDateString(undefined, {
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
              onClick={e => handleDuplicate(e, shoot)}
              className="text-[#9E9E98] hover:text-[#141413] transition-colors p-2"
              title="Duplicate Shoot"
              aria-label={`Duplicate ${shoot.title}`}
            >
              <IconDuplicate className="w-4 h-4" />
            </button>
            <button
              onClick={e => handleShare(e, shoot)}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border transition-all ${
                copiedId === shoot.id
                  ? 'bg-[#141413] text-white border-[#141413]'
                  : 'border-[#141413] hover:bg-[#141413] hover:text-white text-[#141413] bg-transparent'
              }`}
              aria-label="Copy private share link"
            >
              {copiedId === shoot.id ? 'Copied' : 'Copy Link'}
            </button>
            <button
              onClick={e => handleDelete(e, shoot)}
              className="text-[#9E9E98] hover:text-red-600 transition-colors p-2"
              title="Delete Shoot"
              aria-label={`Delete ${shoot.title}`}
            >
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden border-b border-[#141413] p-4 bg-white last:border-b-0">
          <Link to={`/shoot/${shoot.id}?token=${shoot.accessToken}`} className="block mb-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-base text-[#141413] uppercase tracking-tight leading-tight">
                  {shoot.title}
                </h3>
                <p className="text-xs text-[#9E9E98] uppercase tracking-wider mt-1">
                  {shoot.client}
                </p>
              </div>
              {isToday && (
                <span className="ml-2 px-2 py-0.5 bg-[#141413] text-white text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-[#141413]">
              {new Date(shoot.date + 'T00:00:00').toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </Link>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#F0F0EB]">
            <Link
              to={`/admin/edit/${shoot.id}`}
              className="flex-1 text-center text-[#9E9E98] hover:text-[#141413] transition-colors py-2 px-3 border border-[#9E9E98] hover:border-[#141413] text-xs font-bold uppercase tracking-wider"
              aria-label={`Edit ${shoot.title}`}
            >
              Edit
            </Link>
            <button
              onClick={e => handleDuplicate(e, shoot)}
              className="text-[#9E9E98] hover:text-[#141413] transition-colors p-2 border border-[#9E9E98] hover:border-[#141413]"
              title="Duplicate Shoot"
              aria-label={`Duplicate ${shoot.title}`}
            >
              <IconDuplicate className="w-4 h-4" />
            </button>
            <button
              onClick={e => handleShare(e, shoot)}
              className={`flex-1 text-[9px] font-bold uppercase tracking-wider py-2 px-3 border transition-all ${
                copiedId === shoot.id
                  ? 'bg-[#141413] text-white border-[#141413]'
                  : 'border-[#141413] hover:bg-[#141413] hover:text-white text-[#141413] bg-transparent'
              }`}
              aria-label="Copy private share link"
            >
              {copiedId === shoot.id ? '✓ Copied' : 'Share'}
            </button>
            <button
              onClick={e => handleDelete(e, shoot)}
              className="text-[#9E9E98] hover:text-red-600 transition-colors p-2 border border-[#9E9E98] hover:border-red-600"
              title="Delete Shoot"
              aria-label={`Delete ${shoot.title}`}
            >
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </>
    );
  };

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#D8D9CF] text-[#141413]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#141413] pb-8">
            <div className="animate-pulse">
              <div className="h-10 w-64 bg-[#F0F0EB] mb-3"></div>
              <div className="h-4 w-48 bg-[#F0F0EB]"></div>
            </div>
            <div className="mt-6 md:mt-0 h-12 w-40 bg-[#F0F0EB] animate-pulse"></div>
          </div>

          {/* Search skeleton */}
          <div className="mb-8">
            <div className="h-12 w-full bg-white border border-[#141413] animate-pulse"></div>
          </div>

          {/* Upcoming shoots skeleton */}
          <div className="mb-16">
            <div className="h-4 w-48 bg-[#F0F0EB] mb-6 animate-pulse"></div>
            <div className="bg-white border border-[#141413] shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 p-6 border-b border-[#141413] items-center last:border-b-0 animate-pulse">
                  <div className="col-span-5">
                    <div className="h-6 w-3/4 bg-[#F0F0EB] mb-2"></div>
                    <div className="h-4 w-1/2 bg-[#F0F0EB]"></div>
                  </div>
                  <div className="col-span-3">
                    <div className="h-5 w-32 bg-[#F0F0EB]"></div>
                  </div>
                  <div className="col-span-4 flex justify-end items-center space-x-3">
                    <div className="h-8 w-8 bg-[#F0F0EB]"></div>
                    <div className="h-8 w-24 bg-[#F0F0EB]"></div>
                    <div className="h-8 w-8 bg-[#F0F0EB]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Archive skeleton */}
          <div>
            <div className="h-4 w-32 bg-[#F0F0EB] mb-6 animate-pulse"></div>
            <div className="bg-[#EAEBE6] border border-[#9E9E98]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 p-6 border-b border-[#9E9E98] items-center last:border-b-0 animate-pulse">
                  <div className="col-span-5">
                    <div className="h-6 w-3/4 bg-[#D8D9CF] mb-2"></div>
                    <div className="h-4 w-1/2 bg-[#D8D9CF]"></div>
                  </div>
                  <div className="col-span-3">
                    <div className="h-5 w-32 bg-[#D8D9CF]"></div>
                  </div>
                  <div className="col-span-4 flex justify-end items-center space-x-3">
                    <div className="h-8 w-8 bg-[#D8D9CF]"></div>
                    <div className="h-8 w-24 bg-[#D8D9CF]"></div>
                    <div className="h-8 w-8 bg-[#D8D9CF]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer loading indicator */}
          <div className="mt-12 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-[#141413] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 w-2 bg-[#141413] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2 w-2 bg-[#141413] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 border-b border-[#141413] pb-6 md:pb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-medium uppercase tracking-tight text-[#141413] mb-2">
              Producer Admin
            </h1>
            <p className="text-[#141413] text-xs uppercase tracking-[0.2em] font-bold">
              Studio Olga Prudka
            </p>
          </div>
          <Link
            to="/admin/create"
            className="w-full md:w-auto text-center bg-[#141413] text-white px-6 md:px-8 py-3 md:py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] border border-[#141413] transition-colors touch-manipulation active:bg-[#000000]"
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
            to="/dashboard"
            className="text-xs font-bold uppercase tracking-widest text-[#9E9E98] hover:text-[#141413] border-b border-transparent hover:border-[#141413] pb-0.5 transition-all"
          >
            Return to Client Dashboard
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        shootTitle={deleteModal.shoot?.title || ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, shoot: null })}
      />
    </div>
  );
};
