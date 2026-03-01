import React from 'react';
import { motion } from 'framer-motion';
import ActionButton from '../ui/ActionButton';
import CutsceneImage, { CUTSCENE_IMAGES } from '../ui/CutsceneImage';

export default function MenuScreen({ onStart, onOnline, onTraining }) {
  return (
    <div style={styles.container}>
      <div style={styles.bg} />
      {/* Anime character art — left and right */}
      <CutsceneImage src={CUTSCENE_IMAGES.menu_holly} position="left" maxWidth={220} maxHeight={340} opacity={0.7} borderGlow="#1a4fd4" />
      <CutsceneImage src={CUTSCENE_IMAGES.menu_benji} position="right" maxWidth={220} maxHeight={340} opacity={0.7} borderGlow="#e8860c" />
      <motion.div
        style={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title */}
        <motion.div
          style={styles.titleWrap}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div style={styles.subtitle}>CAPTAIN TSUBASA</div>
          <div style={styles.title}>PENALTY SHOOTOUT</div>
          <div style={styles.badge}>3D</div>
        </motion.div>

        {/* Ball */}
        <motion.div
          style={styles.ball}
          animate={{ y: [0, -12, 0], rotate: [0, 360] }}
          transition={{ y: { duration: 1, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 3, repeat: Infinity, ease: 'linear' } }}
        >
          ⚽
        </motion.div>

        {/* Buttons */}
        <motion.div
          style={styles.buttons}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ActionButton onClick={onTraining} color="#ffd700">
            ⚽ ALLENAMENTO
          </ActionButton>
          <ActionButton onClick={onStart} color="#1a6fd4" size="medium">
            👥 LOCALE 2 GIOCATORI
          </ActionButton>
          {onOnline && (
            <ActionButton onClick={onOnline} color="#00aa66" size="small">
              🌐 ONLINE
            </ActionButton>
          )}
        </motion.div>

        {/* Quick rules */}
        <motion.div
          style={styles.rules}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Scegli zona · Carica potenza · Mira precisione · Para i tiri!
        </motion.div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bg: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'radial-gradient(ellipse at 50% 30%, rgba(20,20,60,0.85) 0%, rgba(0,0,0,0.95) 100%)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 24, padding: '24px 20px',
  },
  titleWrap: { textAlign: 'center' },
  subtitle: {
    fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(0.65rem, 2vw, 0.85rem)',
    color: '#888', letterSpacing: 6, marginBottom: 4,
  },
  title: {
    fontFamily: "'Bangers', cursive", fontSize: 'clamp(2.2rem, 9vw, 4rem)',
    color: '#ffd700', letterSpacing: 4,
    textShadow: '0 0 30px rgba(255,215,0,0.4), 0 2px 0 #b8860b',
    lineHeight: 1,
  },
  badge: {
    display: 'inline-block', fontFamily: "'Press Start 2P', monospace",
    fontSize: '0.7rem', color: '#fff', background: '#d42020',
    padding: '3px 10px', borderRadius: 4, marginTop: 6,
    boxShadow: '0 2px 8px rgba(212,32,32,0.4)',
  },
  ball: { fontSize: '2.5rem', lineHeight: 1 },
  buttons: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  rules: {
    fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(0.55rem, 2vw, 0.7rem)',
    color: '#666', textAlign: 'center', maxWidth: 340,
  },
};
