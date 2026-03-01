import React from 'react';
import { ROUND_CONFIG } from '../../data/roundConfig';

export default function RoundBadge({ round }) {
  const config = ROUND_CONFIG[round] || ROUND_CONFIG[1];
  return (
    <div style={styles.container}>
      <span style={styles.text}>{config.label}</span>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 70,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 25,
    pointerEvents: 'none',
  },
  text: {
    fontFamily: "'Bangers', cursive",
    fontSize: 'clamp(0.7rem, 2.5vw, 1rem)',
    color: 'rgba(255,215,0,0.8)',
    textShadow: '0 0 10px rgba(255,215,0,0.3)',
    letterSpacing: 2,
    whiteSpace: 'nowrap',
  },
};
