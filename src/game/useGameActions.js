import { useCallback } from 'react';
import { useGameDispatch } from './GameProvider';
import { ACTIONS } from './gameTypes';

export function useGameActions() {
  const dispatch = useGameDispatch();

  const startGame = useCallback(() => dispatch({ type: ACTIONS.START_GAME }), [dispatch]);
  const startTraining = useCallback((role) => dispatch({ type: ACTIONS.START_TRAINING, payload: role }), [dispatch]);
  const readyShooter = useCallback(() => dispatch({ type: ACTIONS.READY_SHOOTER }), [dispatch]);
  const selectShootZone = useCallback((zone) => dispatch({ type: ACTIONS.SELECT_SHOOT_ZONE, payload: zone }), [dispatch]);
  const readyKeeper = useCallback(() => dispatch({ type: ACTIONS.READY_KEEPER }), [dispatch]);
  const selectKeepZone = useCallback((zone) => dispatch({ type: ACTIONS.SELECT_KEEP_ZONE, payload: zone }), [dispatch]);
  const animationComplete = useCallback(() => dispatch({ type: ACTIONS.ANIMATION_COMPLETE }), [dispatch]);
  const nextShot = useCallback(() => dispatch({ type: ACTIONS.NEXT_SHOT }), [dispatch]);
  const resetGame = useCallback(() => dispatch({ type: ACTIONS.RESET_GAME }), [dispatch]);

  return {
    startGame, startTraining,
    readyShooter, selectShootZone,
    readyKeeper, selectKeepZone,
    animationComplete, nextShot, resetGame,
  };
}
