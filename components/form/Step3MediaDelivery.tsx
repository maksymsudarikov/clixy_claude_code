/**
 * Step 3: Media & Delivery
 * Photo/video delivery workflows, team, talent, and documents
 * This step handles the delivery phase of the project
 *
 * @security URL validation for all delivery links
 * @debug Logs workflow status changes
 */
import React, { useCallback, useMemo } from 'react';
import { StepProps } from './types';
import { inputClasses, labelClasses, sectionHeaderClasses } from '../../utils/designSystem';
import { TeamBuilder } from './TeamBuilder';
import { TalentBuilder } from './TalentBuilder';
import { DocumentsBuilder } from './DocumentsBuilder';
import { TeamMember, Talent, Document } from '../../types';

// Security: URL validation (same as Step2)
const isValidUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Security: Sanitize URL
const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  return trimmed;
};

// Constants
const MAX_URL_LENGTH = 2048;

// Photo workflow statuses with user-friendly labels
const PHOTO_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'selection_ready', label: 'Selection Ready' },
  { value: 'selection_in_progress', label: 'Client Selecting' },
  { value: 'selected', label: 'Selection Complete' },
  { value: 'editing', label: 'Editing' },
  { value: 'delivered', label: 'Delivered' },
] as const;

export const Step3MediaDelivery: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const [urlErrors, setUrlErrors] = React.useState<Record<string, string | null>>({});

  // Determine which sections to show
  const showPhotoFields = useMemo(() =>
    formData.projectType === 'photo_shoot' || formData.projectType === 'hybrid',
    [formData.projectType]
  );

  const showVideoFields = useMemo(() =>
    formData.projectType === 'video_project' || formData.projectType === 'hybrid',
    [formData.projectType]
  );

  // Debug logging
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug('[Step3] Delivery sections:', {
        projectType: formData.projectType,
        showPhotoFields,
        showVideoFields,
        photoStatus: formData.photoStatus,
      });
    }
  }, [formData.projectType, formData.photoStatus, showPhotoFields, showVideoFields]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let sanitizedValue = value;

    // Handle URL fields
    if (name.includes('Url') || name.includes('url')) {
      sanitizedValue = sanitizeUrl(value).slice(0, MAX_URL_LENGTH);
      if (sanitizedValue && !isValidUrl(sanitizedValue)) {
        setUrlErrors(prev => ({ ...prev, [name]: 'Please enter a valid URL' }));
      } else {
        setUrlErrors(prev => ({ ...prev, [name]: null }));
      }
    }

    if (import.meta.env.DEV) {
      console.debug(`[Step3] Field "${name}" updated to:`, sanitizedValue.slice(0, 50));
    }

    updateFormData({ [name]: sanitizedValue });
  }, [updateFormData]);

  // Team management
  const handleTeamChange = useCallback((team: TeamMember[]) => {
    if (import.meta.env.DEV) {
      console.debug('[Step3] Team updated:', team.length, 'members');
    }
    updateFormData({ team });
  }, [updateFormData]);

  // Talent management
  const handleTalentChange = useCallback((talent: Talent[]) => {
    if (import.meta.env.DEV) {
      console.debug('[Step3] Talent updated:', talent.length, 'members');
    }
    updateFormData({ talent });
  }, [updateFormData]);

  // Documents management
  const handleDocumentsChange = useCallback((documents: Document[]) => {
    if (import.meta.env.DEV) {
      console.debug('[Step3] Documents updated:', documents.length, 'documents');
    }
    updateFormData({ documents });
  }, [updateFormData]);

  // URL input helper
  const UrlInput = ({ name, label, placeholder, value, helpText }: {
    name: string;
    label: string;
    placeholder: string;
    value: string;
    helpText?: string;
  }) => (
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
      {urlErrors[name] ? (
        <p className="text-[10px] text-red-500 mt-1 uppercase tracking-wider" role="alert">
          {urlErrors[name]}
        </p>
      ) : helpText ? (
        <p className="text-[10px] text-[#9E9E98] mt-1 uppercase tracking-wider">
          {helpText}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Photo Delivery Workflow */}
      {showPhotoFields && (
        <section>
          <h2 className={sectionHeaderClasses}>Photo Delivery</h2>
          <div className="space-y-6">
            {/* Photo Status */}
            <div>
              <label htmlFor="photoStatus" className={labelClasses}>Photo Workflow Status</label>
              <select
                id="photoStatus"
                name="photoStatus"
                value={formData.photoStatus || 'pending'}
                onChange={handleChange}
                className={`${inputClasses} cursor-pointer`}
              >
                {PHOTO_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <div className="mt-3 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  formData.photoStatus === 'delivered' ? 'bg-green-500' :
                  formData.photoStatus === 'pending' ? 'bg-gray-400' :
                  'bg-yellow-500'
                }`} />
                <span className="text-[10px] text-[#9E9E98] uppercase tracking-wider">
                  {PHOTO_STATUSES.find(s => s.value === formData.photoStatus)?.label || 'Pending'}
                </span>
              </div>
            </div>

            {/* Photo Selection URL */}
            <UrlInput
              name="photoSelectionUrl"
              label="Photo Selection Gallery"
              placeholder="https://gallery.pixieset.com/..."
              value={formData.photoSelectionUrl || ''}
              helpText="Where client selects their favorite photos"
            />

            {/* Selected Photos URL */}
            <UrlInput
              name="selectedPhotosUrl"
              label="Selected Photos"
              placeholder="https://drive.google.com/..."
              value={formData.selectedPhotosUrl || ''}
              helpText="Client's final selections"
            />

            {/* Final Photos URL */}
            <UrlInput
              name="finalPhotosUrl"
              label="Final Edited Photos"
              placeholder="https://drive.google.com/..."
              value={formData.finalPhotosUrl || ''}
              helpText="Delivered, edited photos"
            />
          </div>
        </section>
      )}

      {/* Video Delivery - if not already covered in Step 2 */}
      {showVideoFields && !showPhotoFields && (
        <section>
          <h2 className={sectionHeaderClasses}>Video Delivery</h2>
          <div className="space-y-6">
            <UrlInput
              name="videoUrl"
              label="Video Delivery Link"
              placeholder="https://vimeo.com/... or https://drive.google.com/..."
              value={formData.videoUrl || ''}
              helpText="Final video delivery"
            />
          </div>
        </section>
      )}

      {/* Team Section */}
      {showPhotoFields && (
        <section>
          <h2 className={sectionHeaderClasses}>The Team</h2>
          <p className="text-[10px] text-[#9E9E98] mb-4 uppercase tracking-wider">
            Add photographers, assistants, stylists, and other crew members
          </p>
          <TeamBuilder
            team={formData.team || []}
            onChange={handleTeamChange}
          />
        </section>
      )}

      {/* Talent Section */}
      {showPhotoFields && (
        <section>
          <h2 className={sectionHeaderClasses}>Talent & Models</h2>
          <p className="text-[10px] text-[#9E9E98] mb-4 uppercase tracking-wider">
            Add models, actors, or other talent appearing in the shoot
          </p>
          <TalentBuilder
            talent={formData.talent || []}
            onChange={handleTalentChange}
          />
        </section>
      )}

      {/* Documents Section - visible to all but typically admin-managed */}
      <section>
        <h2 className={sectionHeaderClasses}>Documents & Contracts</h2>
        <p className="text-[10px] text-[#9E9E98] mb-4 uppercase tracking-wider">
          Contracts, releases, permits, and other documentation
        </p>
        <DocumentsBuilder
          documents={formData.documents || []}
          onChange={handleDocumentsChange}
        />
      </section>

      {/* Summary Card */}
      <section className="bg-[#F0F0EB] p-4 sm:p-6 border border-[#9E9E98]">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Project Summary</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
            <dt className="text-[#9E9E98] flex-shrink-0">Project Type</dt>
            <dd className="font-medium capitalize text-right sm:text-right">{formData.projectType?.replace('_', ' ') || 'Not set'}</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
            <dt className="text-[#9E9E98] flex-shrink-0">Title</dt>
            <dd className="font-medium truncate text-right sm:text-right">{formData.title || 'Untitled'}</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
            <dt className="text-[#9E9E98] flex-shrink-0">Client</dt>
            <dd className="font-medium truncate text-right sm:text-right">{formData.client || 'Not set'}</dd>
          </div>
          {formData.date && (
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
              <dt className="text-[#9E9E98] flex-shrink-0">Date</dt>
              <dd className="font-medium text-right sm:text-right">
                <span className="hidden sm:inline">
                  {new Date(formData.date + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="sm:hidden">
                  {new Date(formData.date + 'T00:00:00').toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </dd>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
            <dt className="text-[#9E9E98] flex-shrink-0">Team Members</dt>
            <dd className="font-medium text-right sm:text-right">{formData.team?.length || 0}</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
            <dt className="text-[#9E9E98] flex-shrink-0">Talent</dt>
            <dd className="font-medium text-right sm:text-right">{formData.talent?.length || 0}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
};

// Step 3 has no required fields - it's all optional delivery info
export const isStep3Complete = (): boolean => {
  return true; // All fields optional
};
