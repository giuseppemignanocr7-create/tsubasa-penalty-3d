import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Floating dust motes / light particles in the stadium atmosphere
// Adds depth and realism to the night-match scene
const MOTE_COUNT = 60;

export default function AmbientMotes() {
  const pointsRef = useRef();

  const { geometry, offsets } = useMemo(() => {
    const positions = new Float32Array(MOTE_COUNT * 3);
    const sizes = new Float32Array(MOTE_COUNT);
    const offs = [];

    for (let i = 0; i < MOTE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = 0.5 + Math.random() * 12;
      positions[i * 3 + 2] = -5 + Math.random() * 25;
      sizes[i] = 0.02 + Math.random() * 0.04;
      offs.push({
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: 0.1 + Math.random() * 0.25,
        speedZ: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * Math.PI * 2,
        drift: 0.5 + Math.random() * 1.5,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return { geometry: geo, offsets: offs };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = geometry.attributes.position;

    for (let i = 0; i < MOTE_COUNT; i++) {
      const o = offsets[i];
      // Gentle floating motion
      posAttr.array[i * 3] += Math.sin(t * o.speedX + o.phase) * 0.003;
      posAttr.array[i * 3 + 1] += Math.sin(t * o.speedY + o.phase) * 0.002;
      posAttr.array[i * 3 + 2] += Math.cos(t * o.speedZ + o.phase) * 0.002;

      // Wrap around if too far
      if (posAttr.array[i * 3 + 1] > 14) posAttr.array[i * 3 + 1] = 0.5;
      if (posAttr.array[i * 3 + 1] < 0) posAttr.array[i * 3 + 1] = 12;
    }
    posAttr.needsUpdate = true;

    // Pulsing opacity
    if (pointsRef.current.material) {
      pointsRef.current.material.opacity = 0.3 + Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color="#ddeeff"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
