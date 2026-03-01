export const BALL_START = { x: 0, y: 0.22, z: 9 };

export const calculateControlPoints = (start, target, power, precision) => {
  const normalizedPower = power / 100;
  const normalizedPrecision = precision / 100;
  const height = 0.5 + normalizedPower * 3;
  const curveFactor = (1 - normalizedPrecision) * 1.5;
  const curveDir = Math.random() > 0.5 ? 1 : -1;

  const cp1 = {
    x: start.x + curveFactor * curveDir * 0.5,
    y: start.y + height,
    z: start.z + (target.z - start.z) * 0.33,
  };
  const cp2 = {
    x: target.x + curveFactor * curveDir * 0.3,
    y: target.y + height * 0.5,
    z: start.z + (target.z - start.z) * 0.66,
  };

  return { cp1, cp2 };
};

export const ANIMATION_DURATIONS = {
  runUp: 800,
  kick: 200,
  ballFlight: 1200,
  impact: 300,
  aftermath: 1500,
  totalSequence: 4500,
};
