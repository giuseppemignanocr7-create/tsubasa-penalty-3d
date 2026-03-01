import React from 'react';
import { motion } from 'framer-motion';

export default function PlayerCard({ player, side = 'left' }) {
  return (
    <motion.div
      style={{
        ...styles.card,
        borderColor: player.primaryColor,
        boxShadow: `0 0 20px ${player.primaryColor}44`,
      }}
      initial={{ opacity: 0, x: side === 'left' ? -60 : 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: side === 'left' ? 0.2 : 0.4 }}
    >
      <div style={{ ...styles.avatarCircle, background: player.primaryColor }}>
        <span style={styles.avatar}>{player.avatar}</span>
      </div>
      <div style={styles.info}>
        <div style={{ ...styles.nickname, color: player.accentColor }}>{player.nickname}</div>
        <div style={styles.name}>{player.name}</div>
        <div style={styles.meta}>
          <span style={{ ...styles.number, background: player.primaryColor }}>#{player.number}</span>
          <span style={styles.team}>{player.team}</span>
        </div>
        <div style={styles.role}>{player.role}</div>
      </div>
    </motion.div>
  );
}

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    background: 'rgba(26, 26, 46, 0.9)',
    border: '3px solid',
    borderRadius: 12,
    backdropFilter: 'blur(8px)',
    minWidth: 220,
    maxWidth: 300,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatar: {
    fontSize: '1.8rem',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  nickname: {
    fontFamily: "'Bangers', cursive",
    fontSize: '1.6rem',
    letterSpacing: 2,
    lineHeight: 1,
  },
  name: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: '0.75rem',
    color: '#ccc',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  number: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '0.5rem',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: 4,
  },
  team: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: '0.6rem',
    color: '#aaa',
  },
  role: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: '0.55rem',
    color: '#888',
    marginTop: 2,
  },
};
