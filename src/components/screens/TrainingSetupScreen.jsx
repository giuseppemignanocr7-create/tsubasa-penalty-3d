import React from 'react';
import { motion } from 'framer-motion';
import ActionButton from '../ui/ActionButton';

export default function TrainingSetupScreen({ onSelectRole, onBack }) {
  return (
    <div style={styles.container}>
      <div style={styles.bg} />
      <motion.div
        style={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div style={styles.title}>ALLENAMENTO</div>
        <div style={styles.subtitle}>Scegli il tuo ruolo</div>

        <div style={styles.cards}>
          <motion.button
            style={styles.roleCard}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectRole('shooter')}
          >
            <span style={styles.roleEmoji}>⚽</span>
            <span style={styles.roleName}>TIRATORE</span>
            <span style={styles.roleDesc}>Scegli zona, carica potenza e precisione. Il portiere è controllato dal bot.</span>
          </motion.button>

          <motion.button
            style={{ ...styles.roleCard, borderColor: '#00ff88', background: 'linear-gradient(135deg, rgba(0,60,30,0.9), rgba(0,30,15,0.95))' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectRole('keeper')}
          >
            <span style={styles.roleEmoji}>🧤</span>
            <span style={{ ...styles.roleName, color: '#00ff88' }}>PORTIERE</span>
            <span style={styles.roleDesc}>Scegli dove tuffarti e ferma il riflesso. Il tiratore è controllato dal bot.</span>
          </motion.button>
        </div>

        <ActionButton onClick={onBack} color="#666" size="small" style={{ marginTop: 12 }}>
          ← INDIETRO
        </ActionButton>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  bg: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'radial-gradient(ellipse at center, rgba(10,10,40,0.92), rgba(0,0,0,0.97))',
  },
  content: {
    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  },
  title: {
    fontFamily: "'Bangers', cursive", fontSize: 'clamp(2rem, 7vw, 3rem)',
    color: '#ffd700', textShadow: '0 0 20px rgba(255,215,0,0.4)', letterSpacing: 4,
  },
  subtitle: {
    fontFamily: "'Russo One', sans-serif", fontSize: '0.9rem', color: '#aaa', letterSpacing: 2,
  },
  cards: {
    display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8,
  },
  roleCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    width: 'clamp(150px, 40vw, 180px)', padding: '24px 16px',
    background: 'linear-gradient(135deg, rgba(30,20,60,0.9), rgba(15,10,40,0.95))',
    border: '2px solid #ffd700', borderRadius: 16,
    cursor: 'pointer', outline: 'none', WebkitTapHighlightColor: 'transparent',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    transition: 'box-shadow 0.2s',
  },
  roleEmoji: { fontSize: '2.5rem' },
  roleName: {
    fontFamily: "'Bangers', cursive", fontSize: '1.4rem', color: '#ffd700', letterSpacing: 2,
  },
  roleDesc: {
    fontFamily: "'Russo One', sans-serif", fontSize: '0.6rem', color: '#999',
    textAlign: 'center', lineHeight: 1.4,
  },
};
