import React from 'react';
import PowerBar from '../hud/PowerBar';

export default function ShooterPowerScreen({ speed, onConfirm }) {
  return (
    <div style={styles.container}>
      <div style={styles.hint}>CARICA LA POTENZA!</div>
      <PowerBar speed={speed} onConfirm={onConfirm} />
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 20,
  },
  hint: {
    position: 'absolute',
    top: '12%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'Bangers', cursive",
    fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
    color: '#ffd700',
    textShadow: '0 0 15px rgba(255,215,0,0.5)',
    letterSpacing: 3,
    zIndex: 31,
    whiteSpace: 'nowrap',
  },
};
