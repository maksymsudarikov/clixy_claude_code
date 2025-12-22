import React from 'react';

interface ShootAvatarProps {
  title: string;
  client?: string;
  className?: string;
}

// Generate a consistent color from string
const getColorFromString = (str: string): string => {
  const colors = [
    '#141413', // Black
    '#2C5F2D', // Dark Green
    '#1E3A5F', // Navy Blue
    '#5C4033', // Brown
    '#3D405B', // Slate
    '#6B4226', // Coffee
    '#1B4332', // Forest
    '#283618', // Olive
    '#264653', // Teal
    '#2F4858', // Steel
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
      {/* Background pattern - subtle grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(255,255,255,0.3) 35px, rgba(255,255,255,0.3) 36px),
                          repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(255,255,255,0.3) 35px, rgba(255,255,255,0.3) 36px)`
      }}></div>

      {/* Initials */}
      <div className="relative z-10 text-white font-extrabold tracking-tighter uppercase select-none"
           style={{
             fontSize: 'clamp(4rem, 12vw, 8rem)',
             lineHeight: 0.8,
             fontFamily: 'system-ui, -apple-system, sans-serif',
             fontStretch: 'expanded',
             letterSpacing: '-0.05em'
           }}>
        {initials}
      </div>

      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-20"></div>
    </div>
  );
};
