import React from 'react';
import GoalGrid5Zones from '../ui/GoalGrid5Zones';

export default function ShooterComboScreen({ onSelect }) {
  return (
    <div style={styles.container}>
      <GoalGrid5Zones onSelect={onSelect} label="⚽ DOVE TIRI?" color="#ffd700" />
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    zIndex: 20,
  },
};
