import React from 'react';

export default function GlowText({ children, color = '#ffd700', size = '2rem', style = {} }) {
  return (
    <div
      style={{
        fontFamily: "'Bangers', cursive",
        fontSize: size,
        color,
        textShadow: `0 0 20px ${color}, 0 0 40px ${color}88`,
        letterSpacing: 3,
        textAlign: 'center',
        animation: 'titleGlow 2s ease-in-out infinite',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
