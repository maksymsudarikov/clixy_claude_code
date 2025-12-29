import React, { useState } from 'react';
import { IconClose } from './Icons';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  shootTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  shootTitle,
  onConfirm,
  onCancel
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmText === 'DELETE') {
      onConfirm();
      setConfirmText('');
    }
  };

  const handleCancel = () => {
    setConfirmText('');
    onCancel();
  };

  const isValid = confirmText === 'DELETE';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-[#141413] max-w-md w-full shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#141413]">
          <h2 className="text-xl font-bold uppercase tracking-tight text-[#141413]">
            Confirm Deletion
          </h2>
          <button
            onClick={handleCancel}
            className="text-[#9E9E98] hover:text-[#141413] transition-colors"
            aria-label="Close"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-[#141413] mb-2">
              You are about to delete:
            </p>
            <p className="text-base font-bold text-[#141413] bg-[#F0F0EB] p-3 border border-[#9E9E98]">
              {shootTitle}
            </p>
          </div>

          <div className="mb-6 bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800 font-medium mb-2">
              ⚠️ This action cannot be undone
            </p>
            <p className="text-xs text-red-600">
              All photos, team members, and shoot details will be permanently deleted.
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmText" className="block text-sm font-medium text-[#141413] mb-2 uppercase tracking-wider">
              Type <code className="bg-[#F0F0EB] px-2 py-1 font-mono text-red-600">DELETE</code> to confirm
            </label>
            <input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#141413] focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
              placeholder="Type DELETE here"
              autoFocus
              autoComplete="off"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wider bg-white text-[#141413] border-2 border-[#141413] hover:bg-[#F0F0EB] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wider border-2 transition-colors ${
                isValid
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
              }`}
            >
              Delete Forever
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
