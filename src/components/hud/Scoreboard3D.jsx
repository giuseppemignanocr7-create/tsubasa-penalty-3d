import React from 'react';
import { PLAYERS } from '../../data/players';

export default function Scoreboard3D({ scores, penaltyNum, currentShooter, isTraining, humanRole, isSuddenDeath }) {
  const hollyLabel = isTraining ? (humanRole === 'shooter' ? 'TU' : 'BOT') : 'HOLLY';
  const benjiLabel = isTraining ? (humanRole === 'shooter' ? 'BOT' : 'TU') : 'BENJI';

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* Holly side */}
        <div style={{ ...styles.playerSide, background: 'rgba(26,79,212,0.25)', borderColor: PLAYERS.holly.primaryColor }}>
          <span style={styles.avatar}>{PLAYERS.holly.avatar}</span>
          <span style={styles.nickname}>{hollyLabel}</span>
          <span style={{ ...styles.score, color: PLAYERS.holly.accentColor }}>{scores.holly}</span>
        </div>

        {/* Center info */}
        <div style={styles.center}>
          <div style={styles.vs}>VS</div>
          <div style={styles.roundInfo}>{isSuddenDeath ? '⚡ OLTRANZA' : `RIGORE ${penaltyNum}/5`}</div>
        </div>

        {/* Benji side */}
        <div style={{ ...styles.playerSide, background: 'rgba(212,32,32,0.25)', borderColor: PLAYERS.benji.primaryColor }}>
          <span style={{ ...styles.score, color: PLAYERS.benji.accentColor }}>{scores.benji}</span>
          <span style={styles.nickname}>{benjiLabel}</span>
          <span style={styles.avatar}>{PLAYERS.benji.avatar}</span>
        </div>
      </div>
      {/* Shooter indicator */}
      <div style={styles.shooterIndicator}>
        {PLAYERS[currentShooter].avatar} {PLAYERS[currentShooter].nickname} tira
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 25,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    background: 'rgba(10,10,26,0.85)',
    borderRadius: 12,
    border: '2px solid rgba(255,255,255,0.15)',
    overflow: 'hidden',
    backdropFilter: 'blur(8px)',
  },
  playerSide: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderBottom: '3px solid',
  },
  avatar: {
    fontSize: '1.2rem',
  },
  nickname: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: 'clamp(0.6rem, 2.5vw, 0.85rem)',
    color: '#fff',
    letterSpacing: 1,
  },
  score: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 'clamp(1rem, 4vw, 1.6rem)',
    minWidth: 30,
    textAlign: 'center',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4px 10px',
  },
  vs: {
    fontFamily: "'Bangers', cursive",
    fontSize: '0.9rem',
    color: '#ffd700',
    lineHeight: 1,
  },
  roundInfo: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '0.45rem',
    color: '#aaa',
    marginTop: 2,
  },
  shooterIndicator: {
    marginTop: 4,
    fontFamily: "'Russo One', sans-serif",
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.7)',
    textShadow: '0 0 6px rgba(0,0,0,0.8)',
  },
};
