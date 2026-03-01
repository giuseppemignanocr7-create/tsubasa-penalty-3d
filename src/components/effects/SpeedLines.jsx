import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpeedLines({ visible = false, intensity = 'normal' }) {
  const lines = useMemo(() => {
    const count = intensity === 'high' ? 30 : 20;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      angle: Math.random() * 360,
      length: 40 + Math.random() * 60,
      width: 1 + Math.random() * 2,
      delay: Math.random() * 0.3,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [intensity]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={styles.container}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {lines.map((line) => (
            <motion.div
              key={line.id}
              style={{
                ...styles.line,
                transform: `rotate(${line.angle}deg)`,
                width: `${line.length}%`,
                height: line.width,
                opacity: line.opacity,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: line.delay, ease: 'easeOut' }}
            />
          ))}
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
    zIndex: 35,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
    transformOrigin: 'center center',
    borderRadius: 1,
  },
};
