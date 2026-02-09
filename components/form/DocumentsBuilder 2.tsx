import React, { useState } from 'react';
import { Document } from '../../types';
import { isValidUrl, sanitizeUrl } from '../../utils/validation';

interface DocumentsBuilderProps {
  documents: Document[];
  onChange: (documents: Document[]) => void;
}

const DOCUMENT_TYPES = [
  { value: 'client_contract', label: 'Client Contract' },
  { value: 'model_release', label: 'Model Release' },
  { value: 'location_permit', label: 'Location Permit' },
  { value: 'nda', label: 'NDA (Non-Disclosure)' },
  { value: 'other', label: 'Other' }
] as const;

export const DocumentsBuilder: React.FC<DocumentsBuilderProps> = ({ documents, onChange }) => {
  const [doc, setDoc] = useState<Document>({
    name: '',
    type: 'client_contract',
    url: ''
  });

  const [errors, setErrors] = useState<{ url?: string }>({});

  const validateDocument = (): boolean => {
    const newErrors: { url?: string } = {};

    if (doc.url && !isValidUrl(doc.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addDocument = () => {
    if (!doc.name.trim() || !doc.url.trim()) {
      return;
    }

    if (!validateDocument()) {
      return;
    }

    const cleanDoc: Document = {
      name: doc.name.trim(),
      type: doc.type,
      url: sanitizeUrl(doc.url)
    };

    onChange([...documents, cleanDoc]);

    // Reset form
    setDoc({
      name: '',
      type: 'client_contract',
      url: ''
    });
    setErrors({});
  };

  const removeDocument = (index: number) => {
    onChange(documents.filter((_, i) => i !== index));
  };

  const inputClasses = "w-full px-4 py-3 border border-[#141413] bg-white text-[#141413] placeholder-[#9E9E98] focus:outline-none focus:ring-2 focus:ring-[#141413] font-light";
  const labelClasses = "block text-xs font-bold uppercase tracking-widest text-[#141413] mb-2";
  const buttonClasses = "px-6 py-3 bg-[#141413] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#9E9E98] transition-colors";

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-[#F5F5F0] p-6 border border-[#141413]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClasses}>
              Document Name *
            </label>
            <input
              type="text"
              value={doc.name}
              onChange={e => setDoc({ ...doc, name: e.target.value })}
              placeholder="e.g. Client Contract, Model Release - Anna"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>
              Document Type *
            </label>
            <select
              value={doc.type}
              onChange={e => setDoc({ ...doc, type: e.target.value as Document['type'] })}
              className={inputClasses}
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className={labelClasses}>
            Document URL (Google Drive, Dropbox, PandaDoc) *
          </label>
          <input
            type="url"
            value={doc.url}
            onChange={e => {
              setDoc({ ...doc, url: e.target.value });
              setErrors({ ...errors, url: undefined });
            }}
            placeholder="https://drive.google.com/..."
            className={inputClasses}
          />
          {errors.url && (
            <p className="text-red-600 text-xs mt-1">{errors.url}</p>
          )}
        </div>

        <button
          type="button"
          onClick={addDocument}
          className={buttonClasses}
          disabled={!doc.name.trim() || !doc.url.trim()}
        >
          + Add Document
        </button>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#9E9E98]">
            Added Documents ({documents.length})
          </h4>
          {documents.map((document, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white border border-[#141413]"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {document.type === 'client_contract' && '📄'}
                    {document.type === 'model_release' && '✍️'}
                    {document.type === 'location_permit' && '📍'}
                    {document.type === 'nda' && '🔒'}
                    {document.type === 'other' && '📎'}
                  </span>
                  <div>
                    <p className="font-bold text-sm">{document.name}</p>
                    <p className="text-xs text-[#9E9E98] uppercase">
                      {DOCUMENT_TYPES.find(t => t.value === document.type)?.label}
                    </p>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all"
                    >
                      {document.url}
                    </a>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="ml-4 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-800 px-3 py-2 border border-red-600 hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center p-8 bg-[#F5F5F0] border border-dashed border-[#9E9E98]">
          <p className="text-sm text-[#9E9E98] uppercase tracking-wider">
            No documents added yet
          </p>
          <p className="text-xs text-[#9E9E98] mt-2">
            Add contracts, releases, and permits for admin reference
          </p>
        </div>
      )}
    </div>
  );
};
