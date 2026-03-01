import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ballStore from './ballStore';

export default function Ball({ position = [0, 0.22, 9], visible = true, glowing = false }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const glowRef = useRef();

  const ballTexture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 256, 256);
    const pts = [[128,64],[64,128],[192,128],[90,200],[166,200],[128,128]];
    ctx.fillStyle = '#1a1a2e';
    pts.forEach(([cx, cy]) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        ctx.lineTo(cx + 22 * Math.cos(a), cy + 22 * Math.sin(a));
      }
      ctx.closePath(); ctx.fill();
    });
    return new THREE.CanvasTexture(c);
  }, []);

  const prevPos = useRef({ x: 0, z: 9 });

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Imperatively read ball position from store when active
    if (ballStore.active) {
      groupRef.current.position.set(ballStore.x, ballStore.y, ballStore.z);
    } else {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }

    if (meshRef.current && visible) {
      if (ballStore.active) {
        // Realistic spin: faster, with topspin/sidespin based on lateral movement
        const dx = ballStore.x - prevPos.current.x;
        const dz = ballStore.z - prevPos.current.z;
        meshRef.current.rotation.x += delta * 18; // fast topspin
        meshRef.current.rotation.y += dx * 2.5;   // sidespin from swerve
        meshRef.current.rotation.z += delta * 8 + Math.abs(dx) * 3;
        prevPos.current.x = ballStore.x;
        prevPos.current.z = ballStore.z;
      } else {
        // Gentle idle rotation
        meshRef.current.rotation.x += delta * 1.5;
        meshRef.current.rotation.z += delta * 0.8;
      }
    }
    if (glowRef.current) {
      const targetOpacity = ballStore.active
        ? 0.15 + Math.sin(Date.now() * 0.015) * 0.1
        : glowing ? 0.3 + Math.sin(Date.now() * 0.01) * 0.15 : 0;
      glowRef.current.material.opacity = THREE.MathUtils.lerp(
        glowRef.current.material.opacity, targetOpacity, delta * 8
      );
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial map={ballTexture} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh ref={glowRef} scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
