// Imperative store for ball position — bypasses React reconciliation
// Ball reads from this every frame via useFrame, AnimationScreen writes to it

const ballStore = {
  x: 0,
  y: 0.22,
  z: 9,
  active: false, // when true, Ball reads from store instead of props
};

export function resetBallStore() {
  ballStore.x = 0;
  ballStore.y = 0.22;
  ballStore.z = 9;
  ballStore.active = false;
}

export default ballStore;
