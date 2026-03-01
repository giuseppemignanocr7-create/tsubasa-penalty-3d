import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 120;

function makePersonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const colors = ['#cc2222', '#2244aa', '#ffcc00', '#ffffff', '#22aa44', '#ff6600', '#8822cc', '#22cccc'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  ctx.clearRect(0, 0, 32, 64);
  ctx.fillStyle = '#e8c090';
  ctx.beginPath();
  ctx.arc(16, 10, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillRect(8, 16, 16, 28);
  ctx.fillRect(2, 18, 6, 16);
  ctx.fillRect(24, 18, 6, 16);
  ctx.fillStyle = '#333';
  ctx.fillRect(9, 44, 6, 18);
  ctx.fillRect(17, 44, 6, 18);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

export default function Crowd({ excitement = 0 }) {
  const meshRef = useRef();
  const texture = useMemo(() => makePersonTexture(), []);

  const { matrices, offsets } = useMemo(() => {
    const mats = [];
    const offs = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < COUNT; i++) {
      const section = Math.floor(Math.random() * 3);
      let x, y, z;

      if (section === 0) {
        // Behind goal — stand at [0,0,-8], rows go up y=0.7+r*1.4, back z=-8-r*0.8
        x = (Math.random() - 0.5) * 20;
        const row = Math.floor(Math.random() * 6);
        y = row * 1.4 + 1.0 + Math.random() * 0.6;
        z = -8 - row * 0.8 + Math.random() * 0.4;
      } else if (section === 1) {
        // Left stand at [-14,0,5], rotated π/2
        const row = Math.floor(Math.random() * 5);
        x = -14 - row * 0.8 + Math.random() * 0.3;
        y = row * 1.4 + 1.0 + Math.random() * 0.6;
        z = 5 + (Math.random() - 0.5) * 16;
      } else {
        // Right stand at [14,0,5], rotated -π/2
        const row = Math.floor(Math.random() * 5);
        x = 14 + row * 0.8 - Math.random() * 0.3;
        y = row * 1.4 + 1.0 + Math.random() * 0.6;
        z = 5 + (Math.random() - 0.5) * 16;
      }

      dummy.position.set(x, y, z);
      dummy.scale.set(0.5 + Math.random() * 0.3, 0.8 + Math.random() * 0.4, 1);
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());
      offs.push(Math.random() * Math.PI * 2);
    }
    return { matrices: mats, offsets: offs };
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    matrices.forEach((m, i) => meshRef.current.setMatrixAt(i, m));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempMat = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock, camera }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < COUNT; i++) {
      meshRef.current.getMatrixAt(i, tempMat);
      dummy.position.setFromMatrixPosition(tempMat);
      dummy.scale.setFromMatrixScale(tempMat);
      const wave = Math.sin(t * 2 + offsets[i]) * (0.05 + excitement * 0.15);
      dummy.position.y += wave;
      dummy.lookAt(camera.position);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]} frustumCulled={false}>
      <planeGeometry args={[0.6, 1.2]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.1} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
