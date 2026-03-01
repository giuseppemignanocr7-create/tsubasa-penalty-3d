import React, { useState } from 'react';
import { ZONES } from '../../data/zones';

export default function GoalGrid3D({ onSelect, selectedZone = null, label = 'SCEGLI ZONA' }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={styles.container}>
      <div style={styles.label}>{label}</div>
      <div style={styles.goalFrame}>
        <div style={styles.crossbar} />
        <div style={styles.postL} />
        <div style={styles.postR} />
        <div style={styles.grid}>
          {ZONES.map((zone) => {
            const isHov = hovered === zone.id;
            return (
              <button
                key={zone.id}
                style={{
                  ...styles.zoneBtn,
                  background: isHov ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.05)',
                  borderColor: isHov ? '#ffd700' : 'rgba(255,255,255,0.15)',
                  transform: isHov ? 'scale(1.06)' : 'scale(1)',
                }}
                onClick={() => onSelect(zone.id)}
                onPointerEnter={() => setHovered(zone.id)}
                onPointerLeave={() => setHovered(null)}
              >
                <span style={styles.zoneIcon}>{zone.icon}</span>
                <span style={styles.zoneLabel}>{zone.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute', bottom: '4%', left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 30,
  },
  label: {
    fontFamily: "'Bangers', cursive", fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
    color: '#ffd700', textShadow: '0 0 12px rgba(255,215,0,0.4)',
    marginBottom: 6, letterSpacing: 2,
  },
  goalFrame: {
    position: 'relative', padding: '6px 6px 8px',
    background: 'rgba(0,20,0,0.7)', borderRadius: 6,
    backdropFilter: 'blur(6px)',
  },
  crossbar: {
    position: 'absolute', top: -4, left: -6, right: -6, height: 8,
    background: '#fff', borderRadius: 4, zIndex: 3,
    boxShadow: '0 2px 10px rgba(255,255,255,0.3)',
  },
  postL: {
    position: 'absolute', top: -4, left: -6, width: 8, bottom: -2,
    background: '#fff', borderRadius: '4px 0 0 4px', zIndex: 3,
  },
  postR: {
    position: 'absolute', top: -4, right: -6, width: 8, bottom: -2,
    background: '#fff', borderRadius: '0 4px 4px 0', zIndex: 3,
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 4, position: 'relative', zIndex: 1,
  },
  zoneBtn: {
    width: 'clamp(56px, 14vw, 72px)', height: 'clamp(40px, 10vw, 52px)',
    borderRadius: 8, border: '2px solid',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 4, cursor: 'pointer', transition: 'all 0.12s ease',
    fontFamily: "'Russo One', sans-serif", color: '#fff',
    outline: 'none', WebkitTapHighlightColor: 'transparent',
  },
  zoneIcon: { fontSize: '1rem', lineHeight: 1 },
  zoneLabel: {
    fontSize: 'clamp(0.4rem, 1.2vw, 0.5rem)', opacity: 0.8, whiteSpace: 'nowrap',
  },
};
