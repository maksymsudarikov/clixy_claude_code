import React, { useMemo, useState } from 'react';
import { AIGeneratedData, Shoot } from '../../types';
import { sanitizeUrl } from '../../utils/validation';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (aiData: AIGeneratedData) => void;
  existingData?: Partial<Shoot>;
}

const extractDate = (text: string): string | undefined => {
  const isoMatch = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return isoMatch?.[1];
};

const extractTime = (text: string): string | undefined => {
  const m = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (!m) return undefined;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
};

const extractFirstUrl = (text: string): string | undefined => {
  const m = text.match(/\bhttps?:\/\/[^\s<>"')]+/i);
  if (!m) return undefined;
  const cleaned = sanitizeUrl(m[0]);
  return cleaned || undefined;
};

const parsePrompt = (text: string): AIGeneratedData => {
  const payload: AIGeneratedData = {};
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const sep = line.indexOf(':');
    if (sep <= 0) continue;

    const key = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();
    if (!value) continue;

    if (key.includes('title') || key.includes('project')) payload.title = value;
    else if (key.includes('client')) payload.client = value;
    else if (key.includes('email')) payload.clientEmail = value.toLowerCase();
    else if (key.includes('description') || key.includes('brief')) payload.description = value;
    else if (key.includes('location') && !key.includes('map')) payload.locationName = value;
    else if (key.includes('address')) payload.locationAddress = value;
    else if (key.includes('map')) payload.locationMapUrl = sanitizeUrl(value);
    else if (key.includes('moodboard')) payload.moodboardUrl = sanitizeUrl(value);
    else if (key.includes('callsheet') || key.includes('call sheet')) payload.callSheetUrl = sanitizeUrl(value);
  }

  const detectedDate = extractDate(text);
  if (detectedDate) payload.date = detectedDate;

  const detectedTime = extractTime(text);
  if (detectedTime && !payload.startTime) payload.startTime = detectedTime;

  const detectedUrl = extractFirstUrl(text);
  if (detectedUrl && !payload.moodboardUrl) payload.moodboardUrl = detectedUrl;

  return payload;
};

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  existingData,
}) => {
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState('');

  const preview = useMemo(() => parsePrompt(textInput), [textInput]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!textInput.trim()) {
      setError('Enter a project brief first.');
      return;
    }

    const parsed = parsePrompt(textInput);
    if (Object.keys(parsed).length === 0) {
      setError('No recognizable fields found. Use lines like "Client: ...", "Date: 2026-02-07".');
      return;
    }

    onGenerate(parsed);
    setTextInput('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#141413] w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
        <div className="p-5 border-b border-[#141413] flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#141413]">
            AI Assistant (Structured Parse)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-widest border border-[#141413] px-3 py-2 hover:bg-[#141413] hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-[#9E9E98] uppercase tracking-wider">
            Paste email/brief. Example: Title, Client, Date (YYYY-MM-DD), Start Time (HH:MM), Location, URLs.
          </p>

          <textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              setError('');
            }}
            rows={8}
            className="w-full border border-[#141413] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141413]"
            placeholder={`Title: Spring campaign\nClient: Acme\nDate: 2026-03-15\nStart time: 09:30\nLocation: Pier 57`}
          />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="bg-[#F0F0EB] border border-[#9E9E98] p-3">
            <p className="text-[10px] uppercase tracking-widest text-[#9E9E98] mb-2">Detected Fields</p>
            <pre className="text-xs text-[#141413] whitespace-pre-wrap break-words">
              {JSON.stringify({ ...existingData, ...preview }, null, 2)}
            </pre>
          </div>
        </div>

        <div className="p-5 border-t border-[#141413] flex flex-col sm:flex-row gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 border border-[#141413] text-xs font-bold uppercase tracking-widest hover:bg-[#141413] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-3 bg-[#141413] text-white border border-[#141413] text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] transition-colors"
          >
            Apply Parsed Fields
          </button>
        </div>
      </div>
    </div>
  );
};
