import { useState, useRef, useCallback, useEffect } from 'react';

export function useOscillator(speed = 1.5) {
  const [value, setValue] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(0);
  const valueRef = useRef(50);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    return valueRef.current;
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const tick = (now) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      // Smooth triangle wave: goes 0→100→0 at controlled speed
      // speed=1.5 means ~1.3s per full cycle (comfortable)
      const period = 2 / speed;
      const phase = (elapsed % period) / period;
      const v = phase < 0.5 ? phase * 2 * 100 : (1 - phase) * 2 * 100;
      valueRef.current = Math.round(v);
      setValue(Math.round(v));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isRunning, speed]);

  return { value, isRunning, start, stop };
}
