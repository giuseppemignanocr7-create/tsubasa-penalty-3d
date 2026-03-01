import React from 'react';
import GoalNet from './GoalNet';

const W = 7.32;
const H = 2.44;
const R = 0.06;
const D = 2.2;
const POST_MAT = { color: '#f0f0f0', metalness: 0.7, roughness: 0.2 };

function Post({ pos }) {
  return (
    <mesh position={pos} castShadow>
      <cylinderGeometry args={[R, R, H, 12]} />
      <meshStandardMaterial {...POST_MAT} />
    </mesh>
  );
}

export default function Goal({ netImpactPoint = null, netImpactForce = 0.5 }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Posts */}
      <Post pos={[-W / 2, H / 2, 0]} />
      <Post pos={[W / 2, H / 2, 0]} />

      {/* Crossbar */}
      <mesh position={[0, H, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[R, R, W + R * 2, 12]} />
        <meshStandardMaterial {...POST_MAT} />
      </mesh>

      {/* Back support frame */}
      <mesh position={[-W / 2, H / 2, -D]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, H, 8]} />
        <meshStandardMaterial color="#ccc" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[W / 2, H / 2, -D]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, H, 8]} />
        <meshStandardMaterial color="#ccc" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, H, -D]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, W, 8]} />
        <meshStandardMaterial color="#ccc" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.03, -D]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, W, 8]} />
        <meshStandardMaterial color="#999" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Deformable net */}
      <GoalNet impactPoint={netImpactPoint} impactForce={netImpactForce} />

      {/* Ground anchors */}
      {[-W / 2, W / 2].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.1, 8]} />
          <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
