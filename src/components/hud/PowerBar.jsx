import React, { useEffect, useCallback, useState } from 'react';
import { useOscillator } from '../../hooks/useOscillator';

const ZONES = [
  { min: 90, max: 100, label: 'TROPPO!', color: '#ff2222', emoji: '💥' },
  { min: 80, max: 90,  label: 'FORTE',   color: '#ff6600', emoji: '🔥' },
  { min: 60, max: 80,  label: 'PERFETTO', color: '#00cc44', emoji: '⚡' },
  { min: 40, max: 60,  label: 'MEDIO',   color: '#ffcc00', emoji: '👍' },
  { min: 0,  max: 40,  label: 'DEBOLE',  color: '#ff4444', emoji: '😤' },
];

function getZone(v) {
  for (const z of ZONES) { if (v >= z.min && v < z.max) return z; }
  return ZONES[4];
}

export default function PowerBar({ speed = 1.5, onConfirm }) {
  const { value, start, stop } = useOscillator(speed);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => { start(); }, [start]);

  const handleTap = useCallback(() => {
    const v = stop();
    const zone = getZone(v);
    setFeedback({ value: v, zone });
    setTimeout(() => onConfirm(v), 600);
  }, [stop, onConfirm]);

  const zone = getZone(value);

  return (
    <div style={styles.touchArea} onClick={!feedback ? handleTap : undefined} onTouchEnd={!feedback ? (e) => { e.preventDefault(); handleTap(); } : undefined}>
      <div style={styles.inner}>
        {/* Zone labels on left */}
        <div style={styles.labels}>
          {ZONES.map((z, i) => (
            <div key={i} style={{
              ...styles.zoneLabel,
              bottom: `${z.min}%`,
              height: `${z.max - z.min}%`,
              color: z.color,
              opacity: value >= z.min && value < z.max ? 1 : 0.3,
              fontWeight: value >= z.min && value < z.max ? 'bold' : 'normal',
            }}>
              {z.label}
            </div>
          ))}
        </div>

        {/* The bar */}
        <div style={styles.barOuter}>
          {/* Zone backgrounds */}
          {ZONES.map((z, i) => (
            <div key={i} style={{
              position: 'absolute', left: 0, width: '100%',
              bottom: `${z.min}%`, height: `${z.max - z.min}%`,
              background: z.color, opacity: 0.15,
              borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }} />
          ))}
          {/* Sweet spot highlight */}
          <div style={{
            position: 'absolute', left: 0, width: '100%',
            bottom: '60%', height: '20%',
            background: 'rgba(0,204,68,0.12)',
            border: '1px dashed rgba(0,204,68,0.4)',
            borderLeft: 'none', borderRight: 'none',
          }} />
          {/* Fill bar */}
          <div style={{
            ...styles.fill,
            height: `${feedback ? feedback.value : value}%`,
            background: `linear-gradient(to top, ${zone.color}44, ${zone.color}cc)`,
          }} />
          {/* Needle */}
          <div style={{
            ...styles.needle,
            bottom: `calc(${feedback ? feedback.value : value}% - 3px)`,
            background: zone.color,
            boxShadow: `0 0 16px ${zone.color}, 0 0 4px #fff`,
          }} />
        </div>

        {/* Value + feedback on right */}
        <div style={styles.valueCol}>
          {feedback ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>{feedback.zone.emoji}</div>
              <div style={{ ...styles.feedbackLabel, color: feedback.zone.color }}>{feedback.zone.label}</div>
              <div style={{ ...styles.pct, color: feedback.zone.color }}>{Math.round(feedback.value)}%</div>
            </div>
          ) : (
            <div style={{ ...styles.pct, color: zone.color }}>{Math.round(value)}%</div>
          )}
        </div>
      </div>

      {!feedback && <div style={styles.tap}>TOCCA PER FERMARE!</div>}
    </div>
  );
}

const styles = {
  touchArea: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    zIndex: 30, cursor: 'pointer', userSelect: 'none',
  },
  inner: { display: 'flex', alignItems: 'center', gap: 10 },
  labels: {
    position: 'relative', width: 70, height: 'clamp(220px, 55vh, 350px)',
  },
  zoneLabel: {
    position: 'absolute', left: 0, width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    paddingRight: 6,
    fontFamily: "'Russo One', sans-serif",
    fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
    letterSpacing: 1,
    transition: 'opacity 0.1s',
  },
  barOuter: {
    position: 'relative', width: 50, height: 'clamp(220px, 55vh, 350px)',
    background: 'rgba(0,0,0,0.8)', borderRadius: 25,
    border: '2px solid rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute', bottom: 0, left: 0, width: '100%',
    borderRadius: '0 0 23px 23px',
  },
  needle: {
    position: 'absolute', left: -4, width: 58, height: 6, borderRadius: 3,
    zIndex: 2,
  },
  valueCol: {
    width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  pct: {
    fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(1rem, 3.5vw, 1.5rem)',
  },
  feedbackLabel: {
    fontFamily: "'Bangers', cursive", fontSize: 'clamp(1rem, 3vw, 1.4rem)',
    letterSpacing: 2, marginBottom: 4,
  },
  tap: {
    marginTop: 16, fontFamily: "'Bangers', cursive", fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
    color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.4)', letterSpacing: 2,
    animation: 'breathe 1s infinite',
  },
};
