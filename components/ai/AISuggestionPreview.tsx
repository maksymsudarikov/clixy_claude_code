/**
 * AI Suggestion Preview Component
 * Shows AI-generated data BEFORE applying to form
 * User can review, edit individual fields, or reject
 */

import React from 'react';
import { AIGeneratedData } from '../../types';

interface AISuggestionPreviewProps {
  suggestions: AIGeneratedData;
  onAccept: () => void;
  onReject: () => void;
  onRegenerate: () => void;
}

export const AISuggestionPreview: React.FC<AISuggestionPreviewProps> = ({
  suggestions,
  onAccept,
  onReject,
  onRegenerate
}) => {
  // Count how many fields were generated
  const generatedFields = Object.keys(suggestions).filter(
    key => suggestions[key as keyof AIGeneratedData] !== undefined &&
           suggestions[key as keyof AIGeneratedData] !== '' &&
           !(Array.isArray(suggestions[key as keyof AIGeneratedData]) &&
             (suggestions[key as keyof AIGeneratedData] as any[]).length === 0)
  );

  const fieldCount = generatedFields.length;

  // Helper to format field names for display
  const formatFieldName = (key: string): string => {
    const names: Record<string, string> = {
      title: 'Project Title',
      client: 'Client',
      description: 'Description',
      date: 'Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      locationName: 'Location Name',
      locationAddress: 'Location Address',
      projectType: 'Project Type',
      team: 'Team Members',
      stylingNotes: 'Styling Notes',
      hairMakeupNotes: 'Hair & Makeup Notes'
    };
    return names[key] || key;
  };

  // Helper to format values for display
  const formatValue = (key: string, value: any): string => {
    if (Array.isArray(value)) {
      if (key === 'team') {
        return value.map(m => m.role).filter(Boolean).join(', ');
      }
      return value.join(', ');
    }

    if (key === 'projectType') {
      const types: Record<string, string> = {
        photo_shoot: '📸 Photo Shoot',
        video_project: '🎬 Video Project',
        hybrid: '🎯 Hybrid (Photo + Video)'
      };
      return types[value] || value;
    }

    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="bg-green-100 border-2 border-green-600 px-6 py-4">
        <p className="text-sm font-bold text-green-800">
          ✅ AI generated {fieldCount} field{fieldCount !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-green-700 mt-1">
          Review the suggestions below and click "Apply All" to auto-fill the form
        </p>
      </div>

      {/* Generated Fields */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-[#9E9E98] uppercase tracking-[0.15em] mb-4">
          Extracted Information
        </h3>

        {generatedFields.map((key) => {
          const value = suggestions[key as keyof AIGeneratedData];
          if (value === undefined || value === '' ||
              (Array.isArray(value) && value.length === 0)) {
            return null;
          }

          return (
            <div key={key} className="bg-white border-2 border-[#141413] px-4 py-3">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-[10px] text-[#9E9E98] uppercase tracking-wider mb-1">
                    {formatFieldName(key)}
                  </p>
                  <p className="text-sm text-[#141413] font-mono">
                    {formatValue(key, value)}
                  </p>
                </div>
                <span className="text-green-600 text-xl">✓</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning if minimal data */}
      {fieldCount < 3 && (
        <div className="bg-yellow-100 border-2 border-yellow-600 px-4 py-3">
          <p className="text-sm text-yellow-800">
            ⚠️ AI extracted limited information. You can:
          </p>
          <ul className="text-xs text-yellow-700 mt-2 ml-4 list-disc space-y-1">
            <li>Click "Regenerate" to try again with more details</li>
            <li>Click "Apply All" and fill missing fields manually</li>
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onAccept}
          className="flex-1 py-4 bg-[#141413] text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#141413] border-2 border-[#141413] transition-colors"
        >
          ✅ Apply All
        </button>

        <button
          onClick={onRegenerate}
          className="px-8 py-4 bg-white text-[#141413] text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#141413] hover:text-white border-2 border-[#141413] transition-colors"
        >
          🔄 Regenerate
        </button>

        <button
          onClick={onReject}
          className="px-8 py-4 bg-white text-red-600 text-sm font-bold uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white border-2 border-red-600 transition-colors"
        >
          ✕ Cancel
        </button>
      </div>

      {/* Help Text */}
      <div className="text-[10px] text-[#9E9E98] uppercase tracking-wider text-center">
        <p>AI suggestions will merge with your existing data</p>
        <p className="mt-1">You can edit any field after applying</p>
      </div>
    </div>
  );
};
