import React from 'react';

export default function MangaPanel({ children, style = {}, variant = 'default' }) {
  const baseStyle = {
    ...styles.panel,
    ...(variant === 'dark' ? styles.dark : {}),
    ...(variant === 'gold' ? styles.gold : {}),
    ...style,
  };

  return <div style={baseStyle}>{children}</div>;
}

const styles = {
  panel: {
    background: 'rgba(26, 26, 46, 0.95)',
    border: '4px solid #222',
    borderRadius: 4,
    boxShadow: '6px 6px 0 rgba(0,0,0,0.6)',
    padding: '20px 24px',
    overflow: 'hidden',
    position: 'relative',
    backdropFilter: 'blur(8px)',
  },
  dark: {
    background: 'rgba(10, 10, 26, 0.95)',
    border: '4px solid #333',
  },
  gold: {
    border: '4px solid #ffd700',
    boxShadow: '6px 6px 0 rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.15)',
  },
};
