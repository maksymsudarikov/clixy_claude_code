/**
 * Step 2: Details
 * Logistics, schedule, location, and creative direction
 * Fields shown are conditional based on projectType from Step 1
 *
 * @security URL validation and sanitization
 * @debug Logs conditional field visibility
 */
import React, { useCallback, useMemo } from 'react';
import { StepProps } from './types';
import { inputClasses, labelClasses, sectionHeaderClasses } from '../../utils/designSystem';
import { TimelineBuilder } from './TimelineBuilder';
import { MoodboardBuilder } from './MoodboardBuilder';

// Security: URL validation
const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Security: Sanitize URL input
const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  // Block dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  return trimmed;
};

// Security: Text sanitization
const sanitizeTextInput = (value: string): string => {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

// Constants
const MAX_URL_LENGTH = 2048;
const MAX_NOTES_LENGTH = 3000;
const MAX_ADDRESS_LENGTH = 500;

export const Step2Details: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const [urlErrors, setUrlErrors] = React.useState<Record<string, string | null>>({});

  // Determine which sections to show based on project type
  const showPhotoFields = useMemo(() =>
    formData.projectType === 'photo_shoot' || formData.projectType === 'hybrid',
    [formData.projectType]
  );

  const showVideoFields = useMemo(() =>
    formData.projectType === 'video_project' || formData.projectType === 'hybrid',
    [formData.projectType]
  );

  const showLocationFields = useMemo(() =>
    formData.projectType === 'photo_shoot' || formData.projectType === 'hybrid',
    [formData.projectType]
  );

  // Debug logging in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug('[Step2] Conditional fields:', {
        projectType: formData.projectType,
        showPhotoFields,
        showVideoFields,
        showLocationFields
      });
    }
  }, [formData.projectType, showPhotoFields, showVideoFields, showLocationFields]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let sanitizedValue = value;

    // Handle URL fields
    if (name.includes('Url') || name.includes('url')) {
      sanitizedValue = sanitizeUrl(value).slice(0, MAX_URL_LENGTH);
      if (sanitizedValue && !isValidUrl(sanitizedValue)) {
        setUrlErrors(prev => ({ ...prev, [name]: 'Please enter a valid URL (https://...)' }));
      } else {
        setUrlErrors(prev => ({ ...prev, [name]: null }));
      }
    }
    // Handle notes/text fields
    else if (name.includes('Notes') || name.includes('notes')) {
      sanitizedValue = sanitizeTextInput(value).slice(0, MAX_NOTES_LENGTH);
    }
    // Handle address
    else if (name.includes('Address') || name.includes('address')) {
      sanitizedValue = sanitizeTextInput(value).slice(0, MAX_ADDRESS_LENGTH);
    }
    else {
      sanitizedValue = sanitizeTextInput(value);
    }

    if (import.meta.env.DEV) {
      console.debug(`[Step2] Field "${name}" updated`);
    }

    updateFormData({ [name]: sanitizedValue });
  }, [updateFormData]);

  // Handle timeline updates
  const handleTimelineChange = useCallback((timeline: typeof formData.timeline) => {
    if (import.meta.env.DEV) {
      console.debug('[Step2] Timeline updated:', timeline.length, 'items');
    }
    updateFormData({ timeline });
  }, [updateFormData]);

  // Handle moodboard images
  const handleMoodboardChange = useCallback((moodboardImages: string[]) => {
    // Validate and sanitize all URLs
    const sanitizedImages = moodboardImages
      .map(sanitizeUrl)
      .filter(url => url && isValidUrl(url));

    if (import.meta.env.DEV) {
      console.debug('[Step2] Moodboard updated:', sanitizedImages.length, 'images');
    }
    updateFormData({ moodboardImages: sanitizedImages });
  }, [updateFormData]);

  // URL input helper component with error handling
  const UrlInput = ({ name, label, placeholder, value }: { name: string; label: string; placeholder: string; value: string }) => (
    <div>
      <label htmlFor={name} className={labelClasses}>{label}</label>
      <input
        type="url"
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${inputClasses} ${urlErrors[name] ? 'border-red-500' : ''}`}
        aria-invalid={!!urlErrors[name]}
      />
      {urlErrors[name] && (
        <p className="text-[10px] text-red-500 mt-1 uppercase tracking-wider" role="alert">
          {urlErrors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Schedule Section - for photo shoots and hybrid */}
      {showLocationFields && (
        <section>
          <h2 className={sectionHeaderClasses}>Schedule</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="date" className={labelClasses}>
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="startTime" className={labelClasses}>
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime || ''}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime" className={labelClasses}>
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime || ''}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Location Section - for photo shoots and hybrid */}
      {showLocationFields && (
        <section>
          <h2 className={sectionHeaderClasses}>Location</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="locationName" className={labelClasses}>Location Name</label>
              <input
                type="text"
                id="locationName"
                name="locationName"
                value={formData.locationName || ''}
                onChange={handleChange}
                placeholder="e.g., Studio A, Central Park"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="locationAddress" className={labelClasses}>
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="locationAddress"
                name="locationAddress"
                value={formData.locationAddress || ''}
                onChange={handleChange}
                placeholder="Full address for navigation"
                className={inputClasses}
                required
              />
            </div>
            <UrlInput
              name="locationMapUrl"
              label="Google Maps Link"
              placeholder="https://maps.google.com/..."
              value={formData.locationMapUrl || ''}
            />
          </div>
        </section>
      )}

      {/* Timeline Section - for photo shoots and hybrid */}
      {showLocationFields && (
        <section>
          <h2 className={sectionHeaderClasses}>Timeline</h2>
          <TimelineBuilder
            timeline={formData.timeline || []}
            onChange={handleTimelineChange}
          />
        </section>
      )}

      {/* Moodboard Section - for all project types */}
      <section>
        <h2 className={sectionHeaderClasses}>Moodboard & References</h2>
        <div className="space-y-6">
          <MoodboardBuilder
            images={formData.moodboardImages || []}
            onChange={handleMoodboardChange}
          />
          <UrlInput
            name="moodboardUrl"
            label="External Moodboard Link"
            placeholder="https://pinterest.com/... or https://drive.google.com/..."
            value={formData.moodboardUrl || ''}
          />
          <UrlInput
            name="callSheetUrl"
            label="Call Sheet Link"
            placeholder="https://docs.google.com/..."
            value={formData.callSheetUrl || ''}
          />
        </div>
      </section>

      {/* Photo-specific: Styling URL */}
      {showPhotoFields && (
        <section>
          <UrlInput
            name="stylingUrl"
            label="Styling Document"
            placeholder="https://docs.google.com/..."
            value={formData.stylingUrl || ''}
          />
        </section>
      )}

      {/* Creative Notes - for photo shoots and hybrid */}
      {showPhotoFields && (
        <section>
          <h2 className={sectionHeaderClasses}>Creative Notes</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="stylingNotes" className={labelClasses}>Styling Notes</label>
              <textarea
                id="stylingNotes"
                name="stylingNotes"
                value={formData.stylingNotes || ''}
                onChange={handleChange}
                placeholder="Color palette, clothing requirements, props needed..."
                rows={3}
                className={`${inputClasses} resize-none`}
              />
              <p className="text-[10px] text-[#9E9E98] mt-1">
                {(formData.stylingNotes?.length || 0)}/{MAX_NOTES_LENGTH} characters
              </p>
            </div>
            <div>
              <label htmlFor="hairMakeupNotes" className={labelClasses}>Hair & Makeup Notes</label>
              <textarea
                id="hairMakeupNotes"
                name="hairMakeupNotes"
                value={formData.hairMakeupNotes || ''}
                onChange={handleChange}
                placeholder="Specific looks, references, allergies to note..."
                rows={3}
                className={`${inputClasses} resize-none`}
              />
              <p className="text-[10px] text-[#9E9E98] mt-1">
                {(formData.hairMakeupNotes?.length || 0)}/{MAX_NOTES_LENGTH} characters
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Video-specific fields */}
      {showVideoFields && (
        <section>
          <h2 className={sectionHeaderClasses}>Video Details</h2>
          <div className="space-y-6">
            <UrlInput
              name="videoUrl"
              label="Video Delivery Link"
              placeholder="https://drive.google.com/... or https://vimeo.com/..."
              value={formData.videoUrl || ''}
            />
            <div>
              <label htmlFor="videoStatus" className={labelClasses}>Video Status</label>
              <select
                id="videoStatus"
                name="videoStatus"
                value={formData.videoStatus || 'pending'}
                onChange={handleChange}
                className={`${inputClasses} cursor-pointer`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="revision_requested">Revision Requested</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div>
              <label htmlFor="revisionNotes" className={labelClasses}>Revision Notes</label>
              <textarea
                id="revisionNotes"
                name="revisionNotes"
                value={formData.revisionNotes || ''}
                onChange={handleChange}
                placeholder="Notes for video revisions..."
                rows={3}
                className={`${inputClasses} resize-none`}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// Validation for step completion
export const isStep2Complete = (formData: {
  projectType?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  locationAddress?: string;
}): boolean => {
  const isPhotoOrHybrid = formData.projectType === 'photo_shoot' || formData.projectType === 'hybrid';

  // For photo/hybrid: require date, times, and address
  if (isPhotoOrHybrid) {
    return !!(formData.date && formData.startTime && formData.endTime && formData.locationAddress?.trim());
  }

  // For video-only: no required fields in this step
  return true;
};
