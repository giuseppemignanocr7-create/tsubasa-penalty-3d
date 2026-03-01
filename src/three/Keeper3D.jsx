import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DIVE_TARGETS = {
  DIVE_UP_LEFT:  { x: -2.5, y: 2.0, rz: 0.8,  armL: -2.2, armR: -1.0 },
  JUMP_UP:       { x: 0,    y: 2.2, rz: 0,     armL: -2.5, armR: -2.5 },
  DIVE_UP_RIGHT: { x: 2.5,  y: 2.0, rz: -0.8,  armL: -1.0, armR: -2.2 },
  DIVE_LEFT:     { x: -2.8, y: 1.0, rz: 1.2,   armL: -2.0, armR: -0.5 },
  STAND:         { x: 0,    y: 0,   rz: 0,      armL: 0,    armR: 0    },
  DIVE_RIGHT:    { x: 2.8,  y: 1.0, rz: -1.2,  armL: -0.5, armR: -2.0 },
  DIVE_LOW_LEFT: { x: -2.5, y: 0.3, rz: 1.4,   armL: -1.8, armR: -0.3 },
  DROP_LOW:      { x: 0,    y: 0.2, rz: 0,      armL: -1.5, armR: -1.5 },
  DIVE_LOW_RIGHT:{ x: 2.5,  y: 0.3, rz: -1.4,  armL: -0.3, armR: -1.8 },
};

// === Benji / Wakabayashi correct palette ===
const SKIN = '#f0c896';
const SKIN_S = '#d4a870';
const HAIR = '#1a1008';
const CAP = '#cc2222';
const CAP_D = '#991818';
const JERSEY = '#e8860c';
const COLLAR = '#eeeee8';
const PANTS = '#cc2222';
const PANTS_W = '#eeeee8';
const GLOVE = '#1e7a3a';
const GLOVE_Y = '#c8c820';
const SOCK_C = '#cc2222';
const BOOT_C = '#444';
const OUTLINE = '#181010';

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

