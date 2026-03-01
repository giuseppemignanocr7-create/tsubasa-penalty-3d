import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DramaticOverlay({ text, visible, color = '#ffd700' }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={styles.container}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={styles.vignette} />
          <motion.div
            style={{ ...styles.text, color, textShadow: `0 0 30px ${color}, 0 0 60px ${color}` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          >
            {text}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    pointerEvents: 'none',
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.5) 100%)',
  },
  text: {
    position: 'relative',
    fontFamily: "'Bangers', cursive",
    fontSize: 'clamp(1.8rem, 7vw, 3.5rem)',
    textAlign: 'center',
    padding: '0 20px',
    lineHeight: 1.2,
    letterSpacing: 3,
  },
};
