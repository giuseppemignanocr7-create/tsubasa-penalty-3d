import React, { useMemo } from 'react';
import * as THREE from 'three';

function StandSection({ position, rotation, width, depth, rows, color }) {
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: rows }).map((_, r) => (
        <group key={r} position={[0, r * 1.4 + 0.7, -r * 0.8]}>
          {/* Concrete step */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, 0.15, depth]} />
            <meshStandardMaterial color="#555566" roughness={0.85} />
          </mesh>
          {/* Seat row */}
          <mesh position={[0, 0.15, depth * 0.15]}>
            <boxGeometry args={[width, 0.25, depth * 0.4]} />
            <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
          </mesh>
        </group>
      ))}
      {/* Roof overhang */}
      <mesh position={[0, rows * 1.4 + 1.5, -rows * 0.4]}>
        <boxGeometry args={[width + 1, 0.15, rows * 0.8 + depth + 2]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  );
}

function FloodlightTower({ position }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 10, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 20, 8]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Light housing */}
      <mesh position={[0, 20.2, 0]}>
        <boxGeometry args={[2.2, 0.6, 0.8]} />
        <meshStandardMaterial color="#999" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Light panels (glowing) */}
      {[-0.6, 0, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 20.2, 0.42]}>
          <planeGeometry args={[0.5, 0.4]} />
          <meshBasicMaterial color="#ffffee" />
        </mesh>
      ))}
      {/* Glow sprite */}
      <mesh position={[0, 20.3, 0.5]}>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshBasicMaterial color="#ffffdd" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

function AdBoard({ position, rotation, width }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 128;
    const ctx = c.getContext('2d');
    // LED board gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0, '#0a1a3a');
    grad.addColorStop(0.3, '#0d2255');
    grad.addColorStop(0.5, '#1a3377');
    grad.addColorStop(0.7, '#0d2255');
    grad.addColorStop(1, '#0a1a3a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 128);
    // Sponsor text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TSUBASA PENALTY', 300, 80);
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('★ CHAMPIONS ★', 750, 80);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[width, 0.9, 0.08]} />
      <meshStandardMaterial map={tex} emissive="#112244" emissiveIntensity={0.3} roughness={0.5} />
    </mesh>
  );
}

export default function Stadium() {
  return (
    <group>
      {/* === STANDS === */}
      {/* Behind goal */}
      <StandSection position={[0, 0, -8]} rotation={[0, 0, 0]} width={22} depth={1.8} rows={6} color="#cc2233" />
      {/* Left side */}
      <StandSection position={[-14, 0, 5]} rotation={[0, Math.PI / 2, 0]} width={18} depth={1.8} rows={5} color="#2244aa" />
      {/* Right side */}
      <StandSection position={[14, 0, 5]} rotation={[0, -Math.PI / 2, 0]} width={18} depth={1.8} rows={5} color="#2244aa" />

      {/* === FLOODLIGHTS === */}
      <FloodlightTower position={[-13, 0, -7]} />
      <FloodlightTower position={[13, 0, -7]} />
      <FloodlightTower position={[-13, 0, 18]} />
      <FloodlightTower position={[13, 0, 18]} />

      {/* === AD BOARDS === */}
      <AdBoard position={[0, 0.5, -5.5]} rotation={[0, 0, 0]} width={18} />
      <AdBoard position={[-8.5, 0.5, 5]} rotation={[0, Math.PI / 2, 0]} width={12} />
      <AdBoard position={[8.5, 0.5, 5]} rotation={[0, -Math.PI / 2, 0]} width={12} />

      {/* === TRACK / SURROUNDS === */}
      <mesh position={[0, -0.02, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2a2a35" roughness={0.95} />
      </mesh>
    </group>
  );
}
