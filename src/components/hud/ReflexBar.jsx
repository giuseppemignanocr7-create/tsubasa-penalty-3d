import React, { useEffect, useCallback, useState } from 'react';
import { useOscillator } from '../../hooks/useOscillator';

export default function ReflexBar({ speed = 2.5, onConfirm }) {
  const { value, start, stop } = useOscillator(speed);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => { start(); }, [start]);

  const handleTap = useCallback(() => {
    const finalValue = stop();
    const accuracy = Math.abs(finalValue - 50);
    let color, label;
    if (accuracy <= 10) { color = '#00ff88'; label = 'RIFLESSO FELINO! 🐱'; }
    else if (accuracy <= 25) { color = '#44aaff'; label = 'BUON RIFLESSO'; }
    else { color = '#ff4444'; label = 'TROPPO LENTO!'; }
    setFeedback({ label, color });
    setTimeout(() => onConfirm(accuracy), 600);
  }, [stop, onConfirm]);

  const dist = Math.abs(value - 50);
  const indColor = dist <= 10 ? '#00ff88' : dist <= 25 ? '#44aaff' : '#ff4444';

  return (
    <div style={styles.touchArea} onClick={handleTap} onTouchEnd={(e) => { e.preventDefault(); handleTap(); }}>
      <div style={styles.inner}>
        <div style={styles.barOuter}>
          <div style={styles.greenZone} />
          <div style={styles.blueZoneL} />
          <div style={styles.blueZoneR} />
          {!feedback && (
            <div style={{ ...styles.needle, left: `${value}%`, background: indColor, boxShadow: `0 0 12px ${indColor}` }} />
          )}
          <div style={styles.centerMark} />
        </div>
        {feedback ? (
          <div style={{ ...styles.feedback, color: feedback.color }}>{feedback.label}</div>
        ) : (
          <div style={styles.tap}>TOCCA PER FERMARE</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  touchArea: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 30, cursor: 'pointer', userSelect: 'none',
  },
  inner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  barOuter: {
    position: 'relative', width: 'clamp(260px, 70vw, 380px)', height: 48,
    background: 'rgba(0,0,0,0.75)', borderRadius: 24,
    border: '2px solid rgba(255,255,255,0.2)', overflow: 'hidden',
  },
  greenZone: {
    position: 'absolute', left: '40%', width: '20%', height: '100%',
    background: 'rgba(0,255,136,0.2)',
  },
  blueZoneL: {
    position: 'absolute', left: '25%', width: '15%', height: '100%',
    background: 'rgba(68,170,255,0.1)',
  },
  blueZoneR: {
    position: 'absolute', left: '60%', width: '15%', height: '100%',
    background: 'rgba(68,170,255,0.1)',
  },
  centerMark: {
    position: 'absolute', left: '50%', top: 0, width: 2, height: '100%',
    background: 'rgba(0,255,136,0.4)', transform: 'translateX(-50%)',
  },
  needle: {
    position: 'absolute', top: -3, width: 6, height: 54, borderRadius: 3,
    transform: 'translateX(-50%)', transition: 'left 0.02s linear',
  },
  feedback: {
    fontFamily: "'Bangers', cursive", fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
    textShadow: '0 0 15px currentColor',
    animation: 'resultPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  tap: {
    fontFamily: "'Bangers', cursive", fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
    color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.4)', letterSpacing: 2,
    animation: 'breathe 1s infinite',
  },
};
