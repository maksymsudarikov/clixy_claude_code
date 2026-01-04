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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-8">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#141413]/10 rounded-sm">
        {/* Header */}
        <div className="px-8 py-10 border-b border-[#141413]/10">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-[#141413] mb-3">
            Terms & Conditions
          </h2>
          <p className="text-sm text-[#9E9E98] font-medium tracking-wide">
            {shootTitle}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-10 space-y-10">
          {/* Intro */}
          <div>
            <p className="text-base text-[#141413] leading-relaxed">
              Before accessing your shoot details, please review and agree to our working terms:
            </p>
          </div>

          {/* Placeholder content - will be updated with final text */}
          <div className="space-y-8">
            <div className="pb-8 border-b border-[#141413]/5">
              <h3 className="text-lg font-semibold text-[#141413] tracking-tight mb-4">
                Creative Vision
              </h3>
              <p className="text-[#5A5A54] leading-relaxed">
                You are engaging our services for our unique creative vision and artistic approach.
                Final editing and color grading reflect our professional expertise and signature style.
              </p>
            </div>

            <div className="pb-8 border-b border-[#141413]/5">
              <h3 className="text-lg font-semibold text-[#141413] tracking-tight mb-4">
                What You Can Request
              </h3>
              <ul className="space-y-2.5 text-[#5A5A54] leading-relaxed list-disc list-inside">
                <li>Select which photos you want from the gallery</li>
                <li>Request removal of blemishes or distractions</li>
                <li>Minor cropping or rotation adjustments</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#141413] tracking-tight mb-4">
                What We Cannot Accept
              </h3>
              <ul className="space-y-2.5 text-[#5A5A54] leading-relaxed list-disc list-inside">
                <li>Requests to alter color grading or editing style</li>
                <li>Changes to our creative choices and artistic direction</li>
                <li>Delivery of RAW files or unedited originals</li>
              </ul>
            </div>
          </div>

          {/* Placeholder Warning */}
          <div className="bg-amber-50/50 border-l-2 border-amber-400 px-5 py-4">
            <p className="text-sm text-amber-900/80 leading-relaxed">
              ⚠️ This is placeholder text. Final terms will be added by the studio.
            </p>
          </div>

          {/* Legal Text */}
          <div className="pt-4 border-t border-[#141413]/5">
            <p className="text-xs text-[#9E9E98] leading-relaxed mb-2">
              By clicking "I Agree & Continue" below, you acknowledge that you have read and agree
              to these terms and conditions.
            </p>
            <p className="text-xs text-[#9E9E98] leading-relaxed">
              Your agreement will be recorded with a timestamp for our records.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-[#141413]/10 bg-[#F9F9F7]">
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full px-8 py-4 bg-[#141413] text-white text-sm font-semibold tracking-wide hover:bg-[#2A2A28] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
          >
            {isAccepting ? 'Processing...' : 'I Agree & Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
};
