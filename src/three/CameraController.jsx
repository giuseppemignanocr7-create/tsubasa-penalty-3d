import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CAMERA_PRESETS = {
  menu: { pos: [0, 4, 16], lookAt: [0, 1, 0], fov: 50 },
  shooterPick: { pos: [0, 6, -4], lookAt: [0, 1.2, 5], fov: 50 },
  keeperPick: { pos: [0, 3, 12], lookAt: [0, 1, 0], fov: 50 },
  preKick: { pos: [6, 2, 10], lookAt: [0, 0.5, 5], fov: 45 },
  kickMoment: { pos: [1.5, 0.8, 10], lookAt: [0, 0.22, 9], fov: 35 },
  ballFlight: { pos: [0, 3, 6], lookAt: [0, 1.5, 0], fov: 45 },
  behindGoal: { pos: [0, 2.5, -3], lookAt: [0, 1.2, 5], fov: 55 },
  impactSide: { pos: [4, 1, 1], lookAt: [0, 1, 0], fov: 40 },
  goalCelebration: { pos: [0, 1.5, -2.5], lookAt: [0, 1, 5], fov: 60 },
  saveCelebration: { pos: [2, 1.5, 2], lookAt: [0, 1, 0], fov: 45 },
  wide: { pos: [0, 5, 14], lookAt: [0, 1, 2], fov: 50 },
};

export default function CameraController({ preset = 'menu', transitionSpeed = 2 }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...CAMERA_PRESETS.menu.pos));
  const targetLookAt = useRef(new THREE.Vector3(...CAMERA_PRESETS.menu.lookAt));
  const currentLookAt = useRef(new THREE.Vector3(...CAMERA_PRESETS.menu.lookAt));
  const targetFov = useRef(CAMERA_PRESETS.menu.fov);

  useEffect(() => {
    const p = CAMERA_PRESETS[preset] || CAMERA_PRESETS.menu;
    targetPos.current.set(...p.pos);
    targetLookAt.current.set(...p.lookAt);
    targetFov.current = p.fov;
  }, [preset]);

  useFrame((_, delta) => {
    const lerpFactor = 1 - Math.exp(-transitionSpeed * delta);
    camera.position.lerp(targetPos.current, lerpFactor);
    currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
    camera.lookAt(currentLookAt.current);
    if (Math.abs(camera.fov - targetFov.current) > 0.1) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov.current, lerpFactor);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
