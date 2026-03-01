import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function BallTrail({ positions = [], color = '#ff6600', visible = false }) {
  const lineRef = useRef();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const maxPoints = 60;
    const pos = new Float32Array(maxPoints * 3);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setDrawRange(0, 0);
    return g;
  }, []);

  useFrame(() => {
    if (!lineRef.current || !visible || positions.length < 2) return;
    const posAttr = geometry.attributes.position;
    const count = Math.min(positions.length, 60);
    for (let i = 0; i < count; i++) {
      const p = positions[positions.length - count + i];
      posAttr.setXYZ(i, p.x, p.y, p.z);
    }
    posAttr.needsUpdate = true;
    geometry.setDrawRange(0, count);
  });

  if (!visible) return null;

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.6} linewidth={2} />
    </line>
  );
}
