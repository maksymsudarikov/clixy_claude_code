import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationBarProps {
  backTo: string;
  backLabel?: string;
  variant?: 'light' | 'dark' | 'transparent';
  position?: 'fixed' | 'relative';
  className?: string;
}

const IconArrowLeft = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

export const NavigationBar: React.FC<NavigationBarProps> = ({
  backTo,
  backLabel = 'Back',
  variant = 'dark',
  position = 'relative',
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backTo);
  };

  // Variant styles
  const variantClasses = {
    light: 'text-[#141413] hover:bg-[#141413] hover:text-[#D8D9CF]',
    dark: 'text-white bg-[#141413] hover:bg-white hover:text-[#141413]',
    transparent: 'text-white bg-[#141413]/80 backdrop-blur-sm hover:bg-[#141413]'
  };

  // Position styles - adjusted for mobile safe areas
  const positionClasses = {
    fixed: 'fixed top-4 left-4 md:top-6 md:left-6 z-50',
    relative: 'relative'
  };

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <button
        onClick={handleBack}
        className={`
          inline-flex items-center gap-2
          px-3 py-2.5 md:px-4 md:py-3
          min-h-[44px]
          border-2 border-[#141413]
          text-[10px] md:text-xs font-bold uppercase tracking-widest
          transition-all duration-200
          ${variantClasses[variant]}
          touch-manipulation
          shadow-[3px_3px_0px_0px_rgba(20,20,19,1)] md:shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]
          hover:shadow-[4px_4px_0px_0px_rgba(20,20,19,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(20,20,19,1)]
          active:shadow-[1px_1px_0px_0px_rgba(20,20,19,1)] md:active:shadow-[2px_2px_0px_0px_rgba(20,20,19,1)]
          active:translate-x-[1px] active:translate-y-[1px] md:active:translate-x-[2px] md:active:translate-y-[2px]
        `}
      >
        <IconArrowLeft />
        <span className="hidden sm:inline">{backLabel}</span>
      </button>
    </div>
  );
};
