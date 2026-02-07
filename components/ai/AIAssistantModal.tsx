/**
 * AI Assistant Modal - Phase 1 MVP (Text Input Only)
 * Allows users to describe their shoot and AI auto-fills the form
 *
 * Phase 1: Text input only
 * Phase 2: Add voice recording tab
 * Phase 3: Add image upload tab
 */

import React, { useState } from 'react';
import { AIGeneratedData } from '../../types';
import { generateFromText } from '../../services/aiService';
import { AISuggestionPreview } from './AISuggestionPreview';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: AIGeneratedData) => void;
  existingData?: Partial<AIGeneratedData>; // Pre-populate if editing
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  existingData
}) => {
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIGeneratedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle text generation
  const handleGenerate = async () => {
    if (!textInput.trim()) {
      setError('Please enter a description of your shoot');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAiResponse(null);

    try {
      console.log('[AIAssistantModal] Generating from text:', textInput);

      const result = await generateFromText(textInput);

      if (result.success && result.data) {
        console.log('[AIAssistantModal] ✅ Generation successful:', result.data);
        setAiResponse(result.data);
      } else {
        console.error('[AIAssistantModal] ❌ Generation failed:', result.error);
        setError(result.error || 'Failed to generate. Please try again.');
      }
    } catch (err) {
      console.error('[AIAssistantModal] ❌ Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle applying AI suggestions
  const handleApply = () => {
    if (!aiResponse) return;

    console.log('[AIAssistantModal] Applying AI suggestions:', aiResponse);
    onGenerate(aiResponse);

    // Reset state and close
    setTextInput('');
    setAiResponse(null);
    setError(null);
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    setTextInput('');
    setAiResponse(null);
    setError(null);
    onClose();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape key to close
    if (e.key === 'Escape') {
      handleCancel();
    }

    // Cmd/Ctrl + Enter to generate
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !aiResponse) {
      handleGenerate();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-[#F0F0EB] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        <div className="bg-[#141413] text-white px-8 py-6">
          <h2 className="text-2xl font-bold uppercase tracking-[0.2em]">
            🎤 AI Assistant
          </h2>
          <p className="text-sm text-gray-300 mt-2 tracking-wide">
            Describe your shoot and AI will auto-fill the form
          </p>
        </div>

        <div className="p-8">
          {/* Text Input Section */}
          {!aiResponse && (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] text-[#9E9E98] uppercase tracking-[0.15em] mb-3">
                  Describe Your Shoot
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Example: Nike summer campaign shoot, outdoor location, June 15 from 10am to 4pm, need photographer and stylist

Пример: Съёмка для Adidas, 20 июня с 9 до 18, нужен фотограф"
                  className="w-full h-48 px-4 py-3 bg-white border-2 border-[#141413] focus:border-[#141413] outline-none font-mono text-sm resize-none"
                  disabled={isProcessing}
                  autoFocus
                />
                <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
                  {textInput.length}/5000 characters • Supports English & Russian
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border-2 border-red-600 px-4 py-3">
                  <p className="text-sm text-red-800 font-bold">❌ {error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing || !textInput.trim()}
                  className="flex-1 py-4 bg-[#141413] text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#141413] border-2 border-[#141413] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Generating...
                    </span>
                  ) : (
                    '✨ Generate'
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-white text-[#141413] text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#141413] hover:text-white border-2 border-[#141413] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="text-[10px] text-[#9E9E98] uppercase tracking-wider text-center">
                Press <kbd className="px-2 py-1 bg-white border border-gray-300">Esc</kbd> to cancel •
                <kbd className="px-2 py-1 bg-white border border-gray-300 ml-1">⌘/Ctrl + Enter</kbd> to generate
              </div>
            </div>
          )}

          {/* AI Suggestions Preview */}
          {aiResponse && (
            <AISuggestionPreview
              suggestions={aiResponse}
              onAccept={handleApply}
              onReject={handleCancel}
              onRegenerate={() => {
                setAiResponse(null);
                setError(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
