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

  // Position styles
  const positionClasses = {
    fixed: 'fixed top-6 left-6 z-50',
    relative: 'relative'
  };

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <button
        onClick={handleBack}
        className={`
          inline-flex items-center gap-2
          px-4 py-3
          border-2 border-[#141413]
          text-xs font-bold uppercase tracking-widest
          transition-all duration-200
          ${variantClasses[variant]}
          touch-manipulation
          shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]
          hover:shadow-[6px_6px_0px_0px_rgba(20,20,19,1)]
          active:shadow-[2px_2px_0px_0px_rgba(20,20,19,1)]
          active:translate-x-[2px] active:translate-y-[2px]
        `}
      >
        <IconArrowLeft />
        <span>{backLabel}</span>
      </button>
    </div>
  );
};
