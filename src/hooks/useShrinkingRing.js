import { useState, useRef, useCallback, useEffect } from 'react';

export function useShrinkingRing(duration = 1500) {
  const [radius, setRadius] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(0);
  const radiusRef = useRef(100);

  const start = useCallback(() => {
    radiusRef.current = 100;
    setRadius(100);
    startTimeRef.current = performance.now();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    return Math.abs(radiusRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const r = 100 * (1 - progress);
      radiusRef.current = Math.max(0, r);
      setRadius(Math.max(0, r));
      if (progress >= 1) {
        setIsRunning(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isRunning, duration]);

  return { radius, isRunning, start, stop };
}
