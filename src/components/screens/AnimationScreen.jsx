import React, { useEffect, useState, useRef } from 'react';
import { useSound } from '../../hooks/useSound';
import { getShotTargetPosition, KEEPER_DIVE_MAP } from '../../game/shotPhysics';
import ballStore from '../../three/ballStore';
import SpeedLines from '../effects/SpeedLines';
import ImpactFlash from '../effects/ImpactFlash';
import DramaticOverlay from '../hud/DramaticOverlay';
import { getResultColor } from '../../styles/theme';

export default function AnimationScreen({
  shotResult,
  dramaticLine,
  shooterZone,
  keeperZone,
  onComplete,
  onSceneUpdate,
}) {
  const { play } = useSound();
  const [speedLines, setSpeedLines] = useState(false);
  const [impactFlash, setImpactFlash] = useState(false);
  const [showDramatic, setShowDramatic] = useState(false);

  const resultColor = getResultColor(shotResult);

  // Stable refs for callbacks
  const onSceneRef = useRef(onSceneUpdate);
  const onCompleteRef = useRef(onComplete);
  const playRef = useRef(play);
  onSceneRef.current = onSceneUpdate;
  onCompleteRef.current = onComplete;
  playRef.current = play;

  // Stable refs for props used inside effect
  const propsRef = useRef({ shotResult, shooterZone, keeperZone });
  propsRef.current = { shotResult, shooterZone, keeperZone };

  useEffect(() => {
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    let rafId = null;
    let flightStart = 0;

    const { shotResult: sr, shooterZone: sz, keeperZone: kz } = propsRef.current;
    const keeperDive = KEEPER_DIVE_MAP[kz] || 'STAND';

    const target = getShotTargetPosition(sz);
    const startX = 0, startY = 0.22, startZ = 9;
    const TOTAL_FLIGHT_MS = 950;

    const isHigh = target.y > 1.8;
    const arcHeight = isHigh ? 2.2 : target.y > 1.0 ? 1.4 : 0.6;
    const swerveAmount = target.x * 0.3;

    // Slow-motion easing
    function easeProgress(elapsed) {
      const raw = elapsed / TOTAL_FLIGHT_MS;
      if (raw <= 0.45) {
        return (raw / 0.45) * 0.65;
      } else if (raw <= 0.80) {
        return 0.65 + ((raw - 0.45) / 0.35) * 0.23;
      } else {
        return 0.88 + ((raw - 0.80) / 0.20) * 0.12;
      }
    }

    function animateBall(ts) {
      if (!flightStart) flightStart = ts;
      const elapsed = ts - flightStart;
      const p = Math.min(easeProgress(elapsed), 1);

      const t = 1 - Math.pow(1 - p, 2);
      const arc = Math.sin(t * Math.PI) * arcHeight * (1 - t * 0.3);
      const swerve = Math.sin(t * Math.PI * 0.8) * swerveAmount * (1 - t);
      ballStore.x = startX + (target.x - startX) * t + swerve;
      ballStore.y = startY + (target.y - startY) * t + arc * (1 - t);
      ballStore.z = startZ + (target.z - startZ) * t;
      if (p < 1) rafId = requestAnimationFrame(animateBall);
    }

    // 0ms: shooter runs
    at(0, () => {
      ballStore.active = false;
      onSceneRef.current?.({ cameraPreset: 'preKick', shooterKickPhase: 'running', cinematicPhase: 'running' });
    });

    // 600ms: kick → ball flies
    at(600, () => {
      onSceneRef.current?.({ cameraPreset: 'kickMoment', shooterKickPhase: 'kicking', cinematicPhase: 'kick', particleType: 'grass', particleOrigin: [0, 0.1, 9] });
      playRef.current('kick-medium');
      setSpeedLines(true);
      ballStore.active = true;
      flightStart = 0;
      rafId = requestAnimationFrame(animateBall);
    });

    // 950ms: keeper dives
    at(950, () => {
      onSceneRef.current?.({ cameraPreset: 'ballFlight', shooterKickPhase: 'done', keeperDive, cinematicPhase: 'flight', particleType: 'diveDust', particleOrigin: [0, 0.2, 0.5] });
    });

    // 1800ms: impact
    at(1800, () => {
      setSpeedLines(false);
      setImpactFlash(true);
      onSceneRef.current?.({ cameraPreset: 'impactSide', cinematicPhase: 'result' });
      if (sr === 'goal') {
        playRef.current('goal-net');
        playRef.current('crowd-roar');
        onSceneRef.current?.({ particleType: 'confetti', screenShake: true, cameraPreset: 'goalCelebration', netImpactPoint: { x: target.x, y: target.y }, netImpactForce: 0.6 });
      } else {
        playRef.current('save-catch');
        onSceneRef.current?.({ cameraPreset: 'saveCelebration' });
      }
    });

    // 2300ms: dramatic text
    at(2300, () => {
      setImpactFlash(false);
      setShowDramatic(true);
    });

    // 4500ms: hide dramatic
    at(4500, () => {
      setShowDramatic(false);
    });

    // 5000ms: done — lascia tempo alla voce di finire
    at(5000, () => {
      ballStore.active = false;
      onSceneRef.current?.({ netImpactPoint: null });
      onCompleteRef.current();
    });

    return () => {
      timers.forEach(clearTimeout);
      if (rafId) cancelAnimationFrame(rafId);
      ballStore.active = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={styles.container}>
      <SpeedLines visible={speedLines} intensity="normal" />
      <ImpactFlash visible={impactFlash} color={resultColor} />
      <DramaticOverlay text={dramaticLine} visible={showDramatic} color={resultColor} />
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 20,
    pointerEvents: 'none',
  },
};
