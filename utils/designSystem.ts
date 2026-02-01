// Design System Constants
// Mobile-first approach with touch-friendly sizing

export const colors = {
  primary: '#141413',
  background: '#D8D9CF',
  gray: '#9E9E98',
  lightGray: '#F0F0EB',
  white: '#FFFFFF',
} as const;

// Input with larger touch target on mobile (min 44px height)
export const inputClasses = "w-full bg-transparent text-[#141413] placeholder-[#9E9E98] border-b border-[#9E9E98] py-3 focus:border-[#141413] outline-none transition-colors font-medium text-base min-h-[44px]";

export const sectionHeaderClasses = "text-xs uppercase tracking-[0.2em] font-bold text-[#9E9E98] border-b border-[#141413] pb-4 mb-6";

export const labelClasses = "text-xs font-bold uppercase tracking-wider text-[#141413] mb-2 block";

// Buttons with minimum 44px touch target, mobile-optimized
export const buttonPrimaryClasses = "px-4 md:px-6 py-3 min-h-[44px] bg-[#141413] text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] border border-[#141413] transition-colors disabled:opacity-50 touch-manipulation active:scale-[0.98]";

export const buttonSecondaryClasses = "px-4 md:px-6 py-3 min-h-[44px] bg-white text-[#141413] text-xs font-bold uppercase tracking-widest hover:bg-[#141413] hover:text-white border border-[#141413] transition-colors disabled:opacity-50 touch-manipulation active:scale-[0.98]";

// Cards with responsive padding
export const cardClasses = "bg-white p-4 md:p-8 border border-[#141413] shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]";

export const cardDarkClasses = "bg-[#141413] text-white p-4 md:p-8 border border-[#141413]";

export const linkClasses = "text-xs font-bold uppercase tracking-widest border-b border-[#141413] pb-0.5 hover:text-[#9E9E98] hover:border-[#9E9E98] transition-colors touch-manipulation";

// Mobile-specific utility classes
export const mobileContainerClasses = "px-4 md:px-6 lg:px-8";

export const touchTargetClasses = "min-h-[44px] min-w-[44px]"; // Apple HIG recommended
