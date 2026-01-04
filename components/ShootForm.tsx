import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Shoot } from '../types';
import { createShoot, updateShoot, fetchShootById } from '../services/shootService';
import { useNotification } from '../contexts/NotificationContext';
import { validateShootForm, sanitizeUrl } from '../utils/validation';
import { inputClasses, labelClasses, sectionHeaderClasses, cardClasses } from '../utils/designSystem';
import { TimelineBuilder } from './form/TimelineBuilder';
import { TeamBuilder } from './form/TeamBuilder';
import { TalentBuilder } from './form/TalentBuilder';
import { DocumentsBuilder } from './form/DocumentsBuilder';
import { MoodboardBuilder } from './form/MoodboardBuilder';
import { NavigationBar } from './NavigationBar';
import { saveDraft, loadDraft, clearDraft, hasDraft, getDraftMetadata, getTimeSinceSave } from '../utils/autosave';
import { generateSecureToken } from '../utils/tokenUtils';

export const ShootForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const draftKey = id || 'new-shoot';

  const [formData, setFormData] = useState<Shoot>({
    id: '',
    accessToken: generateSecureToken(), // Generate token for new shoots
    projectType: 'photo_shoot',
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
    photoSelectionUrl: '',
    selectedPhotosUrl: '',
    finalPhotosUrl: '',
    photoStatus: 'selection_ready',
    videoUrl: '',
    videoStatus: 'draft',
    revisionNotes: '',
    stylingUrl: '',
    stylingNotes: '',
    hairMakeupNotes: '',
    coverImage: '',
    team: [],
    talent: [],
    timeline: [],
    documents: []
  });

  // Check for draft on mount
  useEffect(() => {
    if (!id && hasDraft(draftKey)) {
      setShowDraftPrompt(true);
    } else if (id) {
      loadShoot(id);
    }
  }, [id]);

  // Auto-save effect
  useEffect(() => {
    // Only auto-save for new shoots or if title is filled
    if (!formData.title.trim()) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save (30 seconds after last change)
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft(draftKey, formData);
      setLastSaved(new Date().toISOString());
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, draftKey]);

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Determine if we should show photo-specific, video-specific, or location fields
  const showPhotoFields = formData.projectType === 'photo_shoot' || formData.projectType === 'hybrid';
  const showVideoFields = formData.projectType === 'video_project' || formData.projectType === 'hybrid';
  const showLocationFields = formData.projectType === 'photo_shoot' || formData.projectType === 'hybrid';
  const showTimelineFields = formData.projectType === 'photo_shoot' || formData.projectType === 'hybrid';
  const showTeamFields = formData.projectType === 'photo_shoot' || formData.projectType === 'hybrid';
  const showTalentFields = formData.projectType === 'photo_shoot' || formData.projectType === 'hybrid';

  const handleRestoreDraft = () => {
    const draft = loadDraft<Shoot>(draftKey);
    if (draft) {
      setFormData(draft);
      const metadata = getDraftMetadata(draftKey);
      if (metadata) {
        addNotification('success', `Draft restored from ${getTimeSinceSave(metadata.savedAt)}`);
      }
    }
    setShowDraftPrompt(false);
  };

  const handleDiscardDraft = () => {
    clearDraft(draftKey);
    setShowDraftPrompt(false);
    addNotification('info', 'Draft discarded');
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
        coverImage: '',
        moodboardUrl: sanitizeUrl(formData.moodboardUrl || ''),
        callSheetUrl: sanitizeUrl(formData.callSheetUrl || ''),
        finalPhotosUrl: sanitizeUrl(formData.finalPhotosUrl || ''),
        photoSelectionUrl: sanitizeUrl(formData.photoSelectionUrl || ''),
        selectedPhotosUrl: sanitizeUrl(formData.selectedPhotosUrl || ''),
        videoUrl: sanitizeUrl(formData.videoUrl || ''),
        stylingUrl: sanitizeUrl(formData.stylingUrl || ''),
        locationMapUrl: sanitizeUrl(formData.locationMapUrl || ''),
        moodboardImages: formData.moodboardImages.map(sanitizeUrl).filter(Boolean)
      };

      if (id) {
        // Keep existing accessToken when updating
        await updateShoot(id, sanitizedData);
        addNotification('success', 'Shoot updated successfully!');
      } else {
        const newId =
          formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
        // Ensure accessToken is included for new shoots
        await createShoot({
          ...sanitizedData,
          id: newId,
          accessToken: sanitizedData.accessToken || generateSecureToken()
        });
        addNotification('success', 'Shoot created successfully!');
      }

      // Clear draft on successful save
      clearDraft(draftKey);

      navigate('/admin');
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addNotification('error', `Failed to ${id ? 'update' : 'create'} shoot: ${errorMessage}`);
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
        {/* Draft restoration prompt */}
        {showDraftPrompt && (
          <div className="mb-8 bg-white border-2 border-[#141413] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#141413] mb-2">
                  Unsaved Draft Found
                </h3>
                <p className="text-xs text-[#9E9E98] uppercase tracking-wider">
                  {(() => {
                    const metadata = getDraftMetadata(draftKey);
                    return metadata ? `Last saved ${getTimeSinceSave(metadata.savedAt)}` : 'A previous draft was found';
                  })()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreDraft}
                  className="px-4 py-2 bg-[#141413] text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-[#141413] border border-[#141413] transition-colors"
                >
                  Restore
                </button>
                <button
                  onClick={handleDiscardDraft}
                  className="px-4 py-2 bg-white text-[#9E9E98] text-xs font-bold uppercase tracking-wider hover:text-red-600 border border-[#9E9E98] hover:border-red-600 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header with Navigation */}
        <div className="mb-12">
          <NavigationBar
            backTo="/admin"
            backLabel="Cancel"
            variant="light"
            position="relative"
            className="mb-6"
          />
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[#141413]">
              {id ? 'Edit Shoot' : 'Create New Shoot'}
            </h1>
            {lastSaved && !id && (
              <p className="text-[10px] text-[#9E9E98] uppercase tracking-wider mt-1">
                Draft auto-saved {getTimeSinceSave(lastSaved)}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          {/* SECTION 1: BASICS */}
          <section>
            <h3 className={sectionHeaderClasses}>01. The Basics</h3>
            <div className={cardClasses}>
              <div className="mb-8">
                <label className={labelClasses}>Project Type</label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full bg-[#D8D9CF] text-[#141413] border-b-2 border-[#141413] py-3 focus:border-[#141413] outline-none transition-colors font-bold uppercase text-sm tracking-wider"
                >
                  <option value="photo_shoot">📸 Photo Shoot</option>
                  <option value="video_project">🎬 Video / Reels Project</option>
                  <option value="hybrid">🎯 Hybrid (Photo + Video)</option>
                </select>
                <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                  {formData.projectType === 'video_project'
                    ? 'Video projects hide location, timeline, and team sections'
                    : formData.projectType === 'hybrid'
                    ? 'Hybrid projects show all fields for both photo and video'
                    : 'Photo shoots show full workflow with location and team'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className={labelClasses}>Project Title</label>
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
                  placeholder="Brief description of the project concept..."
                />
              </div>

            </div>
          </section>

          {/* SECTION 2: LOGISTICS & TIMELINE - Only for photo shoots and hybrid projects */}
          {showLocationFields && (
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
                      step="60"
                      pattern="[0-9]{2}:[0-9]{2}"
                    />
                    <p className="text-[10px] text-[#9E9E98] mt-1 uppercase tracking-wider">
                      Format: HH:MM (e.g., 09:30)
                    </p>
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
                      step="60"
                      pattern="[0-9]{2}:[0-9]{2}"
                    />
                    <p className="text-[10px] text-[#9E9E98] mt-1 uppercase tracking-wider">
                      Format: HH:MM (e.g., 18:00)
                    </p>
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
                    required={showLocationFields}
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

                {showTimelineFields && (
                  <TimelineBuilder
                    timeline={formData.timeline}
                    onChange={timeline => setFormData(prev => ({ ...prev, timeline }))}
                  />
                )}
              </div>
            </section>
          )}

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
                {/* Styling Guide URL - Only for photo shoots and hybrid */}
                {showPhotoFields && (
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
                )}
              </div>

              {/* PHOTO WORKFLOW SECTION - Only for photo shoots and hybrid */}
              {showPhotoFields && (
                <div className="mt-12 pt-8 border-t border-[#141413]">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#141413] mb-6">Photo Delivery Workflow</h4>
                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <label className={labelClasses}>Photo Selection URL</label>
                      <input
                        name="photoSelectionUrl"
                        value={formData.photoSelectionUrl}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="ADOBE / GOOGLE DRIVE / WETRANSFER"
                      />
                      <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                        Link for client to select photos
                      </p>
                    </div>
                    <div>
                      <label className={labelClasses}>Selected Photos URL 🎯</label>
                      <input
                        name="selectedPhotosUrl"
                        value={formData.selectedPhotosUrl || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="LINK TO PHOTOS CLIENT SELECTED"
                      />
                      <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                        After client selects, paste new link for their review
                      </p>
                    </div>
                    <div>
                      <label className={labelClasses}>Final Photos URL</label>
                      <input
                        name="finalPhotosUrl"
                        value={formData.finalPhotosUrl}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="DOWNLOAD LINK (SAME FOLDER, UPDATED)"
                      />
                      <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                        Link to final edited photos (continuously updated)
                      </p>
                    </div>
                    <div>
                      <label className={labelClasses}>Photo Status</label>
                      <select
                        name="photoStatus"
                        value={formData.photoStatus}
                        onChange={handleChange}
                        className="w-full bg-[#D8D9CF] text-[#141413] border-b border-[#9E9E98] py-3 focus:border-[#141413] outline-none transition-colors font-medium uppercase text-sm"
                      >
                        <option value="selection_ready">Selection Ready - Client can select photos</option>
                        <option value="editing_in_progress">Editing in Progress - Photos being edited</option>
                        <option value="completed">Completed - Final photos ready</option>
                      </select>
                      <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                        Controls what client sees on shoot page
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* VIDEO WORKFLOW SECTION - Only for video projects and hybrid */}
              {showVideoFields && (
                <div className="mt-12 pt-8 border-t border-[#141413]">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#141413] mb-6">Video Delivery Workflow</h4>
                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <label className={labelClasses}>Video URL</label>
                      <input
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="GOOGLE DRIVE / WETRANSFER / VIMEO"
                      />
                      <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                        Link to video deliverables (drafts, final edits)
                      </p>
                    </div>
                    <div>
                      <label className={labelClasses}>Video Status</label>
                      <select
                        name="videoStatus"
                        value={formData.videoStatus}
                        onChange={handleChange}
                        className="w-full bg-[#D8D9CF] text-[#141413] border-b border-[#9E9E98] py-3 focus:border-[#141413] outline-none transition-colors font-medium uppercase text-sm"
                      >
                        <option value="draft">Draft - Initial rough cut</option>
                        <option value="editing">Editing - Work in progress</option>
                        <option value="review">Review - Ready for client feedback</option>
                        <option value="final">Final - Completed and approved</option>
                      </select>
                      <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                        Current stage of video production
                      </p>
                    </div>
                    <div>
                      <label className={labelClasses}>Revision Notes</label>
                      <textarea
                        name="revisionNotes"
                        value={formData.revisionNotes}
                        onChange={handleChange}
                        rows={3}
                        className={`${inputClasses} resize-none`}
                        placeholder="Client feedback, revision requests, notes..."
                      />
                      <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                        Track client feedback and revisions
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 4: CREATIVE NOTES - Only for photo shoots and hybrid */}
          {showPhotoFields && (
            <section>
              <h3 className={sectionHeaderClasses}>04. Creative Notes</h3>
              <div className={cardClasses}>
                <div className="mb-8">
                  <label className={labelClasses}>Styling Notes</label>
                  <textarea
                    name="stylingNotes"
                    value={formData.stylingNotes}
                    onChange={handleChange}
                    rows={3}
                    className={`${inputClasses} resize-none`}
                    placeholder="Wardrobe, props, styling direction..."
                  />
                  <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                    Optional text notes (or use Styling Guide URL above)
                  </p>
                </div>

                <div>
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
              </div>
            </section>
          )}

          {/* SECTION 5: TEAM - Only for photo shoots and hybrid projects */}
          {showTeamFields && (
            <section>
              <h3 className={sectionHeaderClasses}>05. The Team</h3>
              <div className={cardClasses}>
                <TeamBuilder
                  team={formData.team}
                  onChange={team => setFormData(prev => ({ ...prev, team }))}
                />
              </div>
            </section>
          )}

          {/* SECTION 6: TALENT - Only for photo shoots and hybrid projects */}
          {showTalentFields && (
            <section>
              <h3 className={sectionHeaderClasses}>06. Talent</h3>
              <div className={cardClasses}>
                <p className="text-xs text-[#9E9E98] uppercase tracking-wider mb-6">
                  Models, actors, influencers, or anyone being photographed
                </p>
                <TalentBuilder
                  talent={formData.talent}
                  onChange={talent => setFormData(prev => ({ ...prev, talent }))}
                />
              </div>
            </section>
          )}

          {/* SECTION 7: DOCUMENTS - Admin only, for all project types */}
          <section>
            <h3 className={sectionHeaderClasses}>07. Documents (Admin Only)</h3>
            <div className={cardClasses}>
              <p className="text-xs text-[#9E9E98] uppercase tracking-wider mb-6">
                Contracts, releases, and permits - visible only to producers
              </p>
              <DocumentsBuilder
                documents={formData.documents}
                onChange={documents => setFormData(prev => ({ ...prev, documents }))}
              />
            </div>
          </section>

          <div className="pt-8 border-t border-[#141413] flex flex-col md:flex-row justify-end gap-4">
            <Link
              to="/admin"
              className="w-full md:w-auto text-center px-8 md:px-12 py-4 bg-white text-[#141413] text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#141413] hover:text-white border border-[#141413] transition-colors touch-manipulation"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 md:px-12 py-4 bg-[#141413] text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#141413] border border-[#141413] transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_#9E9E98] touch-manipulation"
            >
              {loading ? 'Processing...' : id ? 'Update Shoot' : 'Publish Shoot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
