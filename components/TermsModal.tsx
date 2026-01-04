import React, { useState } from 'react';

interface TermsModalProps {
  onAccept: () => void;
  shootTitle: string;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onAccept, shootTitle }) => {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    await onAccept();
    // Modal will be hidden by parent after onAccept completes
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-[#D8D9CF] border-4 border-[#141413] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_#141413]">
        {/* Header */}
        <div className="bg-[#141413] text-white p-6 border-b-4 border-[#141413]">
          <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">
            Terms & Conditions
          </h2>
          <p className="text-sm text-[#9E9E98] mt-2 uppercase tracking-wider">
            {shootTitle}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-white border-2 border-[#141413] p-6">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-4">
              🎨 Important: Please Read Before Proceeding
            </h3>

            <div className="space-y-4 text-sm leading-relaxed">
              <p className="font-bold">
                Before accessing your shoot details, please review and agree to our working terms:
              </p>

              {/* Placeholder content - will be updated with final text */}
              <div className="bg-[#F5F5F0] p-4 border-l-4 border-[#141413]">
                <p className="font-bold mb-2">📸 Creative Vision</p>
                <p className="text-gray-700">
                  You are engaging our services for our unique creative vision and artistic approach.
                  Final editing and color grading reflect our professional expertise and signature style.
                </p>
              </div>

              <div className="bg-[#F5F5F0] p-4 border-l-4 border-[#141413]">
                <p className="font-bold mb-2">✅ What You Can Request</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Select which photos you want from the gallery</li>
                  <li>Request removal of blemishes or distractions</li>
                  <li>Minor cropping or rotation adjustments</li>
                </ul>
              </div>

              <div className="bg-[#F5F5F0] p-4 border-l-4 border-[#141413]">
                <p className="font-bold mb-2">❌ What We Cannot Accept</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Requests to alter color grading or editing style</li>
                  <li>Changes to our creative choices and artistic direction</li>
                  <li>Delivery of RAW files or unedited originals</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 mt-4">
                <p className="text-sm font-bold text-yellow-900">
                  ⚠️ Note: This is placeholder text. Final terms will be added by the studio.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Text */}
          <div className="text-xs text-[#9E9E98] space-y-2">
            <p>
              By clicking "I Agree & Continue" below, you acknowledge that you have read and agree
              to these terms and conditions.
            </p>
            <p>
              Your agreement will be recorded with a timestamp for our records.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t-4 border-[#141413] p-6 flex flex-col md:flex-row gap-4 justify-end">
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full md:w-auto px-8 py-4 bg-[#141413] text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#141413] border-4 border-[#141413] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_#9E9E98]"
          >
            {isAccepting ? 'Processing...' : 'I Agree & Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
};
