import React, { useState } from 'react';
import { isValidUrl } from '../../utils/validation';
import { IconClose } from '../Icons';

interface MoodboardBuilderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export const MoodboardBuilder: React.FC<MoodboardBuilderProps> = ({ images, onChange }) => {
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [error, setError] = useState('');

  const addImage = () => {
    if (!tempImageUrl.trim()) return;

    if (!isValidUrl(tempImageUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    onChange([...images, tempImageUrl.trim()]);
    setTempImageUrl('');
    setError('');
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addImage();
    }
  };

  return (
    <div className="bg-[#F0F0EB] p-6 mb-8 border border-[#141413]">
      <p className="text-xs font-bold uppercase tracking-widest text-[#141413] mb-4">Moodboard Gallery</p>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-[3/4] group border border-[#141413]">
              <img src={url} alt={`Moodboard ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-[#141413]/90 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold rounded p-1.5 min-h-[40px] min-w-[40px] touch-manipulation"
                aria-label={`Remove image ${idx + 1}`}
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            placeholder="IMAGE URL (https://...)"
            value={tempImageUrl}
            onChange={e => {
              setTempImageUrl(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            className={`flex-1 bg-transparent border-b py-2 text-sm placeholder-[#9E9E98] text-[#141413] focus:border-[#141413] outline-none ${
              error ? 'border-red-600' : 'border-[#9E9E98]'
            }`}
            aria-label="Moodboard image URL"
          />
          <button
            type="button"
            onClick={addImage}
            disabled={!tempImageUrl.trim()}
            className="text-xs bg-[#141413] text-white px-4 py-2 font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-[#D8D9CF] hover:text-[#141413] border border-[#141413] transition-colors"
          >
            Add Image
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
};
