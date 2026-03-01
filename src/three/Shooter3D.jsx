import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BALL_Z = 9;
const START_Z = 11;
const STOP_Z = BALL_Z + 0.6;

// === Holly / Tsubasa palette ===
const SKIN = '#f5d0a9';
const SKIN_S = '#dab88a';
const HAIR = '#080808';
const HEADBAND = '#dd2222';
const JERSEY = '#1a4fd4';
const JERSEY_W = '#f0f0f0';
const SHORT = '#f0f0f0';
const SOCK = '#1a4fd4';
const BOOT_C = '#111';
const OUTLINE = '#0a0a18';

// 3-step toon gradient for cel-shading
function makeToonGradient() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 1;
  const g = c.getContext('2d');
  g.fillStyle = '#555'; g.fillRect(0, 0, 1, 1);
  g.fillStyle = '#aaa'; g.fillRect(1, 0, 1, 1);
  g.fillStyle = '#fff'; g.fillRect(2, 0, 2, 1);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  return t;
}

// === 1024px FACE TEXTURE — ultra detailed Tsubasa ===
function hollyFace() {
  const s = 1024, c = document.createElement('canvas');
  c.width = s; c.height = s;
  const g = c.getContext('2d');

  // Skin base with warm radial gradient
  const skinGrad = g.createRadialGradient(512, 480, 80, 512, 480, 500);
  skinGrad.addColorStop(0, '#f8dab0');
  skinGrad.addColorStop(0.6, SKIN);
  skinGrad.addColorStop(1, SKIN_S);
  g.fillStyle = skinGrad; g.fillRect(0, 0, s, s);

  // Cheek blush — warm and youthful (Tsubasa has a young face)
  g.globalAlpha = 0.15;
  g.fillStyle = '#f09080';
  g.beginPath(); g.ellipse(340, 550, 55, 38, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(684, 550, 55, 38, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1.0;

  // Nose shadow
  g.globalAlpha = 0.1;
  g.fillStyle = '#a07050';
  g.beginPath(); g.ellipse(495, 580, 16, 38, 0.1, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1.0;

  // --- EYES — big round anime eyes (Tsubasa has larger, warmer eyes than Benji) ---
  const ey = 470, sp = 128;
  [-1, 1].forEach(sd => {
    const cx = 512 + sd * sp;
    // Eye socket shadow
    g.globalAlpha = 0.06;
    g.fillStyle = '#705030';
    g.beginPath(); g.ellipse(cx, ey - 5, 70, 48, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1.0;

    // White of eye — bigger, rounder than Benji
    g.fillStyle = '#fafafa';
    g.beginPath(); g.ellipse(cx, ey, 56, 40, 0, 0, Math.PI * 2); g.fill();

    // Iris — warm brown, large
    const irisGrad = g.createRadialGradient(cx, ey + 2, 4, cx, ey + 2, 34);
    irisGrad.addColorStop(0, '#2a1000');
    irisGrad.addColorStop(0.4, '#5a2800');
    irisGrad.addColorStop(0.8, '#3d1800');
    irisGrad.addColorStop(1, '#2a1400');
    g.fillStyle = irisGrad;
    g.beginPath(); g.ellipse(cx, ey + 2, 34, 34, 0, 0, Math.PI * 2); g.fill();

    // Pupil
    g.fillStyle = '#000';
    g.beginPath(); g.ellipse(cx, ey + 2, 16, 16, 0, 0, Math.PI * 2); g.fill();

    // Main highlight — big bright spot
    g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(cx + 12, ey - 10, 10, 8, -0.3, 0, Math.PI * 2); g.fill();
    // Secondary highlight
    g.globalAlpha = 0.7;
    g.beginPath(); g.ellipse(cx - 8, ey + 8, 5, 4, 0, 0, Math.PI * 2); g.fill();
    // Third tiny highlight
    g.globalAlpha = 0.4;
    g.beginPath(); g.ellipse(cx + 4, ey - 16, 3, 2, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1.0;

    // Upper eyelid — clean curve
    g.strokeStyle = '#0a0600'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.ellipse(cx, ey - 6, 58, 36, 0, Math.PI + 0.15, -0.15); g.stroke();

    // Eyelashes — subtle on outer corners
    g.strokeStyle = '#0a0600'; g.lineWidth = 3;
    g.beginPath();
    g.moveTo(cx + sd * 54, ey - 12);
    g.lineTo(cx + sd * 60, ey - 22);
    g.stroke();

    // Lower eyelid
    g.strokeStyle = 'rgba(80,50,25,0.25)'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(cx, ey + 8, 44, 20, 0, 0.2, Math.PI - 0.2); g.stroke();

    // EYEBROWS — determined but not as angry as Benji, slightly arched
    g.strokeStyle = '#0a0600'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath();
    if (sd === -1) {
      g.moveTo(cx - 48, ey - 50); g.quadraticCurveTo(cx, ey - 68, cx + 36, ey - 56);
    } else {
      g.moveTo(cx + 48, ey - 50); g.quadraticCurveTo(cx, ey - 68, cx - 36, ey - 56);
    }
    g.stroke();
  });

  // NOSE — small, youthful
  g.strokeStyle = 'rgba(160,110,70,0.45)'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(508, 540); g.lineTo(514, 606); g.lineTo(504, 612); g.stroke();
  // Nostril hint
  g.fillStyle = 'rgba(140,90,55,0.2)';
  g.beginPath(); g.ellipse(500, 612, 4, 3, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(520, 610, 4, 3, 0, 0, Math.PI * 2); g.fill();

  // MOUTH — slight confident smile (Tsubasa is upbeat)
  g.strokeStyle = '#a06045'; g.lineWidth = 4.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(446, 685); g.quadraticCurveTo(512, 710, 578, 685); g.stroke();
  // Smile corners up
  g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(446, 685); g.lineTo(440, 680); g.stroke();
  g.beginPath(); g.moveTo(578, 685); g.lineTo(584, 680); g.stroke();
  // Upper lip
  g.strokeStyle = 'rgba(140,80,50,0.18)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(465, 680); g.quadraticCurveTo(512, 674, 559, 680); g.stroke();

  // CHIN
  g.strokeStyle = 'rgba(160,110,70,0.15)'; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(410, 780); g.quadraticCurveTo(512, 820, 614, 780); g.stroke();

  // Jaw edge shadows
  g.globalAlpha = 0.05;
  g.fillStyle = '#705030';
  g.beginPath(); g.ellipse(355, 610, 28, 110, 0.12, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(669, 610, 28, 110, -0.12, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1.0;

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// === 1024px BACK TEXTURE ===
function hollyBack() {
  const s = 1024, c = document.createElement('canvas');
  c.width = s; c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = JERSEY; g.fillRect(0, 0, s, s);
  // Fabric texture
  g.strokeStyle = 'rgba(0,0,0,0.04)'; g.lineWidth = 1;
  for (let i = 0; i < s; i += 8) {
    g.beginPath(); g.moveTo(0, i); g.lineTo(s, i); g.stroke();
  }
  g.fillStyle = '#fff'; g.textAlign = 'center';
  g.font = 'bold 48px Arial'; g.fillText('TSUBASA', 512, 150);
  g.font = 'bold 320px Arial'; g.fillText('10', 512, 580);
  g.strokeStyle = '#fff'; g.lineWidth = 3;
  g.font = 'bold 320px Arial'; g.strokeText('10', 512, 580);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function Shooter3D({ kickPhase = 'idle' }) {
  const groupRef = useRef();
  const rightLegRef = useRef();
  const leftLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const torsoRef = useRef();
  const headRef = useRef();
  const kickProgress = useRef(0);
  const idleTime = useRef(0);
  const prevPhase = useRef('idle');

  const faceTex = useMemo(hollyFace, []);
  const backTex = useMemo(hollyBack, []);
  const toonGrad = useMemo(makeToonGradient, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    idleTime.current += delta;

    if (kickPhase !== prevPhase.current) {
      if (kickPhase === 'idle') {
        groupRef.current.position.z = START_Z;
        groupRef.current.position.y = 0;
        kickProgress.current = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (torsoRef.current) torsoRef.current.rotation.x = 0;
      }
      if (kickPhase === 'kicking') {
        kickProgress.current = 0;
        groupRef.current.position.z = STOP_Z;
      }
      prevPhase.current = kickPhase;
    }

    const runSwing = Math.sin(idleTime.current * 12);

    if (kickPhase === 'idle') {
      const t = idleTime.current;
      groupRef.current.position.y = Math.sin(t * 2) * 0.012;
      groupRef.current.rotation.y = Math.PI + Math.sin(t * 1.2) * 0.02;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.5) * 0.06;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 1.5 + 0.5) * 0.06;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * 1.8) * 0.03;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * 1.8 + 1) * 0.03;
      if (torsoRef.current) torsoRef.current.rotation.x = 0;
    } else if (kickPhase === 'running') {
      groupRef.current.position.y = Math.abs(Math.sin(idleTime.current * 10)) * 0.04;
      const z = groupRef.current.position.z;
      if (z > STOP_Z) {
        groupRef.current.position.z = Math.max(STOP_Z, z - delta * 3.5);
        if (rightLegRef.current) rightLegRef.current.rotation.x = runSwing * 0.6;
        if (leftLegRef.current) leftLegRef.current.rotation.x = -runSwing * 0.6;
        if (leftArmRef.current) leftArmRef.current.rotation.x = runSwing * 0.5;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -runSwing * 0.5;
        if (torsoRef.current) torsoRef.current.rotation.x = 0.08;
      } else {
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0.4;
        if (leftLegRef.current) leftLegRef.current.rotation.x = -0.15;
        if (torsoRef.current) torsoRef.current.rotation.x = 0.1;
      }
    } else if (kickPhase === 'kicking') {
      kickProgress.current = Math.min(kickProgress.current + delta * 4, 1);
      const t = kickProgress.current;
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(0.6, -1.5, ease);
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(0, -0.7, ease);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(0, 0.4, ease);
      if (torsoRef.current) torsoRef.current.rotation.x = THREE.MathUtils.lerp(0.1, -0.15, ease);
      groupRef.current.position.y = Math.sin(ease * Math.PI) * 0.08;
    } else if (kickPhase === 'done') {
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.9;
      if (torsoRef.current) torsoRef.current.rotation.x = -0.1;
      groupRef.current.position.y = 0;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 11]} rotation={[0, Math.PI, 0]}>
      {/* === TORSO GROUP === */}
      <group ref={torsoRef} position={[0, 0.72, 0]}>
        {/* Chest — blue jersey, slim build */}
        <mesh position={[0, 0.32, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.28, 8, 12]} />
          <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
        </mesh>
        {/* Chest outline */}
        <mesh position={[0, 0.32, 0]}>
          <capsuleGeometry args={[0.18, 0.29, 8, 12]} />
          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
        </mesh>
        {/* Shoulder caps */}
        <mesh position={[-0.17, 0.44, 0]} castShadow>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0.17, 0.44, 0]} castShadow>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
        </mesh>
        {/* Waist taper */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.1, 6, 10]} />
          <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
        </mesh>
        {/* V-neck collar white */}
        <mesh position={[0, 0.5, 0.1]} rotation={[0.35, 0, 0]}>
          <coneGeometry args={[0.06, 0.07, 4]} />
          <meshToonMaterial color={JERSEY_W} gradientMap={toonGrad} side={THREE.DoubleSide} />
        </mesh>
        {/* Number 10 back */}
        <mesh position={[0, 0.32, -0.18]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.32, 0.36]} />
          <meshBasicMaterial map={backTex} />
        </mesh>

        {/* ====== HEAD ====== */}
        <group ref={headRef} position={[0, 0.78, 0]}>
          {/* Skull */}
          <mesh castShadow>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
          {/* Head outline */}
          <mesh>
            <sphereGeometry args={[0.228, 24, 24]} />
            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
          </mesh>
          {/* FACE — 1024px flat plane */}
          <mesh position={[0, -0.03, 0.19]}>
            <planeGeometry args={[0.34, 0.34]} />
            <meshBasicMaterial map={faceTex} transparent alphaTest={0.01} />
          </mesh>
          {/* Jaw shaping */}
          <mesh position={[0, -0.12, 0.06]}>
            <boxGeometry args={[0.16, 0.1, 0.14]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
          {/* Chin */}
          <mesh position={[0, -0.16, 0.07]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>

          {/* ===== HAIR — iconic spikes with toon shading ===== */}
          {/* Main dome */}
          <mesh position={[0, 0.06, -0.01]} scale={[1.15, 1.05, 1.12]}>
            <sphereGeometry args={[0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          {/* Hair outline */}
          <mesh position={[0, 0.06, -0.01]} scale={[1.19, 1.09, 1.16]}>
            <sphereGeometry args={[0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
          </mesh>
          {/* FRONT SPIKES */}
          <mesh position={[0, 0.24, 0.12]} rotation={[-0.55, 0, 0]}>
            <coneGeometry args={[0.045, 0.2, 6]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[-0.06, 0.22, 0.11]} rotation={[-0.45, 0, 0.2]}>
            <coneGeometry args={[0.04, 0.17, 6]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.06, 0.22, 0.11]} rotation={[-0.45, 0, -0.2]}>
            <coneGeometry args={[0.04, 0.17, 6]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          {/* OUTER WING spikes */}
          <mesh position={[-0.12, 0.18, 0.08]} rotation={[-0.3, 0, 0.45]}>
            <coneGeometry args={[0.035, 0.14, 5]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.12, 0.18, 0.08]} rotation={[-0.3, 0, -0.45]}>
            <coneGeometry args={[0.035, 0.14, 5]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          {/* BACK spikes */}
          <mesh position={[-0.06, 0.2, -0.1]} rotation={[0.5, 0, 0.15]}>
            <coneGeometry args={[0.035, 0.14, 5]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.06, 0.2, -0.1]} rotation={[0.5, 0, -0.15]}>
            <coneGeometry args={[0.035, 0.14, 5]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0, 0.22, -0.12]} rotation={[0.6, 0, 0]}>
            <coneGeometry args={[0.04, 0.16, 5]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          {/* SIDE TUFTS */}
          <mesh position={[-0.2, -0.02, 0.04]} rotation={[0, 0, -0.2]}>
            <capsuleGeometry args={[0.04, 0.12, 4, 6]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.2, -0.02, 0.04]} rotation={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.04, 0.12, 4, 6]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          {/* Back nape */}
          <mesh position={[0, -0.04, -0.14]}>
            <capsuleGeometry args={[0.1, 0.06, 6, 8]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>

          {/* ===== RED HEADBAND ===== */}
          <mesh position={[0, 0.06, 0]} rotation={[0.08, 0, 0]}>
            <torusGeometry args={[0.225, 0.025, 8, 32]} />
            <meshToonMaterial color={HEADBAND} gradientMap={toonGrad} />
          </mesh>
          {/* Knot back */}
          <mesh position={[0, 0.06, -0.22]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshToonMaterial color={HEADBAND} gradientMap={toonGrad} />
          </mesh>
          {/* Tails */}
          <mesh position={[-0.03, 0.01, -0.28]} rotation={[-0.5, 0.15, 0]}>
            <capsuleGeometry args={[0.014, 0.14, 4, 4]} />
            <meshToonMaterial color={HEADBAND} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.03, -0.02, -0.3]} rotation={[-0.7, -0.15, 0]}>
            <capsuleGeometry args={[0.014, 0.16, 4, 4]} />
            <meshToonMaterial color={HEADBAND} gradientMap={toonGrad} />
          </mesh>

          {/* Ears */}
          <mesh position={[-0.21, -0.04, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.21, -0.04, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
        </group>
        {/* Neck */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.055, 0.07, 0.1, 8]} />
          <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
        </mesh>

        {/* ===== LEFT ARM (captain armband) ===== */}
        <group ref={leftArmRef} position={[-0.24, 0.4, 0]}>
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, -0.1]} castShadow>
            <capsuleGeometry args={[0.05, 0.2, 6, 8]} />
            <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[0.057, 0.21, 6, 8]} />
            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
          </mesh>
          <mesh position={[-0.02, -0.3, 0]} rotation={[0, 0, -0.05]}>
            <capsuleGeometry args={[0.04, 0.22, 6, 8]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
          {/* Captain armband */}
          <mesh position={[0, -0.12, 0]}>
            <torusGeometry args={[0.055, 0.012, 6, 12]} />
            <meshToonMaterial color="#fff" gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <torusGeometry args={[0.056, 0.005, 6, 12]} />
            <meshToonMaterial color="#cc0000" gradientMap={toonGrad} />
          </mesh>
          {/* Hand */}
          <mesh position={[-0.03, -0.48, 0]}>
            <sphereGeometry args={[0.032, 8, 8]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
        </group>
        {/* RIGHT ARM */}
        <group ref={rightArmRef} position={[0.24, 0.4, 0]}>
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0.1]} castShadow>
            <capsuleGeometry args={[0.05, 0.2, 6, 8]} />
            <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.057, 0.21, 6, 8]} />
            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
          </mesh>
          <mesh position={[0.02, -0.3, 0]} rotation={[0, 0, 0.05]}>
            <capsuleGeometry args={[0.04, 0.22, 6, 8]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.03, -0.48, 0]}>
            <sphereGeometry args={[0.032, 8, 8]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
        </group>
      </group>

      {/* ===== SHORTS — white with blue stripe ===== */}
      <mesh position={[-0.07, 0.62, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.14, 6, 8]} />
        <meshToonMaterial color={SHORT} gradientMap={toonGrad} />
      </mesh>
      <mesh position={[0.07, 0.62, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.14, 6, 8]} />
        <meshToonMaterial color={SHORT} gradientMap={toonGrad} />
      </mesh>
      <mesh position={[-0.16, 0.62, 0]}>
        <capsuleGeometry args={[0.015, 0.12, 4, 4]} />
        <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
      </mesh>
      <mesh position={[0.16, 0.62, 0]}>
        <capsuleGeometry args={[0.015, 0.12, 4, 4]} />
        <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
      </mesh>

      {/* ===== LEFT LEG ===== */}
      <group ref={leftLegRef} position={[-0.08, 0.5, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.065, 0.24, 6, 8]} />
          <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.072, 0.25, 6, 8]} />
          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
        </mesh>
        {/* Shin (blue sock) */}
        <mesh position={[0, -0.46, 0]}>
          <capsuleGeometry args={[0.055, 0.3, 6, 8]} />
          <meshToonMaterial color={SOCK} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <capsuleGeometry args={[0.062, 0.31, 6, 8]} />
          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
        </mesh>
        {/* Sock top band */}
        <mesh position={[0, -0.32, 0]}>
          <torusGeometry args={[0.057, 0.008, 6, 12]} />
          <meshToonMaterial color={JERSEY_W} gradientMap={toonGrad} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.66, 0.05]}>
          <boxGeometry args={[0.1, 0.05, 0.18]} />
          <meshToonMaterial color={BOOT_C} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.69, 0.05]}>
          <boxGeometry args={[0.11, 0.015, 0.19]} />
          <meshBasicMaterial color="#333" />
        </mesh>
      </group>

      {/* ===== RIGHT LEG (kicking) ===== */}
      <group ref={rightLegRef} position={[0.08, 0.5, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.065, 0.24, 6, 8]} />
          <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.072, 0.25, 6, 8]} />
          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <capsuleGeometry args={[0.055, 0.3, 6, 8]} />
          <meshToonMaterial color={SOCK} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <capsuleGeometry args={[0.062, 0.31, 6, 8]} />
          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <torusGeometry args={[0.057, 0.008, 6, 12]} />
          <meshToonMaterial color={JERSEY_W} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.66, 0.05]}>
          <boxGeometry args={[0.1, 0.05, 0.18]} />
          <meshToonMaterial color={BOOT_C} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.69, 0.05]}>
          <boxGeometry args={[0.11, 0.015, 0.19]} />
          <meshBasicMaterial color="#333" />
        </mesh>
      </group>
    </group>
  );
}
