import React from 'react';
import ReflexBar from '../hud/ReflexBar';

export default function KeeperReflexScreen({ speed, onConfirm }) {
  return (
    <div style={styles.container}>
      <div style={styles.hint}>RIFLESSO! FERMA L'INDICATORE AL CENTRO!</div>
      <ReflexBar speed={speed} onConfirm={onConfirm} />
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
    fontSize: 'clamp(1rem, 3.5vw, 1.6rem)',
    color: '#00ff88',
    textShadow: '0 0 15px rgba(0,255,136,0.5)',
    letterSpacing: 3,
    zIndex: 31,
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
};
