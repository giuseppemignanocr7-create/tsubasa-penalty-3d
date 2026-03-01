import React from 'react';
import { motion } from 'framer-motion';

export default function ActionButton({ children, onClick, color = '#ffd700', size = 'large', disabled = false, style = {} }) {
  const sizeStyles = size === 'large' ? styles.large : size === 'small' ? styles.small : styles.medium;

  return (
    <motion.button
      style={{
        ...styles.base,
        ...sizeStyles,
        color: '#111',
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: `0 0 15px ${color}66, 0 4px 12px rgba(0,0,0,0.4)`,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...style,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

const styles = {
  base: {
    fontFamily: "'Bangers', cursive",
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: 400,
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  large: {
    fontSize: 'clamp(1.4rem, 5vw, 2rem)',
    padding: '16px 40px',
    minWidth: 200,
  },
  medium: {
    fontSize: 'clamp(1rem, 3.5vw, 1.4rem)',
    padding: '12px 28px',
    minWidth: 150,
  },
  small: {
    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
    padding: '8px 20px',
    minWidth: 100,
  },
};
