import React from 'react';
import { motion } from 'framer-motion';
import { PLAYERS } from '../../data/players';
import ActionButton from '../ui/ActionButton';
import MangaPanel from '../ui/MangaPanel';

export default function PassDeviceScreen({ targetPlayer, role, onReady }) {
  const player = PLAYERS[targetPlayer];
  const isShooter = role === 'shooter';

  return (
    <div style={styles.container}>
      <div style={styles.backdrop} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <MangaPanel variant="gold" style={{ textAlign: 'center', maxWidth: 380 }}>
          <motion.div
            style={styles.lockIcon}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔒
          </motion.div>

          <div style={styles.passText}>PASSA IL DISPOSITIVO A</div>

          <div style={{ ...styles.playerName, color: player.accentColor }}>
            <span style={styles.avatar}>{player.avatar}</span>
            {player.nickname.toUpperCase()}
          </div>

          <div style={styles.roleContainer}>
            <span style={styles.roleLabel}>Ruolo:</span>
            <span style={{ ...styles.roleValue, color: isShooter ? '#ffd700' : '#00ff88' }}>
              {isShooter ? '⚽ TIRATORE' : '🧤 PORTIERE'}
            </span>
          </div>

          <div style={styles.teamInfo}>
            {player.team} · #{player.number}
          </div>

          <div style={styles.spacer} />

          <ActionButton
            onClick={onReady}
            color={player.primaryColor}
            size="medium"
          >
            SONO PRONTO
          </ActionButton>
        </MangaPanel>
      </motion.div>
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
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(12px)',
  },
  lockIcon: {
    fontSize: '3rem',
    marginBottom: 12,
  },
  passText: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: 'clamp(0.8rem, 3vw, 1rem)',
    color: '#aaa',
    letterSpacing: 3,
    marginBottom: 8,
  },
  playerName: {
    fontFamily: "'Bangers', cursive",
    fontSize: 'clamp(2rem, 8vw, 3rem)',
    letterSpacing: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  avatar: {
    fontSize: '2.2rem',
  },
  roleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  roleLabel: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: '0.8rem',
    color: '#888',
  },
  roleValue: {
    fontFamily: "'Bangers', cursive",
    fontSize: '1.4rem',
    letterSpacing: 2,
  },
  teamInfo: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: '0.7rem',
    color: '#666',
    marginTop: 8,
  },
  spacer: {
    height: 20,
  },
};
