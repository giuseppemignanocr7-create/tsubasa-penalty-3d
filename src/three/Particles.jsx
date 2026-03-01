import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Particle types:
// confetti  — colorful celebration on goals
// sparks    — orange sparks on powerful shots
// dust      — light grey ambient dust
// grass     — green grass clippings on kick
// diveDust  — brown dust cloud on keeper dive

const PARTICLE_CONFIG = {
  confetti: { count: 120, size: 0.1,  gravity: 3.5 },
  sparks:   { count: 60,  size: 0.06, gravity: 5 },
  dust:     { count: 30,  size: 0.05, gravity: 1 },
  grass:    { count: 40,  size: 0.04, gravity: 6 },
  diveDust: { count: 35,  size: 0.07, gravity: 2 },
};

export default function Particles({ type = 'none', origin = [0, 1, 0] }) {
  const pointsRef = useRef();
  const velocities = useRef([]);
  const ages = useRef([]);

  const { geometry, count, config } = useMemo(() => {
    const cfg = PARTICLE_CONFIG[type];
    const c = cfg ? cfg.count : 0;
    const positions = new Float32Array(c * 3);
    const colors = new Float32Array(c * 3);
    const vels = [];
    const ageArr = [];

    for (let i = 0; i < c; i++) {
      positions[i * 3] = origin[0] + (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = origin[1] + Math.random() * 0.5;
      positions[i * 3 + 2] = origin[2] + (Math.random() - 0.5) * 1.5;
      ageArr.push(0);

      if (type === 'confetti') {
        const col = new THREE.Color().setHSL(Math.random(), 0.9, 0.6);
        colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
        vels.push({ x: (Math.random() - 0.5) * 4, y: 3 + Math.random() * 5, z: (Math.random() - 0.5) * 4 });
      } else if (type === 'sparks') {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.6 + Math.random() * 0.4; colors[i * 3 + 2] = 0;
        vels.push({ x: (Math.random() - 0.5) * 6, y: 2 + Math.random() * 4, z: (Math.random() - 0.5) * 6 });
      } else if (type === 'grass') {
        // Green grass clippings kicked up
        const g = 0.3 + Math.random() * 0.4;
        colors[i * 3] = 0.1; colors[i * 3 + 1] = g; colors[i * 3 + 2] = 0.05;
        vels.push({
          x: (Math.random() - 0.5) * 3,
          y: 1.5 + Math.random() * 2.5,
          z: -1 - Math.random() * 3,  // mostly forward (toward goal)
        });
      } else if (type === 'diveDust') {
        // Brown/tan dust from keeper sliding
        const b = 0.5 + Math.random() * 0.2;
        colors[i * 3] = b; colors[i * 3 + 1] = b * 0.8; colors[i * 3 + 2] = b * 0.5;
        vels.push({
          x: (Math.random() - 0.5) * 2.5,
          y: 0.5 + Math.random() * 1.5,
          z: (Math.random() - 0.5) * 1.5,
        });
      } else {
        colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = 0.8;
        vels.push({ x: (Math.random() - 0.5) * 0.5, y: 0.5 + Math.random(), z: (Math.random() - 0.5) * 0.5 });
      }
    }

    velocities.current = vels;
    ages.current = ageArr;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { geometry: geo, count: c, config: cfg };
  }, [type, origin]);

  useFrame((_, delta) => {
    if (!pointsRef.current || count === 0) return;
    const posAttr = geometry.attributes.position;
    const grav = config?.gravity || 4;
    for (let i = 0; i < count; i++) {
      const vel = velocities.current[i];
      ages.current[i] += delta;
      posAttr.array[i * 3] += vel.x * delta;
      posAttr.array[i * 3 + 1] += vel.y * delta;
      posAttr.array[i * 3 + 2] += vel.z * delta;
      vel.y -= grav * delta;
      // Air resistance
      vel.x *= (1 - delta * 0.5);
      vel.z *= (1 - delta * 0.5);
    }
    posAttr.needsUpdate = true;
    // Fade out
    if (pointsRef.current.material) {
      const maxAge = Math.max(...ages.current);
      pointsRef.current.material.opacity = Math.max(0, 1 - maxAge * 0.6);
    }
  });

  if (count === 0) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={config?.size || 0.08}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
