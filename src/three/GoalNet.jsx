import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const W = 7.32;
const H = 2.44;
const D = 2.2;

export default function GoalNet({ impactPoint = null, impactForce = 0.5 }) {
  const backRef = useRef();
  const topRef = useRef();
  const leftRef = useRef();
  const rightRef = useRef();
  const origBack = useRef(null);
  const origTop = useRef(null);
  const origLeft = useRef(null);
  const origRight = useRef(null);

  useEffect(() => {
    if (backRef.current) origBack.current = new Float32Array(backRef.current.geometry.attributes.position.array);
    if (topRef.current) origTop.current = new Float32Array(topRef.current.geometry.attributes.position.array);
    if (leftRef.current) origLeft.current = new Float32Array(leftRef.current.geometry.attributes.position.array);
    if (rightRef.current) origRight.current = new Float32Array(rightRef.current.geometry.attributes.position.array);
  }, []);

  useFrame((_, delta) => {
    const panels = [
      { ref: backRef, orig: origBack, pos: [0, H / 2, -D], axis: 'z' },
      { ref: topRef, orig: origTop, pos: [0, H - 0.01, -D / 2], axis: 'y' },
      { ref: leftRef, orig: origLeft, pos: [-W / 2, H / 2, -D / 2], axis: 'x' },
      { ref: rightRef, orig: origRight, pos: [W / 2, H / 2, -D / 2], axis: 'x' },
    ];

    for (const panel of panels) {
      if (!panel.ref.current || !panel.orig.current) return;
      const pos = panel.ref.current.geometry.attributes.position.array;
      const orig = panel.orig.current;

      for (let i = 0; i < pos.length; i += 3) {
        if (impactPoint) {
          const worldX = pos[i] + panel.pos[0];
          const worldY = pos[i + 1] + panel.pos[1];
          const dx = worldX - impactPoint.x;
          const dy = worldY - impactPoint.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / 1.5);
          const push = influence * influence * impactForce * -0.8;

          if (panel.axis === 'z') {
            const targetZ = orig[i + 2] + push;
            pos[i + 2] += (targetZ - pos[i + 2]) * Math.min(1, 8 * delta);
          } else if (panel.axis === 'y') {
            const targetY = orig[i + 1] + push;
            pos[i + 1] += (targetY - pos[i + 1]) * Math.min(1, 8 * delta);
          } else {
            const targetX = orig[i] + push * Math.sign(panel.pos[0]);
            pos[i] += (targetX - pos[i]) * Math.min(1, 8 * delta);
          }
        } else {
          pos[i] += (orig[i] - pos[i]) * Math.min(1, 3 * delta);
          pos[i + 1] += (orig[i + 1] - pos[i + 1]) * Math.min(1, 3 * delta);
          pos[i + 2] += (orig[i + 2] - pos[i + 2]) * Math.min(1, 3 * delta);
        }
      }
      panel.ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const netMat = {
    color: '#ffffff',
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
    wireframe: true,
  };

  return (
    <group>
      <mesh ref={backRef} position={[0, H / 2, -D]}>
        <planeGeometry args={[W, H, 24, 12]} />
        <meshStandardMaterial {...netMat} />
      </mesh>
      <mesh ref={topRef} position={[0, H - 0.01, -D / 2]} rotation={[Math.PI / 2 + 0.05, 0, 0]}>
        <planeGeometry args={[W, D, 24, 8]} />
        <meshStandardMaterial {...netMat} />
      </mesh>
      <mesh ref={leftRef} position={[-W / 2, H / 2, -D / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H, 8, 12]} />
        <meshStandardMaterial {...netMat} />
      </mesh>
      <mesh ref={rightRef} position={[W / 2, H / 2, -D / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H, 8, 12]} />
        <meshStandardMaterial {...netMat} />
      </mesh>
    </group>
  );
}