// === 1024px FACE TEXTURE — ultra detailed ===
function benjiFace() {
  const s = 1024, c = document.createElement('canvas');
  c.width = s; c.height = s;
  const g = c.getContext('2d');

  // Skin base with subtle warm gradient
  const skinGrad = g.createRadialGradient(512, 480, 80, 512, 480, 500);
  skinGrad.addColorStop(0, '#f4d4a4');
  skinGrad.addColorStop(0.6, SKIN);
  skinGrad.addColorStop(1, SKIN_S);
  g.fillStyle = skinGrad; g.fillRect(0, 0, s, s);

  // Cheek blush — subtle warm circles
  g.globalAlpha = 0.12;
  g.fillStyle = '#e89070';
  g.beginPath(); g.ellipse(340, 540, 50, 35, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(684, 540, 50, 35, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1.0;

  // Cap shadow across forehead — gradient from visor
  const capSh = g.createLinearGradient(0, 200, 0, 380);
  capSh.addColorStop(0, 'rgba(40,20,5,0.4)');
  capSh.addColorStop(0.5, 'rgba(40,20,5,0.12)');
  capSh.addColorStop(1, 'rgba(40,20,5,0)');
  g.fillStyle = capSh; g.fillRect(120, 200, s - 240, 180);

  // Nose shadow on left side
  g.globalAlpha = 0.12;
  g.fillStyle = '#a07050';
  g.beginPath(); g.ellipse(490, 590, 18, 40, 0.1, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1.0;

  // --- EYES ---
  const ey = 490, sp = 128;
  [-1, 1].forEach(sd => {
    const cx = 512 + sd * sp;
    // Eye socket shadow
    g.globalAlpha = 0.08;
    g.fillStyle = '#705030';
    g.beginPath(); g.ellipse(cx, ey - 5, 65, 42, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1.0;

    // White of eye — almond shaped
    g.fillStyle = '#fafafa';
    g.beginPath(); g.ellipse(cx, ey, 50, 28, 0, 0, Math.PI * 2); g.fill();

    // Iris — dark brown, large
    const irisGrad = g.createRadialGradient(cx, ey + 2, 4, cx, ey + 2, 28);
    irisGrad.addColorStop(0, '#1a0800');
    irisGrad.addColorStop(0.6, '#2a1400');
    irisGrad.addColorStop(1, '#3a2210');
    g.fillStyle = irisGrad;
    g.beginPath(); g.ellipse(cx, ey + 2, 28, 26, 0, 0, Math.PI * 2); g.fill();

    // Pupil
    g.fillStyle = '#000';
    g.beginPath(); g.ellipse(cx, ey + 2, 14, 14, 0, 0, Math.PI * 2); g.fill();

    // Highlight — main bright spot
    g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(cx + 10, ey - 8, 8, 6, -0.2, 0, Math.PI * 2); g.fill();
    // Secondary smaller highlight
    g.globalAlpha = 0.6;
    g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(cx - 6, ey + 6, 4, 3, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1.0;

    // Upper eyelid — heavy, thick line (half-closed serious look)
    g.strokeStyle = '#0e0600'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.ellipse(cx, ey - 5, 52, 26, 0, Math.PI + 0.1, -0.1); g.stroke();

    // Eyelashes on outer corner (subtle)
    g.strokeStyle = '#0e0600'; g.lineWidth = 3;
    g.beginPath();
    g.moveTo(cx + sd * 48, ey - 10);
    g.lineTo(cx + sd * 54, ey - 18);
    g.stroke();

    // Lower eyelid — subtle
    g.strokeStyle = 'rgba(80,50,25,0.3)'; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(cx, ey + 6, 40, 18, 0, 0.2, Math.PI - 0.2); g.stroke();

    // EYEBROWS — thick, angled sharply inward, angry/focused
    g.strokeStyle = '#0e0600'; g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath();
    if (sd === -1) {
      g.moveTo(cx - 50, ey - 48); g.lineTo(cx + 30, ey - 70);
    } else {
      g.moveTo(cx + 50, ey - 48); g.lineTo(cx - 30, ey - 70);
    }
    g.stroke();
    // Eyebrow fill for thickness
    g.lineWidth = 6;
    g.beginPath();
    if (sd === -1) {
      g.moveTo(cx - 46, ey - 42); g.lineTo(cx + 26, ey - 64);
    } else {
      g.moveTo(cx + 46, ey - 42); g.lineTo(cx - 26, ey - 64);
    }
    g.stroke();
  });

  // NOSE — subtle L-shape with shadow
  g.strokeStyle = 'rgba(140,90,55,0.55)'; g.lineWidth = 3.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(505, 540); g.lineTo(514, 610); g.lineTo(502, 618); g.stroke();
  // Nostril dots
  g.fillStyle = 'rgba(120,70,40,0.3)';
  g.beginPath(); g.ellipse(496, 618, 5, 4, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(522, 616, 5, 4, 0, 0, Math.PI * 2); g.fill();

  // MOUTH — serious, straight, slight frown
  g.strokeStyle = '#8a5535'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(440, 690); g.lineTo(584, 690); g.stroke();
  // Frown corners
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(440, 690); g.lineTo(432, 698); g.stroke();
  g.beginPath(); g.moveTo(584, 690); g.lineTo(592, 698); g.stroke();
  // Upper lip shadow
  g.strokeStyle = 'rgba(120,70,40,0.2)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(460, 684); g.quadraticCurveTo(512, 678, 564, 684); g.stroke();

  // CHIN — subtle line
  g.strokeStyle = 'rgba(140,100,65,0.2)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(400, 790); g.quadraticCurveTo(512, 840, 624, 790); g.stroke();

  // Jaw edge shadow
  g.globalAlpha = 0.06;
  g.fillStyle = '#705030';
  g.beginPath(); g.ellipse(350, 620, 30, 120, 0.15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(674, 620, 30, 120, -0.15, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1.0;

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// === 1024px BACK TEXTURE ===
function benjiBack() {
  const s = 1024, c = document.createElement('canvas');
  c.width = s; c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = JERSEY; g.fillRect(0, 0, s, s);
  // Subtle fabric texture lines
  g.strokeStyle = 'rgba(0,0,0,0.05)'; g.lineWidth = 1;
  for (let i = 0; i < s; i += 8) {
    g.beginPath(); g.moveTo(0, i); g.lineTo(s, i); g.stroke();
  }
  g.fillStyle = '#fff'; g.textAlign = 'center';
  g.font = 'bold 48px Arial'; g.fillText('WAKABAYASHI', 512, 150);
  g.font = 'bold 360px Arial'; g.fillText('1', 512, 600);
  // White outline for number
  g.strokeStyle = '#fff'; g.lineWidth = 4;
  g.font = 'bold 360px Arial'; g.strokeText('1', 512, 600);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Anime outline component — slightly larger mesh behind with black backface
function Outline({ children, scale = 1.06, color = OUTLINE }) {
  return (
    <group>
      {children}
      {React.Children.map(children, child => {
        if (!child || child.type !== 'mesh') return null;
        return React.cloneElement(child, {
          scale: [scale, scale, scale],
          castShadow: false,
          receiveShadow: false,
          children: [
            child.props.children[0],
            <meshBasicMaterial key="ol" color={color} side={THREE.BackSide} />
          ]
        });
      })}
    </group>
  );
}

export default function Keeper3D({ diveAnimation = null }) {
  const groupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const torsoRef = useRef();
  const diveProgress = useRef(0);
  const idleTime = useRef(0);
  const lastDivePos = useRef({ x: 0, y: 0, rz: 0 });

  const faceTex = useMemo(benjiFace, []);
  const backTex = useMemo(benjiBack, []);
  const toonGrad = useMemo(makeToonGradient, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    idleTime.current += delta;

    if (diveAnimation && DIVE_TARGETS[diveAnimation]) {
      const target = DIVE_TARGETS[diveAnimation];
      diveProgress.current = Math.min(diveProgress.current + delta * 3.5, 1);
      const t = diveProgress.current;
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      groupRef.current.position.x = THREE.MathUtils.lerp(0, target.x, ease);
      groupRef.current.position.y = THREE.MathUtils.lerp(0, target.y, ease);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(0, target.rz, ease);

      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(0, target.armL, ease);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(0, target.armR, ease);

      const legKick = ease * 0.6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = target.rz > 0 ? legKick : -legKick * 0.3;
      if (rightLegRef.current) rightLegRef.current.rotation.x = target.rz < 0 ? legKick : -legKick * 0.3;

      if (torsoRef.current) torsoRef.current.rotation.x = -ease * 0.2;

      lastDivePos.current = { x: groupRef.current.position.x, y: groupRef.current.position.y, rz: groupRef.current.rotation.z };
    } else {
      if (diveProgress.current > 0.01) {
        diveProgress.current = Math.max(diveProgress.current - delta * 2.5, 0);
        const p = diveProgress.current;
        groupRef.current.position.x = lastDivePos.current.x * p;
        groupRef.current.position.y = lastDivePos.current.y * p;
        groupRef.current.rotation.z = lastDivePos.current.rz * p;
        if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.92;
        if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.92;
        if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.92;
        if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.92;
        if (torsoRef.current) torsoRef.current.rotation.x *= 0.92;
      } else {
        diveProgress.current = 0;
        const t = idleTime.current;
        groupRef.current.position.x = Math.sin(t * 2.5) * 0.35;
        groupRef.current.position.y = Math.abs(Math.sin(t * 5)) * 0.05;
        groupRef.current.rotation.z = Math.sin(t * 2.5) * 0.03;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -0.3 + Math.sin(t * 3) * 0.08;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.3 + Math.sin(t * 3 + 1) * 0.08;
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * 5) * 0.04;
        if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * 5 + Math.PI) * 0.04;
        if (torsoRef.current) torsoRef.current.rotation.x = 0.06;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0.5]}>
      {/* === TORSO GROUP === */}
      <group ref={torsoRef} position={[0, 0.72, 0]}>
        {/* Chest — ORANGE jersey, broad GK shoulders */}
        <mesh position={[0, 0.32, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.3, 8, 12]} />
          <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
        </mesh>
        {/* Chest outline */}
        <mesh position={[0, 0.32, 0]}>
          <capsuleGeometry args={[0.21, 0.31, 8, 12]} />
          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
        </mesh>
        {/* Shoulder caps — rounder upper body */}
        <mesh position={[-0.2, 0.46, 0]} castShadow>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0.2, 0.46, 0]} castShadow>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
        </mesh>
        {/* Waist */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.1, 6, 10]} />
          <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
        </mesh>
        {/* WHITE collar — fold-over polo style */}
        <mesh position={[0, 0.53, 0]}>
          <torusGeometry args={[0.12, 0.028, 8, 16]} />
          <meshToonMaterial color={COLLAR} gradientMap={toonGrad} />
        </mesh>
        {/* Collar flaps */}
        <mesh position={[-0.06, 0.53, 0.1]} rotation={[0.25, 0.2, 0]}>
          <boxGeometry args={[0.06, 0.045, 0.04]} />
          <meshToonMaterial color={COLLAR} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0.06, 0.53, 0.1]} rotation={[0.25, -0.2, 0]}>
          <boxGeometry args={[0.06, 0.045, 0.04]} />
          <meshToonMaterial color={COLLAR} gradientMap={toonGrad} />
        </mesh>
        {/* Number 1 back */}
        <mesh position={[0, 0.32, -0.21]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.34, 0.38]} />
          <meshBasicMaterial map={backTex} />
        </mesh>

        {/* ====== HEAD ====== */}
        <group position={[0, 0.78, 0]}>
          {/* Skull */}
          <mesh castShadow>
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
          {/* Head outline */}
          <mesh>
            <sphereGeometry args={[0.208, 24, 24]} />
            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
          </mesh>
          {/* FACE — 1024px flat plane */}
          <mesh position={[0, -0.02, 0.17]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial map={faceTex} transparent alphaTest={0.01} />
          </mesh>
          {/* Jaw — masculine, wider */}
          <mesh position={[0, -0.1, 0.04]}>
            <boxGeometry args={[0.18, 0.1, 0.14]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
          {/* Chin point */}
          <mesh position={[0, -0.15, 0.06]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>

          {/* === BLACK HAIR under cap === */}
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.205, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          {/* Temple tufts */}
          <mesh position={[-0.18, -0.01, 0.07]} rotation={[0, 0, -0.25]}>
            <capsuleGeometry args={[0.035, 0.08, 4, 6]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.18, -0.01, 0.07]} rotation={[0, 0, 0.25]}>
            <capsuleGeometry args={[0.035, 0.08, 4, 6]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          {/* Front bangs peeking under visor */}
          {[-0.08, -0.03, 0.02, 0.07].map((dx, i) => (
            <mesh key={`bang${i}`} position={[dx, 0.01, 0.17]} rotation={[-0.4, dx * 0.5, 0]}>
              <capsuleGeometry args={[0.018, 0.04, 4, 4]} />
              <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
            </mesh>
          ))}
          {/* Back nape */}
          <mesh position={[0, -0.04, -0.13]}>
            <capsuleGeometry args={[0.08, 0.05, 6, 8]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          {/* Sideburns */}
          <mesh position={[-0.17, -0.08, 0.04]}>
            <capsuleGeometry args={[0.02, 0.06, 4, 4]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.17, -0.08, 0.04]}>
            <capsuleGeometry args={[0.02, 0.06, 4, 4]} />
            <meshToonMaterial color={HAIR} gradientMap={toonGrad} />
          </mesh>

          {/* === RED CAP === */}
          {/* Dome */}
          <mesh position={[0, 0.06, 0.01]} rotation={[0.06, 0, 0]} scale={[1.08, 0.75, 1.06]}>
            <sphereGeometry args={[0.22, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshToonMaterial color={CAP} gradientMap={toonGrad} />
          </mesh>
          {/* Cap outline */}
          <mesh position={[0, 0.06, 0.01]} rotation={[0.06, 0, 0]} scale={[1.12, 0.78, 1.1]}>
            <sphereGeometry args={[0.22, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
          </mesh>
          {/* Cap band at base */}
          <mesh position={[0, 0.04, 0]} rotation={[0.06, 0, 0]}>
            <torusGeometry args={[0.215, 0.012, 6, 20]} />
            <meshToonMaterial color={CAP_D} gradientMap={toonGrad} />
          </mesh>
          {/* Visor */}
          <mesh position={[0, 0.04, 0.2]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.22, 0.014, 0.13]} />
            <meshToonMaterial color={CAP_D} gradientMap={toonGrad} />
          </mesh>
          {/* Visor underside */}
          <mesh position={[0, 0.034, 0.2]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.21, 0.005, 0.12]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
          {/* Button on top */}
          <mesh position={[0, 0.14, 0.01]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshToonMaterial color={CAP} gradientMap={toonGrad} />
          </mesh>

          {/* Ears */}
          <mesh position={[-0.19, -0.04, 0]}>
            <sphereGeometry args={[0.032, 8, 8]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.19, -0.04, 0]}>
            <sphereGeometry args={[0.032, 8, 8]} />
            <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
          </mesh>
        </group>
        {/* Neck */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.065, 0.08, 0.12, 8]} />
          <meshToonMaterial color={SKIN} gradientMap={toonGrad} />
        </mesh>

        {/* ===== LEFT ARM — orange sleeve + GREEN GLOVE ===== */}
        <group ref={leftArmRef} position={[-0.28, 0.4, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, -0.2]} castShadow>
            <capsuleGeometry args={[0.058, 0.2, 6, 8]} />
            <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, -0.2]}>
            <capsuleGeometry args={[0.065, 0.21, 6, 8]} />
            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
          </mesh>
          {/* Forearm */}
          <mesh position={[-0.05, -0.3, 0]} rotation={[0, 0, -0.12]}>
            <capsuleGeometry args={[0.05, 0.22, 6, 8]} />
            <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
          </mesh>
          {/* GREEN glove */}
          <mesh position={[-0.1, -0.52, 0]}>
            <boxGeometry args={[0.18, 0.13, 0.12]} />
            <meshToonMaterial color={GLOVE} gradientMap={toonGrad} />
          </mesh>
          {/* Glove outline */}
          <mesh position={[-0.1, -0.52, 0]}>
            <boxGeometry args={[0.19, 0.14, 0.13]} />
            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
          </mesh>
          {/* Yellow palm */}
          <mesh position={[-0.1, -0.52, 0.065]}>
            <boxGeometry args={[0.16, 0.12, 0.02]} />
            <meshToonMaterial color={GLOVE_Y} gradientMap={toonGrad} />
          </mesh>
          {/* Yellow wristband */}
          <mesh position={[-0.1, -0.44, 0]}>
            <boxGeometry args={[0.19, 0.028, 0.13]} />
            <meshToonMaterial color={GLOVE_Y} gradientMap={toonGrad} />
          </mesh>
          {/* Thumb (separate) */}
          <mesh position={[-0.2, -0.5, 0.03]} rotation={[0, 0, -0.4]}>
            <capsuleGeometry args={[0.016, 0.04, 4, 4]} />
            <meshToonMaterial color={GLOVE} gradientMap={toonGrad} />
          </mesh>
          {/* Fingers */}
          {[-0.05, -0.015, 0.02, 0.055].map((dx, i) => (
            <mesh key={`lf${i}`} position={[-0.1 + dx, -0.6, 0.02]} rotation={[0.15, 0, 0]}>
              <capsuleGeometry args={[0.016, 0.04, 4, 4]} />
              <meshToonMaterial color={GLOVE} gradientMap={toonGrad} />
            </mesh>
          ))}
        </group>
        {/* RIGHT ARM */}
        <group ref={rightArmRef} position={[0.28, 0.4, 0]}>
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0.2]} castShadow>
            <capsuleGeometry args={[0.058, 0.2, 6, 8]} />
            <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.065, 0.21, 6, 8]} />
            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
          </mesh>
          <mesh position={[0.05, -0.3, 0]} rotation={[0, 0, 0.12]}>
            <capsuleGeometry args={[0.05, 0.22, 6, 8]} />
            <meshToonMaterial color={JERSEY} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.1, -0.52, 0]}>
            <boxGeometry args={[0.18, 0.13, 0.12]} />
            <meshToonMaterial color={GLOVE} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.1, -0.52, 0]}>
            <boxGeometry args={[0.19, 0.14, 0.13]} />
            <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
          </mesh>
          <mesh position={[0.1, -0.52, 0.065]}>
            <boxGeometry args={[0.16, 0.12, 0.02]} />
            <meshToonMaterial color={GLOVE_Y} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.1, -0.44, 0]}>
            <boxGeometry args={[0.19, 0.028, 0.13]} />
            <meshToonMaterial color={GLOVE_Y} gradientMap={toonGrad} />
          </mesh>
          <mesh position={[0.2, -0.5, 0.03]} rotation={[0, 0, 0.4]}>
            <capsuleGeometry args={[0.016, 0.04, 4, 4]} />
            <meshToonMaterial color={GLOVE} gradientMap={toonGrad} />
          </mesh>
          {[-0.055, -0.02, 0.015, 0.05].map((dx, i) => (
            <mesh key={`rf${i}`} position={[0.1 + dx, -0.6, 0.02]} rotation={[0.15, 0, 0]}>
              <capsuleGeometry args={[0.016, 0.04, 4, 4]} />
              <meshToonMaterial color={GLOVE} gradientMap={toonGrad} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ===== RED PANTS with white stripe ===== */}
      <mesh position={[-0.08, 0.62, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.14, 6, 8]} />
        <meshToonMaterial color={PANTS} gradientMap={toonGrad} />
      </mesh>
      <mesh position={[0.08, 0.62, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.14, 6, 8]} />
        <meshToonMaterial color={PANTS} gradientMap={toonGrad} />
      </mesh>
      {/* White side stripes */}
      <mesh position={[-0.17, 0.62, 0]}>
        <capsuleGeometry args={[0.013, 0.12, 4, 4]} />
        <meshToonMaterial color={PANTS_W} gradientMap={toonGrad} />
      </mesh>
      <mesh position={[0.17, 0.62, 0]}>
        <capsuleGeometry args={[0.013, 0.12, 4, 4]} />
        <meshToonMaterial color={PANTS_W} gradientMap={toonGrad} />
      </mesh>

      {/* ===== LEFT LEG ===== */}
      <group ref={leftLegRef} position={[-0.09, 0.5, 0]}>
        {/* Thigh (red) */}
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.065, 0.24, 6, 8]} />
          <meshToonMaterial color={PANTS} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.072, 0.25, 6, 8]} />
          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
        </mesh>
        {/* White stripe */}
        <mesh position={[-0.065, -0.18, 0]}>
          <capsuleGeometry args={[0.01, 0.22, 4, 4]} />
          <meshToonMaterial color={PANTS_W} gradientMap={toonGrad} />
        </mesh>
        {/* Shin (red socks) */}
        <mesh position={[0, -0.46, 0]}>
          <capsuleGeometry args={[0.055, 0.3, 6, 8]} />
          <meshToonMaterial color={SOCK_C} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <capsuleGeometry args={[0.062, 0.31, 6, 8]} />
          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
        </mesh>
        {/* Sock top band */}
        <mesh position={[0, -0.3, 0]}>
          <torusGeometry args={[0.058, 0.008, 6, 12]} />
          <meshToonMaterial color={PANTS_W} gradientMap={toonGrad} />
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

      {/* ===== RIGHT LEG ===== */}
      <group ref={rightLegRef} position={[0.09, 0.5, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.065, 0.24, 6, 8]} />
          <meshToonMaterial color={PANTS} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.072, 0.25, 6, 8]} />
          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0.065, -0.18, 0]}>
          <capsuleGeometry args={[0.01, 0.22, 4, 4]} />
          <meshToonMaterial color={PANTS_W} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <capsuleGeometry args={[0.055, 0.3, 6, 8]} />
          <meshToonMaterial color={SOCK_C} gradientMap={toonGrad} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <capsuleGeometry args={[0.062, 0.31, 6, 8]} />
          <meshBasicMaterial color={OUTLINE} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <torusGeometry args={[0.058, 0.008, 6, 12]} />
          <meshToonMaterial color={PANTS_W} gradientMap={toonGrad} />
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
