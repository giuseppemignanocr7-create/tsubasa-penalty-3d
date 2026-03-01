import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function Field() {
  const fieldTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    // Base grass
    ctx.fillStyle = '#1a6b1a';
    ctx.fillRect(0, 0, 1024, 1024);
    // Mowing stripes
    for (let i = 0; i < 1024; i += 64) {
      ctx.fillStyle = i % 128 === 0 ? '#1f7a1f' : '#166616';
      ctx.fillRect(0, i, 1024, 64);
    }
    // Grass detail noise
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const g = 70 + Math.random() * 50;
      ctx.fillStyle = `rgba(${15 + Math.random() * 25}, ${g}, ${10 + Math.random() * 15}, 0.25)`;
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 3);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.anisotropy = 8;
    return tex;
  }, []);

  return (
    <group>
      {/* Main field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 5]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial map={fieldTexture} roughness={0.85} metalness={0.02} />
      </mesh>

      {/* Penalty box lines */}
      <WhiteLine from={[-5.5, 0, 0]} to={[-5.5, 0, 11]} />
      <WhiteLine from={[-5.5, 0, 11]} to={[5.5, 0, 11]} />
      <WhiteLine from={[5.5, 0, 11]} to={[5.5, 0, 0]} />
      {/* Goal area */}
      <WhiteLine from={[-2.75, 0, 0]} to={[-2.75, 0, 4]} />
      <WhiteLine from={[-2.75, 0, 4]} to={[2.75, 0, 4]} />
      <WhiteLine from={[2.75, 0, 4]} to={[2.75, 0, 0]} />

      {/* Penalty spot */}
      <mesh position={[0, 0.02, 9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 20]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Penalty arc (partial circle) */}
      <PenaltyArc />

      {/* Goal line */}
      <WhiteLine from={[-6, 0, 0]} to={[6, 0, 0]} />
    </group>
  );
}

function WhiteLine({ from, to }) {
  const dx = to[0] - from[0], dz = to[2] - from[2];
  const len = Math.sqrt(dx * dx + dz * dz);
  const cx = (from[0] + to[0]) / 2;
  const cz = (from[2] + to[2]) / 2;
  const angle = Math.atan2(dx, dz);
  return (
    <mesh position={[cx, 0.015, cz]} rotation={[-Math.PI / 2, 0, -angle]}>
      <planeGeometry args={[0.08, len]} />
      <meshBasicMaterial color="white" transparent opacity={0.9} />
    </mesh>
  );
}

function PenaltyArc() {
  const geo = useMemo(() => {
    const pts = [];
    const cx = 0, cz = 9, r = 2.5;
    for (let a = -0.65; a <= 0.65; a += 0.05) {
      pts.push(new THREE.Vector3(cx + Math.sin(a) * r, 0.015, cz - Math.cos(a) * r));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  return (
    <line geometry={geo}>
      <lineBasicMaterial color="white" transparent opacity={0.85} />
    </line>
  );
}
