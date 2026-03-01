import React, { useState } from 'react';
import { ZONES } from '../../data/zones';

/**
 * 5-circle goal zone picker overlay.
 * Layout: top-left, top-right, center, bottom-left, bottom-right
 * Positioned over a goal frame to look like picking corners + center.
 */
export default function GoalGrid5Zones({ onSelect, label = 'SCEGLI ZONA', color = '#ffd700' }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={styles.container}>
      <div style={{ ...styles.label, color }}>{label}</div>
      <div style={styles.goalFrame}>
        {/* Crossbar + posts */}
        <div style={styles.crossbar} />
        <div style={styles.postL} />
        <div style={styles.postR} />
        {/* Net background */}
        <div style={styles.netBg} />
        {/* 5 zone circles */}
        <div style={styles.zonesContainer}>
          {ZONES.map((zone) => {
            const isHov = hovered === zone.id;
            const pos = CIRCLE_POSITIONS[zone.id];
            return (
              <button
                key={zone.id}
                style={{
                  ...styles.circle,
                  ...pos,
                  borderColor: isHov ? color : 'rgba(255,255,255,0.4)',
                  background: isHov ? `${color}33` : 'rgba(255,255,255,0.08)',
                  transform: isHov ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: isHov ? `0 0 20px ${color}66` : 'none',
                }}
                onClick={() => onSelect(zone.id)}
                onPointerEnter={() => setHovered(zone.id)}
                onPointerLeave={() => setHovered(null)}
              >
                <span style={styles.circleIcon}>{zone.icon}</span>
                <span style={{ ...styles.circleLabel, color: isHov ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                  {zone.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Position each circle within the goal frame (percentages)
const CIRCLE_POSITIONS = {
  0: { top: '8%',  left: '10%' },   // Alto SX
  1: { top: '8%',  right: '10%' },  // Alto DX
  2: { top: '35%', left: '50%', transform: 'translateX(-50%)' }, // Centro
  3: { bottom: '8%', left: '10%' },  // Basso SX
  4: { bottom: '8%', right: '10%' }, // Basso DX
};

const styles = {
  container: {
    position: 'absolute',
    bottom: '6%',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 30,
  },
  label: {
    fontFamily: "'Bangers', cursive",
    fontSize: 'clamp(1rem, 3.5vw, 1.4rem)',
    textShadow: '0 0 12px rgba(255,215,0,0.4)',
    marginBottom: 8,
    letterSpacing: 3,
  },
  goalFrame: {
    position: 'relative',
    width: 'clamp(280px, 70vw, 400px)',
    height: 'clamp(180px, 45vw, 260px)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  crossbar: {
    position: 'absolute',
    top: 0, left: -4, right: -4, height: 10,
    background: 'linear-gradient(180deg, #fff 0%, #ccc 100%)',
    borderRadius: '5px 5px 0 0',
    zIndex: 5,
    boxShadow: '0 3px 12px rgba(255,255,255,0.4)',
  },
  postL: {
    position: 'absolute',
    top: 0, left: 0, width: 10, bottom: 0,
    background: 'linear-gradient(90deg, #fff 0%, #ccc 100%)',
    borderRadius: '5px 0 0 5px',
    zIndex: 5,
  },
  postR: {
    position: 'absolute',
    top: 0, right: 0, width: 10, bottom: 0,
    background: 'linear-gradient(270deg, #fff 0%, #ccc 100%)',
    borderRadius: '0 5px 5px 0',
    zIndex: 5,
  },
  netBg: {
    position: 'absolute',
    top: 10, left: 10, right: 10, bottom: 0,
    background: `
      repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 20px),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 20px),
      rgba(0,30,0,0.75)
    `,
    borderRadius: '0 0 4px 4px',
    backdropFilter: 'blur(4px)',
    zIndex: 1,
  },
  zonesContainer: {
    position: 'absolute',
    top: 10, left: 10, right: 10, bottom: 0,
    zIndex: 10,
  },
  circle: {
    position: 'absolute',
    width: 'clamp(56px, 14vw, 72px)',
    height: 'clamp(56px, 14vw, 72px)',
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    zIndex: 10,
  },
  circleIcon: {
    fontSize: 'clamp(1rem, 3vw, 1.3rem)',
    lineHeight: 1,
    color: '#fff',
  },
  circleLabel: {
    fontSize: 'clamp(0.45rem, 1.3vw, 0.55rem)',
    fontFamily: "'Russo One', sans-serif",
    whiteSpace: 'nowrap',
  },
};
