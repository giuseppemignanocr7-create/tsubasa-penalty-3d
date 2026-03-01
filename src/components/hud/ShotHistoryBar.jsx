import React from 'react';
import { isGoal, isSave } from '../../game/gameTypes';

export default function ShotHistoryBar({ history, currentShooter }) {
  const currentHalf = history.filter(h => h.shooter === currentShooter);

  return (
    <div style={styles.container}>
      {Array.from({ length: 5 }).map((_, i) => {
        const shot = currentHalf[i];
        let bg = 'rgba(255,255,255,0.15)';
        let border = 'rgba(255,255,255,0.3)';
        let icon = '';
        if (shot) {
          if (isGoal(shot.result)) { bg = '#ffd700'; border = '#ffd700'; icon = '\u26BD'; }
          else if (isSave(shot.result)) { bg = '#00ff88'; border = '#00ff88'; icon = '\uD83E\uDDE4'; }
          else { bg = '#ff4444'; border = '#ff4444'; icon = '\u2716'; }
        }
        return (
          <div key={i} style={{ ...styles.dot, background: bg, borderColor: border }}>
            <span style={styles.icon}>{icon || (i + 1)}</span>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 8,
    zIndex: 25,
    pointerEvents: 'none',
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontFamily: "'Press Start 2P', monospace",
    color: '#fff',
    backdropFilter: 'blur(4px)',
  },
  icon: {
    fontSize: '0.8rem',
  },
};
