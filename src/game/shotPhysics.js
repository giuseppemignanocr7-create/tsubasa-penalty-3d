import { getZone } from '../data/zones';

// Get the 3D position for a zone (ball target)
export function getShotTargetPosition(shooterZone) {
  const z = getZone(shooterZone);
  if (!z) return { x: 0, y: 1.2, z: 0 };
  return { x: z.x, y: z.y, z: z.z };
}

// Map 5 zones to keeper dive animations
// 0=Alto SX, 1=Alto DX, 2=Centro, 3=Basso SX, 4=Basso DX
export const KEEPER_DIVE_MAP = {
  0: 'DIVE_UP_LEFT',
  1: 'DIVE_UP_RIGHT',
  2: 'STAND',
  3: 'DIVE_LOW_LEFT',
  4: 'DIVE_LOW_RIGHT',
};

export function interpolateBezier(t, p0, p1, p2, p3) {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    z: mt3 * p0.z + 3 * mt2 * t * p1.z + 3 * mt * t2 * p2.z + t3 * p3.z,
  };
}
