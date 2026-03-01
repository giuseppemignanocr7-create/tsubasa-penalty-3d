import React from 'react';
import PrecisionRing from '../hud/PrecisionRing';

export default function ShooterPrecisionScreen({ shrinkTime, onConfirm }) {
  return (
    <div style={styles.container}>
      <div style={styles.hint}>PRECISIONE! CENTRA IL BERSAGLIO!</div>
      <PrecisionRing shrinkTime={shrinkTime} onConfirm={onConfirm} />
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
    top: '8%',
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
