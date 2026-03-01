import { useRef, useCallback, useEffect } from 'react';

export function useAnimationSequence() {
  const timersRef = useRef([]);

  const runSequence = useCallback((steps) => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    let accumulated = 0;
    steps.forEach(({ delay, action }) => {
      accumulated += delay;
      const id = setTimeout(action, accumulated);
      timersRef.current.push(id);
    });
  }, []);

  const cancel = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  return { runSequence, cancel };
}
