import React from 'react';

interface ShootAvatarProps {
  title: string;
  client?: string;
  className?: string;
  variant?: 'card' | 'hero'; // card for grid, hero for detail page
}

// Always use brand black color
const getColorFromString = (_str: string): string => {
  return '#141413'; // Primary Black - consistent for all shoots
};

// Get initials from title (first letters of first two words)
const getInitials = (title: string): string => {
  const words = title.trim().toUpperCase().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2);
  }
  return words[0][0] + (words[1]?.[0] || '');
};

export const ShootAvatar: React.FC<ShootAvatarProps> = ({ title, client, className = '', variant = 'card' }) => {
  const initials = getInitials(title);
  const bgColor = getColorFromString(title + (client || ''));

  // Different sizes for card vs hero
  const isHero = variant === 'hero';
  const fontSize = isHero ? 'clamp(1.5rem, 4vw, 3rem)' : 'clamp(3rem, 8vw, 6rem)';

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Minimal grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 50px,
          rgba(255,255,255,0.3) 50px,
          rgba(255,255,255,0.3) 51px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 50px,
          rgba(255,255,255,0.3) 50px,
          rgba(255,255,255,0.3) 51px
        )`
      }}></div>

      {/* Initials - only show on card variant, hide on hero */}
      {!isHero && (
        <div
          className="relative z-10 text-white font-extrabold uppercase select-none"
          style={{
            fontSize,
            lineHeight: 1,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 900,
            letterSpacing: '-0.02em'
          }}>
          {initials}
        </div>
      )}
    </div>
  );
};
