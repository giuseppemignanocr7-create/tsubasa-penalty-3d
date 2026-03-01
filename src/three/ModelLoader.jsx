import React, { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';

/**
 * GLB Model Loader — future-ready component for loading
 * Captain Tsubasa character models from .glb files.
 *
 * Usage:
 *   <CharacterModel url="/models/benji.glb" fallback={<Keeper3D />} />
 *   <CharacterModel url="/models/holly.glb" fallback={<Shooter3D />} />
 *
 * When .glb models are available:
 *   1. Place them in /public/models/
 *   2. Replace the fallback primitives with the GLB version
 *   3. Animations can be driven via useAnimations from drei
 *
 * The fallback prop renders the current primitive-based model
 * while the GLB is loading (or if no GLB is provided).
 */

export function CharacterModel({ url, fallback, position, rotation, scale }) {
  if (!url) return fallback || null;

  return (
    <Suspense fallback={fallback}>
      <GLBModel url={url} position={position} rotation={rotation} scale={scale} />
    </Suspense>
  );
}

function GLBModel({ url, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const { scene } = useGLTF(url);
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
    />
  );
}

// Preload helper — call at module level for instant loading
export function preloadModel(url) {
  if (url) useGLTF.preload(url);
}

export default CharacterModel;
