import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImpactFlash({ visible = false, color = '#ffd700' }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={{
            ...styles.container,
            background: `radial-gradient(circle, ${color}cc 0%, ${color}44 40%, transparent 70%)`,
          }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
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
    zIndex: 38,
    pointerEvents: 'none',
  },
};
