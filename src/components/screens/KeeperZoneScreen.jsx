import React from 'react';
import GoalGrid3D from '../ui/GoalGrid3D';

export default function KeeperZoneScreen({ onSelect }) {
  return (
    <div style={styles.container}>
      <GoalGrid3D onSelect={onSelect} label="🧤 SCEGLI DOVE TUFFARTI" />
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
    zIndex: 20,
  },
};
