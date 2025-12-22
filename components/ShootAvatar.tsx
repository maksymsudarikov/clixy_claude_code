import React from 'react';

interface ShootAvatarProps {
  title: string;
  client?: string;
  className?: string;
}

// Generate a consistent color from string
const getColorFromString = (str: string): string => {
  const colors = [
    '#141413', // Primary Black
    '#9E9E98', // Medium Gray
    '#6B6B68', // Dark Gray
    '#4A4A47', // Charcoal
    '#858580', // Stone Gray
    '#3E3E3B', // Deep Charcoal
    '#7A7A75', // Warm Gray
    '#525250', // Graphite
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Get initials from title (first letters of first two words)
const getInitials = (title: string): string => {
  const words = title.trim().toUpperCase().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2);
  }
  return words[0][0] + (words[1]?.[0] || '');
};

export const ShootAvatar: React.FC<ShootAvatarProps> = ({ title, client, className = '' }) => {
  const initials = getInitials(title);
  const bgColor = getColorFromString(title + (client || ''));

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 40px,
          rgba(255,255,255,0.5) 40px,
          rgba(255,255,255,0.5) 42px
        )`
      }}></div>

      {/* Initials - matching CLIXY brand style */}
      <div
        className="relative z-10 text-white font-extrabold uppercase select-none"
        style={{
          fontSize: 'clamp(3.5rem, 10vw, 7rem)',
          lineHeight: 1,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          textShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
        {initials}
      </div>

      {/* Subtle border accent */}
      <div className="absolute inset-0 border-4 border-white opacity-[0.08]"></div>
    </div>
  );
};
