import { RESULTS } from './gameTypes';

// Simple penalty logic: same zone = save, different zone = goal
export function computeShotResult(shootZone, keepZone) {
  if (shootZone === keepZone) {
    return { result: RESULTS.SAVE, shootZone, keepZone };
  }
  return { result: RESULTS.GOAL, shootZone, keepZone };
}
