/**
 * ShootFormWizard - Multi-step form orchestrator
 *
 * Manages the 3-step wizard flow while preserving:
 * - Single formData state (critical for autosave)
 * - Draft restoration
 * - AI assistant integration
 * - Form validation
 *
 * @security All input sanitization handled by step components
 * @debug Comprehensive logging in development mode
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shoot, AIGeneratedData } from '../../types';
import { Step1QuickInfo, isStep1Complete } from './Step1QuickInfo';
import { Step2Details, isStep2Complete } from './Step2Details';
import { Step3MediaDelivery, isStep3Complete } from './Step3MediaDelivery';
import { useNotification } from '../../contexts/NotificationContext';
import { generateSecureToken } from '../../utils/tokenUtils';
import { validateShootForm, sanitizeUrl } from '../../utils/validation';
import { saveDraft, loadDraft, clearDraft, hasDraft, getDraftMetadata, getTimeSinceSave } from '../../utils/autosave';
import { createShoot, updateShoot, fetchShootById } from '../../services/shootService';
import { buttonPrimaryClasses, buttonSecondaryClasses } from '../../utils/designSystem';
import { NavigationBar } from '../NavigationBar';

// Constants
const AUTOSAVE_DELAY_MS = 30000; // 30 seconds
const DRAFT_KEY_PREFIX = 'shoot_draft_';

// Step configuration
const STEPS = [
  { id: 1, title: 'Basics', description: 'Project info' },
  { id: 2, title: 'Details', description: 'Schedule & location' },
  { id: 3, title: 'Delivery', description: 'Team & files' },
] as const;

// Initial empty shoot data
const getInitialFormData = (): Shoot => ({
  id: '',
  accessToken: generateSecureToken(),
  projectType: 'photo_shoot',
  title: '',
  client: '',
  clientEmail: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  locationName: '',
  locationAddress: '',
  locationMapUrl: '',
  moodboardUrl: '',
  moodboardImages: [],
  callSheetUrl: '',
  stylingUrl: '',
  stylingNotes: '',
  hairMakeupNotes: '',
  coverImage: '',
  photoSelectionUrl: '',
  selectedPhotosUrl: '',
  finalPhotosUrl: '',
  photoStatus: 'pending',
  videoUrl: '',
  videoStatus: 'pending',
  revisionNotes: '',
  status: 'pending',
  timeline: [],
  team: [],
  talent: [],
  documents: [],
  clientAcceptedTerms: false,
});

export const ShootFormWizard: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // Form state - single source of truth (critical for autosave)
  const [formData, setFormData] = useState<Shoot>(getInitialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  // Refs for autosave timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isEditMode = !!id;
  const draftKey = `${DRAFT_KEY_PREFIX}${id || 'new'}`;

  // Debug logging helper
  const debugLog = useCallback((message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.debug(`[ShootFormWizard] ${message}`, data ?? '');
    }
  }, []);

  // Load existing shoot data in edit mode
  useEffect(() => {
    const loadShootData = async () => {
      if (!id) {
        setLoading(false);
        // Check for draft for new shoots
        if (hasDraft(draftKey)) {
          setShowDraftPrompt(true);
        }
        return;
      }

      try {
        debugLog('Loading shoot:', id);
        const shoot = await fetchShootById(id);
        if (shoot) {
          setFormData(shoot);
          debugLog('Shoot loaded successfully');
        } else {
          addNotification('error', 'Shoot not found');
          navigate('/studio');
        }
      } catch (err) {
        console.error('Failed to load shoot:', err);
        addNotification('error', 'Failed to load shoot data');
        navigate('/studio');
      } finally {
        setLoading(false);
      }
    };

    loadShootData();
  }, [id, navigate, addNotification, draftKey, debugLog]);

  // Autosave logic - triggered by formData changes
  // CRITICAL: Must preserve this pattern for autosave to work
  useEffect(() => {
    // Only autosave if we have a title (basic validity check)
    if (!formData.title.trim()) {
      debugLog('Autosave skipped: no title');
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        saveDraft(draftKey, formData);
        setLastSaved(new Date().toISOString());
        debugLog('Draft autosaved');
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }, AUTOSAVE_DELAY_MS);

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, draftKey, debugLog]);

  // Handle draft restoration
  const handleRestoreDraft = useCallback(() => {
    const draft = loadDraft<Shoot>(draftKey);
    if (draft) {
      // Preserve access token from draft or generate new one
      setFormData({
        ...draft,
        accessToken: draft.accessToken || generateSecureToken(),
      });
      const metadata = getDraftMetadata(draftKey);
      if (metadata) {
        const timeSince = getTimeSinceSave(metadata.savedAt);
        addNotification('success', `Draft restored (saved ${timeSince})`);
      }
      debugLog('Draft restored');
    }
    setShowDraftPrompt(false);
  }, [draftKey, addNotification, debugLog]);

  const handleDiscardDraft = useCallback(() => {
    clearDraft(draftKey);
    setShowDraftPrompt(false);
    debugLog('Draft discarded');
  }, [draftKey, debugLog]);

  // Update form data - used by all step components
  const updateFormData = useCallback((updates: Partial<Shoot>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      debugLog('Form data updated:', Object.keys(updates));
      return updated;
    });
  }, [debugLog]);

  // Handle AI-generated data - MERGE, not replace
  const handleAIGenerate = useCallback((aiData: AIGeneratedData) => {
    setFormData(prev => ({
      ...prev, // Preserve existing data (especially id, accessToken)
      ...aiData, // Merge AI suggestions
    }));
    addNotification('success', 'AI suggestions applied!');
    debugLog('AI data merged');
  }, [addNotification, debugLog]);

  // Step navigation
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      debugLog('Navigated to step:', step);
    }
  }, [debugLog]);

  const goNext = useCallback(() => {
    if (currentStep < STEPS.length) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // Step completion status
  const stepCompletion = useMemo(() => ({
    1: isStep1Complete(formData),
    2: isStep2Complete(formData),
    3: isStep3Complete(),
  }), [formData]);

  // Form submission
  const handleSubmit = useCallback(async () => {
    debugLog('Submit initiated');

    // Validate
    const validation = validateShootForm(formData);
    if (!validation.isValid) {
      validation.errors.forEach(error => addNotification('error', error, 7000));
      // Navigate to first incomplete step
      if (!stepCompletion[1]) goToStep(1);
      else if (!stepCompletion[2]) goToStep(2);
      return;
    }

    setSaving(true);

    try {
      // Sanitize URLs before submission
      const sanitizedData: Shoot = {
        ...formData,
        moodboardUrl: sanitizeUrl(formData.moodboardUrl || ''),
        callSheetUrl: sanitizeUrl(formData.callSheetUrl || ''),
        stylingUrl: sanitizeUrl(formData.stylingUrl || ''),
        locationMapUrl: sanitizeUrl(formData.locationMapUrl || ''),
        photoSelectionUrl: sanitizeUrl(formData.photoSelectionUrl || ''),
        selectedPhotosUrl: sanitizeUrl(formData.selectedPhotosUrl || ''),
        finalPhotosUrl: sanitizeUrl(formData.finalPhotosUrl || ''),
        videoUrl: sanitizeUrl(formData.videoUrl || ''),
        moodboardImages: (formData.moodboardImages || []).map(sanitizeUrl).filter(Boolean),
      };

      if (isEditMode && id) {
        debugLog('Updating shoot:', id);
        await updateShoot(id, sanitizedData);
        addNotification('success', 'Shoot updated successfully!');
      } else {
        // Generate ID for new shoot
        const newId = `shoot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newShoot = { ...sanitizedData, id: newId };
        debugLog('Creating shoot:', newId);
        await createShoot(newShoot);
        addNotification('success', 'Shoot created successfully!');
      }

      // Clear draft after successful save
      clearDraft(draftKey);
      debugLog('Draft cleared after save');

      // Navigate to admin dashboard
      navigate('/studio');
    } catch (err) {
      console.error('Failed to save shoot:', err);
      addNotification('error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [formData, isEditMode, id, draftKey, stepCompletion, goToStep, addNotification, navigate, debugLog]);

  // Save and exit (save as draft)
  const handleSaveAndExit = useCallback(() => {
    try {
      saveDraft(draftKey, formData);
      addNotification('success', 'Draft saved!');
      navigate('/studio');
    } catch (err) {
      console.error('Failed to save draft:', err);
      addNotification('error', 'Failed to save draft');
    }
  }, [draftKey, formData, addNotification, navigate]);

  // Render current step component
  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      onAIGenerate: handleAIGenerate,
    };

    switch (currentStep) {
      case 1:
        return <Step1QuickInfo {...stepProps} />;
      case 2:
        return <Step2Details {...stepProps} />;
      case 3:
        return <Step3MediaDelivery {...stepProps} />;
      default:
        return <Step1QuickInfo {...stepProps} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#D8D9CF] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-4 bg-black rounded-full mb-2 animate-bounce" />
          <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D8D9CF] overflow-x-hidden">
      <NavigationBar backTo="/" backLabel="Home" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-16 sm:pt-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-medium uppercase tracking-tight mb-2">
            {isEditMode ? 'Edit Project' : 'New Project'}
          </h1>
          {lastSaved && (
            <p className="text-[10px] text-[#9E9E98] uppercase tracking-wider">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Draft restoration prompt */}
        {showDraftPrompt && (
          <div className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 border border-[#141413] shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-2">
              Unsaved Draft Found
            </h3>
            <p className="text-sm text-[#9E9E98] mb-4">
              Would you like to restore your previous work?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRestoreDraft}
                className={`${buttonPrimaryClasses} w-full sm:w-auto`}
              >
                Restore Draft
              </button>
              <button
                onClick={handleDiscardDraft}
                className={`${buttonSecondaryClasses} w-full sm:w-auto`}
              >
                Start Fresh
              </button>
            </div>
          </div>
        )}

        {/* Step indicator - Mobile optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => goToStep(step.id)}
                  className={`flex flex-col items-center min-w-[60px] sm:min-w-[80px] touch-manipulation ${
                    currentStep === step.id ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                  }`}
                  aria-current={currentStep === step.id ? 'step' : undefined}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                    stepCompletion[step.id as keyof typeof stepCompletion]
                      ? 'bg-green-600 text-white'
                      : currentStep === step.id
                        ? 'bg-[#141413] text-white'
                        : 'bg-[#9E9E98] text-white'
                  }`}>
                    {stepCompletion[step.id as keyof typeof stepCompletion] ? '✓' : step.id}
                  </div>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider mt-1 font-bold text-center">
                    {step.title}
                  </span>
                  <span className="text-[9px] text-[#9E9E98] hidden md:block">
                    {step.description}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 sm:mx-2 ${
                    stepCompletion[step.id as keyof typeof stepCompletion] ? 'bg-green-600' : 'bg-[#9E9E98]'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white p-4 sm:p-6 md:p-8 border border-[#141413] shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]">
          {renderCurrentStep()}
        </div>

        {/* Navigation buttons - Mobile optimized */}
        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-between pb-8">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={goPrev}
                className={`${buttonSecondaryClasses} flex-1 sm:flex-none`}
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleSaveAndExit}
              className="px-4 py-3 text-[#9E9E98] text-xs font-bold uppercase tracking-widest hover:text-[#141413] transition-colors"
            >
              Save & Exit
            </button>
          </div>

          <div className="flex gap-3">
            {currentStep < STEPS.length ? (
              <button
                onClick={goNext}
                className={buttonPrimaryClasses}
                disabled={!stepCompletion[currentStep as keyof typeof stepCompletion]}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className={`${buttonPrimaryClasses} ${saving ? 'opacity-50 cursor-wait' : ''}`}
                disabled={saving}
              >
                {saving ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
              </button>
            )}
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="mt-6 text-center text-[10px] text-[#9E9E98] uppercase tracking-wider hidden md:block">
          <kbd className="px-1.5 py-0.5 bg-[#F0F0EB] border border-[#9E9E98] rounded text-[9px] font-mono">Esc</kbd> Cancel &nbsp;
          <kbd className="px-1.5 py-0.5 bg-[#F0F0EB] border border-[#9E9E98] rounded text-[9px] font-mono">⌘S</kbd> Save draft
        </div>
      </div>
    </div>
  );
};
