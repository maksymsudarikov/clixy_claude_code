import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Shoot } from '../types';
import { createShoot, updateShoot, fetchShootById } from '../services/shootService';
import { useNotification } from '../contexts/NotificationContext';
import { validateShootForm, sanitizeUrl } from '../utils/validation';
import { inputClasses, labelClasses, sectionHeaderClasses, cardClasses } from '../utils/designSystem';
import { TimelineBuilder } from './form/TimelineBuilder';
import { TeamBuilder } from './form/TeamBuilder';
import { MoodboardBuilder } from './form/MoodboardBuilder';

export const ShootForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const [formData, setFormData] = useState<Shoot>({
    id: '',
    title: '',
    client: '',
    date: '',
    startTime: '09:00',
    endTime: '18:00',
    locationName: '',
    locationAddress: '',
    locationMapUrl: '',
    description: '',
    moodboardUrl: '',
    moodboardImages: [],
    callSheetUrl: '',
    finalPhotosUrl: '',
    stylingUrl: '',
    hairMakeupNotes: '',
    coverImage: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&q=80&w=1200',
    team: [],
    timeline: []
  });

  useEffect(() => {
    if (id) {
      loadShoot(id);
    }
  }, [id]);

  const loadShoot = async (shootId: string) => {
    try {
      setInitialLoading(true);
      const shoot = await fetchShootById(shootId);
      if (shoot) {
        setFormData(shoot);
      } else {
        addNotification('error', 'Shoot not found');
        navigate('/admin');
      }
    } catch (err) {
      addNotification('error', 'Failed to load shoot');
      navigate('/admin');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateShootForm(formData);
    if (!validation.isValid) {
      validation.errors.forEach(error => addNotification('error', error, 7000));
      return;
    }

    setLoading(true);

    try {
      const sanitizedData = {
        ...formData,
        coverImage: sanitizeUrl(formData.coverImage),
        moodboardUrl: sanitizeUrl(formData.moodboardUrl || ''),
        callSheetUrl: sanitizeUrl(formData.callSheetUrl || ''),
        finalPhotosUrl: sanitizeUrl(formData.finalPhotosUrl || ''),
        stylingUrl: sanitizeUrl(formData.stylingUrl || ''),
        locationMapUrl: sanitizeUrl(formData.locationMapUrl || ''),
        moodboardImages: formData.moodboardImages.map(sanitizeUrl).filter(Boolean)
      };

      if (id) {
        await updateShoot(sanitizedData);
        addNotification('success', 'Shoot updated successfully!');
      } else {
        const newId =
          formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
        await createShoot({ ...sanitizedData, id: newId });
        addNotification('success', 'Shoot created successfully!');
      }

      navigate('/admin');
    } catch (err) {
      addNotification('error', `Failed to ${id ? 'update' : 'create'} shoot. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D8D9CF]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-4 bg-black rounded-full mb-2 animate-bounce"></div>
          <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413] pb-24">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[#141413]">
            {id ? 'Edit Shoot' : 'Create New Shoot'}
          </h1>
          <Link
            to="/admin"
            className="text-xs font-bold uppercase tracking-widest text-[#9E9E98] hover:text-[#141413] transition-colors"
          >
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          {/* SECTION 1: BASICS */}
          <section>
            <h3 className={sectionHeaderClasses}>01. The Basics</h3>
            <div className={cardClasses}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className={labelClasses}>Shoot Title</label>
                  <input
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="e.g. SUMMER CAMPAIGN"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Client</label>
                  <input
                    required
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="e.g. BRAND NAME"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className={labelClasses}>Description / Overview</label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClasses} resize-none`}
                  placeholder="Brief description of the shoot concept..."
                />
              </div>

              <div>
                <label className={labelClasses}>Cover Image URL</label>
                <input
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="https://..."
                />
                <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                  Paste an image URL
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: LOGISTICS & TIMELINE */}
          <section>
            <h3 className={sectionHeaderClasses}>02. Logistics & Schedule</h3>
            <div className={cardClasses}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <label className={labelClasses}>Date</label>
                  <input
                    type="date"
                    required
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Start Time</label>
                  <input
                    type="time"
                    required
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>End Time</label>
                  <input
                    type="time"
                    required
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className={labelClasses}>Location Name</label>
                <input
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="e.g. Studio Loft"
                />
              </div>

              <div className="mb-8">
                <label className={labelClasses}>Full Address</label>
                <input
                  required
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Street, City, Zip"
                />
              </div>

              <div className="mb-8">
                <label className={labelClasses}>Map URL (Optional)</label>
                <input
                  name="locationMapUrl"
                  value={formData.locationMapUrl}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <TimelineBuilder
                timeline={formData.timeline}
                onChange={timeline => setFormData(prev => ({ ...prev, timeline }))}
              />
            </div>
          </section>

          {/* SECTION 3: VISUALS & LINKS */}
          <section>
            <h3 className={sectionHeaderClasses}>03. Visuals & Links</h3>
            <div className={cardClasses}>
              <MoodboardBuilder
                images={formData.moodboardImages}
                onChange={moodboardImages => setFormData(prev => ({ ...prev, moodboardImages }))}
              />

              <div className="grid grid-cols-1 gap-8">
                <div>
                  <label className={labelClasses}>External Moodboard Link</label>
                  <input
                    name="moodboardUrl"
                    value={formData.moodboardUrl}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="PINTEREST / CANVA URL"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Call Sheet URL</label>
                  <input
                    name="callSheetUrl"
                    value={formData.callSheetUrl}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="NOTION / GOOGLE DRIVE"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Styling Guide URL</label>
                  <input
                    name="stylingUrl"
                    value={formData.stylingUrl}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="LINK TO DECK"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Final Photos URL</label>
                  <input
                    name="finalPhotosUrl"
                    value={formData.finalPhotosUrl}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="DOWNLOAD LINK"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: NOTES */}
          <section>
            <h3 className={sectionHeaderClasses}>04. Creative Notes</h3>
            <div className={cardClasses}>
              <label className={labelClasses}>Hair & Makeup Notes</label>
              <textarea
                name="hairMakeupNotes"
                value={formData.hairMakeupNotes}
                onChange={handleChange}
                rows={3}
                className={`${inputClasses} resize-none`}
                placeholder="Look and feel..."
              />
            </div>
          </section>

          {/* SECTION 5: TEAM */}
          <section>
            <h3 className={sectionHeaderClasses}>05. The Team</h3>
            <div className={cardClasses}>
              <TeamBuilder
                team={formData.team}
                onChange={team => setFormData(prev => ({ ...prev, team }))}
              />
            </div>
          </section>

          <div className="pt-8 border-t border-[#141413] flex justify-end space-x-4">
            <Link
              to="/admin"
              className="px-12 py-4 bg-white text-[#141413] text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#141413] hover:text-white border border-[#141413] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 bg-[#141413] text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#141413] border border-[#141413] transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_#9E9E98]"
            >
              {loading ? 'Processing...' : id ? 'Update Shoot' : 'Publish Shoot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
