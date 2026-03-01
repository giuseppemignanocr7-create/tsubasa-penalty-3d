import { PHASES, ACTIONS, RESULTS, isGoal } from './gameTypes';
import { computeShotResult } from './gameEngine';
import { PENALTIES_PER_PLAYER } from '../data/roundConfig';
import { getRandomLine } from '../data/dramaticLines';

// penaltyIndex is 0-based, tracks total penalties taken (both players combined)
// Holly shoots on even indices (0,2,4,6,8), Benji on odd (1,3,5,7,9)
// After 10 penalties (5 each), if tied → sudden death pairs

export const initialState = {
  phase: PHASES.MENU,
  mode: 'local',
  humanRole: null,
  penaltyIndex: 0,       // total penalties taken so far
  scores: { holly: 0, benji: 0 },
  currentShooter: 'holly',
  shooterZone: null,
  keeperZone: null,
  shotResult: null,
  dramaticLine: '',
  screenShake: false,
  isSuddenDeath: false,
  history: [],
};

function getCurrentShooter(penaltyIndex) {
  return penaltyIndex % 2 === 0 ? 'holly' : 'benji';
}

function getNextPhase(mode, humanRole) {
  if (mode === 'training') {
    return humanRole === 'shooter' ? PHASES.SHOOTER_TURN : PHASES.KEEPER_TURN;
  }
  return PHASES.PASS_DEVICE_SHOOTER;
}

// Check if game is over after this penalty
function checkGameOver(scores, history, penaltyIndex, isSuddenDeath) {
  const totalTaken = penaltyIndex; // penalties completed so far (after adding current)
  const hollyTaken = history.filter(h => h.shooter === 'holly').length;
  const benjiTaken = history.filter(h => h.shooter === 'benji').length;

  // Regular time: need both players to have taken equal shots to compare
  if (!isSuddenDeath) {
    // Check for early win: if one team can't be caught
    if (hollyTaken >= 1 && benjiTaken >= 1 && hollyTaken === benjiTaken) {
      const remaining_holly = PENALTIES_PER_PLAYER - hollyTaken;
      const remaining_benji = PENALTIES_PER_PLAYER - benjiTaken;
      // If one player leads by more than the other can score
      if (scores.holly > scores.benji + remaining_benji) return true;
      if (scores.benji > scores.holly + remaining_holly) return true;
    }
    // Normal end: both took 5
    if (hollyTaken >= PENALTIES_PER_PLAYER && benjiTaken >= PENALTIES_PER_PLAYER) {
      if (scores.holly !== scores.benji) return true;
      // Tied → sudden death continues (don't end game)
      return false;
    }
    return false;
  }

  // Sudden death: check after each PAIR (both have shot same count)
  if (hollyTaken === benjiTaken && hollyTaken > PENALTIES_PER_PLAYER) {
    return scores.holly !== scores.benji;
  }
  // After first of pair in sudden death, check if second can't equalize
  if (hollyTaken > benjiTaken && hollyTaken > PENALTIES_PER_PLAYER) {
    // Holly just shot. If holly scored and benji needs to score to survive
    // We let benji shoot first, only end after both shot
  }
  return false;
}

export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START_GAME:
      return {
        ...initialState,
        mode: 'local',
        phase: PHASES.PASS_DEVICE_SHOOTER,
        currentShooter: 'holly',
        penaltyIndex: 0,
      };

    case ACTIONS.START_TRAINING:
      return {
        ...initialState,
        mode: 'training',
        humanRole: action.payload,
        phase: action.payload === 'shooter' ? PHASES.SHOOTER_TURN : PHASES.KEEPER_TURN,
        currentShooter: 'holly',
        penaltyIndex: 0,
      };

    case ACTIONS.READY_SHOOTER:
      return { ...state, phase: PHASES.SHOOTER_TURN };

    case ACTIONS.SELECT_SHOOT_ZONE:
      return {
        ...state,
        shooterZone: action.payload,
        phase: state.mode === 'training' && state.humanRole === 'shooter'
          ? PHASES.PASS_DEVICE_KEEPER
          : PHASES.PASS_DEVICE_KEEPER,
      };

    case ACTIONS.READY_KEEPER:
      return { ...state, phase: PHASES.KEEPER_TURN };

    case ACTIONS.SELECT_KEEP_ZONE: {
      const keepZone = action.payload;
      const { result } = computeShotResult(state.shooterZone, keepZone);
      const dramaticLine = getRandomLine(result);
      return {
        ...state,
        keeperZone: keepZone,
        shotResult: result,
        dramaticLine,
        screenShake: result === RESULTS.GOAL,
        phase: PHASES.ANIMATING_3D,
      };
    }

    case ACTIONS.ANIMATION_COMPLETE:
      return { ...state, phase: PHASES.RESULT, screenShake: false };

    case ACTIONS.NEXT_SHOT: {
      const shotEntry = {
        penaltyIndex: state.penaltyIndex,
        shooter: state.currentShooter,
        shootZone: state.shooterZone,
        keepZone: state.keeperZone,
        result: state.shotResult,
      };
      const newHistory = [...state.history, shotEntry];
      const newScores = { ...state.scores };
      if (isGoal(state.shotResult)) {
        newScores[state.currentShooter] += 1;
      }

      const nextIndex = state.penaltyIndex + 1;
      const hollyCount = newHistory.filter(h => h.shooter === 'holly').length;
      const benjiCount = newHistory.filter(h => h.shooter === 'benji').length;
      const enterSuddenDeath = !state.isSuddenDeath &&
        hollyCount >= PENALTIES_PER_PLAYER &&
        benjiCount >= PENALTIES_PER_PLAYER &&
        newScores.holly === newScores.benji;

      const isSuddenDeath = state.isSuddenDeath || enterSuddenDeath;

      // Check game over
      if (checkGameOver(newScores, newHistory, nextIndex, isSuddenDeath)) {
        return {
          ...state,
          history: newHistory,
          scores: newScores,
          isSuddenDeath,
          phase: PHASES.GAME_OVER,
          shooterZone: null,
          keeperZone: null,
          shotResult: null,
          screenShake: false,
        };
      }

      const nextShooter = getCurrentShooter(nextIndex);
      return {
        ...state,
        history: newHistory,
        scores: newScores,
        penaltyIndex: nextIndex,
        currentShooter: nextShooter,
        isSuddenDeath,
        shooterZone: null,
        keeperZone: null,
        shotResult: null,
        screenShake: false,
        phase: getNextPhase(state.mode, state.humanRole),
      };
    }

    case ACTIONS.SET_SCREEN_SHAKE:
      return { ...state, screenShake: action.payload };

    case ACTIONS.RESET_GAME:
      return { ...initialState };

    default:
      return state;
  }
}
