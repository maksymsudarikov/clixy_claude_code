/**
 * Step 1: Quick Info
 * Essential fields to get started: project type, title, client, description
 * This is where autosave gets activated (once title is filled)
 *
 * @security Input sanitization on all text fields
 * @debug Logs state changes in development mode
 */
import React, { useCallback, useMemo } from 'react';
import { StepProps } from './types';
import { inputClasses, labelClasses, sectionHeaderClasses } from '../../utils/designSystem';
import { FEATURES } from '../../config/features';
import { AIAssistantModal } from '../ai/AIAssistantModal';

// Security: Basic XSS prevention - strip dangerous characters
const sanitizeTextInput = (value: string): string => {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Security: Validate email format
const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Constants for input limits (prevent DoS via huge inputs)
const MAX_TITLE_LENGTH = 200;
const MAX_CLIENT_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_EMAIL_LENGTH = 254;

export const Step1QuickInfo: React.FC<StepProps> = ({ formData, updateFormData, onAIGenerate }) => {
  const [showAIModal, setShowAIModal] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);

  // Memoize validation state to avoid unnecessary re-renders
  const validationState = useMemo(() => ({
    titleValid: formData.title.trim().length > 0 && formData.title.length <= MAX_TITLE_LENGTH,
    clientValid: formData.client.trim().length > 0 && formData.client.length <= MAX_CLIENT_LENGTH,
    descriptionValid: formData.description.trim().length > 0 && formData.description.length <= MAX_DESCRIPTION_LENGTH,
    emailValid: !formData.clientEmail || isValidEmail(formData.clientEmail),
  }), [formData.title, formData.client, formData.description, formData.clientEmail]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Apply length limits based on field
    let sanitizedValue = value;
    switch (name) {
      case 'title':
        sanitizedValue = sanitizeTextInput(value).slice(0, MAX_TITLE_LENGTH);
        break;
      case 'client':
        sanitizedValue = sanitizeTextInput(value).slice(0, MAX_CLIENT_LENGTH);
        break;
      case 'description':
        sanitizedValue = sanitizeTextInput(value).slice(0, MAX_DESCRIPTION_LENGTH);
        break;
      case 'clientEmail':
        sanitizedValue = value.slice(0, MAX_EMAIL_LENGTH).toLowerCase();
        // Validate email on change
        if (sanitizedValue && !isValidEmail(sanitizedValue)) {
          setEmailError('Please enter a valid email address');
        } else {
          setEmailError(null);
        }
        break;
      default:
        sanitizedValue = sanitizeTextInput(value);
    }

    // Debug logging in development
    if (import.meta.env.DEV) {
      console.debug(`[Step1] Field "${name}" updated:`, {
        original: value.slice(0, 50),
        sanitized: sanitizedValue.slice(0, 50),
        length: sanitizedValue.length
      });
    }

    updateFormData({ [name]: sanitizedValue });
  }, [updateFormData]);

  return (
    <div className="space-y-8">
      <h2 className={sectionHeaderClasses}>The Basics</h2>

      {/* Project Type */}
      <div>
        <label htmlFor="projectType" className={labelClasses}>
          Project Type
        </label>
        <select
          id="projectType"
          name="projectType"
          value={formData.projectType || 'photo_shoot'}
          onChange={handleChange}
          className={`${inputClasses} cursor-pointer`}
        >
          <option value="photo_shoot">Photo Shoot</option>
          <option value="video_project">Video Project</option>
          <option value="hybrid">Hybrid (Photo + Video)</option>
        </select>
        <p className="text-[10px] text-[#9E9E98] mt-1 uppercase tracking-wider">
          This determines which fields appear in the next steps
        </p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClasses}>
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Summer Lookbook 2025"
          className={inputClasses}
          required
        />
        <p className="text-[10px] text-[#9E9E98] mt-1 uppercase tracking-wider">
          Give your project a memorable name
        </p>
      </div>

      {/* Client */}
      <div>
        <label htmlFor="client" className={labelClasses}>
          Client Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="client"
          name="client"
          value={formData.client}
          onChange={handleChange}
          placeholder="e.g., Brand Name or Person"
          className={inputClasses}
          required
        />
      </div>

      {/* Client Email */}
      <div>
        <label htmlFor="clientEmail" className={labelClasses}>
          Client Email
        </label>
        <input
          type="email"
          id="clientEmail"
          name="clientEmail"
          value={formData.clientEmail || ''}
          onChange={handleChange}
          placeholder="client@example.com"
          className={`${inputClasses} ${emailError ? 'border-red-500' : ''}`}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'email-error' : undefined}
        />
        {emailError ? (
          <p id="email-error" className="text-[10px] text-red-500 mt-1 uppercase tracking-wider" role="alert">
            {emailError}
          </p>
        ) : (
          <p className="text-[10px] text-[#9E9E98] mt-1 uppercase tracking-wider">
            For sending notifications and updates
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClasses}>
          Project Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the project, goals, mood, and any special requirements..."
          rows={4}
          className={`${inputClasses} resize-none`}
          required
        />
      </div>

      {/* AI Assistant Button */}
      {FEATURES.aiAssistant && onAIGenerate && (
        <div className="pt-4 border-t border-[#F0F0EB]">
          <button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-lg">✨</span>
            AI Assistant - Fill Form from Text
          </button>
          <p className="text-[10px] text-[#9E9E98] mt-2 text-center uppercase tracking-wider">
            Paste an email or brief and let AI extract the details
          </p>
        </div>
      )}

      {/* AI Modal */}
      {showAIModal && onAIGenerate && (
        <AIAssistantModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onGenerate={(aiData) => {
            onAIGenerate(aiData);
            setShowAIModal(false);
          }}
          existingData={formData}
        />
      )}

      {/* Progress indicator */}
      <div className="pt-6 text-center">
        <p className="text-[10px] text-[#9E9E98] uppercase tracking-wider">
          {formData.title.trim() ? (
            <span className="text-green-600">✓ Autosave active</span>
          ) : (
            <span>Fill in the title to enable autosave</span>
          )}
        </p>
      </div>
    </div>
  );
};

// Validation for step completion
export const isStep1Complete = (formData: { title: string; client: string; description: string }): boolean => {
  return !!(formData.title.trim() && formData.client.trim() && formData.description.trim());
};
