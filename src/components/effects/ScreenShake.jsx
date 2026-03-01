import React from 'react';
import { motion } from 'framer-motion';

export default function ScreenShake({ active = false, children }) {
  return (
    <motion.div
      style={{ width: '100%', height: '100%' }}
      animate={
        active
          ? {
              x: [0, -8, 6, -4, 8, -6, 4, -8, 6, -2, 0],
              y: [0, 2, -4, 6, -2, 4, -6, 2, -4, 6, 0],
              rotate: [0, -1, 1, -0.5, 0.5, -1, 0.5, -0.5, 1, 0, 0],
            }
          : { x: 0, y: 0, rotate: 0 }
      }
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
