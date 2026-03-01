import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import Stadium from './Stadium';
import Goal from './Goal';
import Field from './Field';
import Ball from './Ball';
import Keeper3D from './Keeper3D';
import Shooter3D from './Shooter3D';
import BallTrail from './BallTrail';
import CameraController from './CameraController';
import Lights from './Lights';
import Particles from './Particles';
import Crowd from './Crowd';
import PostProcessing from './PostProcessing';

function NightSky() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#020818');
    grad.addColorStop(0.3, '#081228');
    grad.addColorStop(0.6, '#0c1a38');
    grad.addColorStop(1, '#162040');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 300;
      const r = 0.3 + Math.random() * 1.2;
      const a = 0.3 + Math.random() * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,240,${a})`;
      ctx.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    return t;
  }, []);
  return <primitive object={tex} attach="background" />;
}

export default function Scene3D({
  cameraPreset = 'menu',
  ballPosition = [0, 0.22, 9],
  ballVisible = true,
  ballGlowing = false,
  keeperDive = null,
  shooterKickPhase = 'idle',
  trailPositions = [],
  trailVisible = false,
  particleType = 'none',
  particleOrigin = [0, 1, 0],
  bloomIntensity = 'normal',
  cinematicPhase = 'idle',
  netImpactPoint = null,
  netImpactForce = 0.5,
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 4, 16], fov: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <fog attach="fog" args={['#0a1025', 30, 90]} />
      <NightSky />
      <Environment preset="night" environmentIntensity={0.15} />

      <Suspense fallback={null}>
        <Lights />
        <Field />
        <Goal netImpactPoint={netImpactPoint} netImpactForce={netImpactForce} />
        <Stadium />
        <Crowd excitement={cinematicPhase === 'result' ? 0.8 : 0} />
        <Ball position={ballPosition} visible={ballVisible} glowing={ballGlowing} />
        <Keeper3D diveAnimation={keeperDive} />
        <Shooter3D kickPhase={shooterKickPhase} />
        <BallTrail positions={trailPositions} visible={trailVisible} />
        <Particles type={particleType} origin={particleOrigin} />
        <CameraController preset={cameraPreset} />
        <PostProcessing intensity={bloomIntensity} cinematicPhase={cinematicPhase} />
      </Suspense>
    </Canvas>
  );
}
