import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useGameState } from './game/GameProvider';
import { useGameActions } from './game/useGameActions';
import { useOnline } from './game/OnlineProvider';
import { PHASES } from './game/gameTypes';
import { PENALTIES_PER_PLAYER } from './data/roundConfig';
import { getRandomZone } from './data/zones';
import { resetBallStore } from './three/ballStore';
import Scene3D from './three/Scene3D';
import ScreenShake from './components/effects/ScreenShake';
import Scoreboard3D from './components/hud/Scoreboard3D';
import ShotHistoryBar from './components/hud/ShotHistoryBar';
import MenuScreen from './components/screens/MenuScreen';
import TrainingSetupScreen from './components/screens/TrainingSetupScreen';
import OnlineLobbyScreen from './components/screens/OnlineLobbyScreen';
import PassDeviceScreen from './components/screens/PassDeviceScreen';
import ShooterComboScreen from './components/screens/ShooterComboScreen';
import KeeperComboScreen from './components/screens/KeeperComboScreen';
import AnimationScreen from './components/screens/AnimationScreen';
import ResultScreen from './components/screens/ResultScreen';
import GameOverScreen from './components/screens/GameOverScreen';
import PersistentMenu from './components/hud/PersistentMenu';
import CommentaryOverlay from './components/hud/CommentaryOverlay';
import { useCommentary } from './hooks/useCommentary';

const SCENE_DEFAULTS = {
  cameraPreset: 'menu',
  ballPosition: [0, 0.22, 9],
  ballVisible: true,
  ballGlowing: false,
  keeperDive: null,
  shooterKickPhase: 'idle',
  particleType: 'none',
  particleOrigin: [0, 1, 0],
  bloomIntensity: 'normal',
  cinematicPhase: 'idle',
  netImpactPoint: null,
  netImpactForce: 0.5,
};

export default function App() {
  const state = useGameState();
  const actions = useGameActions();
  const online = useOnline();
  const [menuScreen, setMenuScreen] = useState('main');
  const [sceneProps, setSceneProps] = useState(SCENE_DEFAULTS);
  const botTimerRef = useRef(null);
  const commentary = useCommentary();
  const prevPhaseRef = useRef(null);
  const consecutiveGoalsRef = useRef(0);

  const updateScene = useCallback((u) => setSceneProps(prev => ({ ...prev, ...u })), []);
  const resetScene = useCallback(() => { resetBallStore(); setSceneProps({ ...SCENE_DEFAULTS, cameraPreset: 'wide' }); }, []);

  // ---- Bot auto-play for training mode ----
  useEffect(() => {
    if (state.mode !== 'training') return;
    const { phase, humanRole } = state;

    // Human is shooter → bot picks keeper zone automatically
    if (humanRole === 'shooter' && phase === PHASES.KEEPER_TURN) {
      botTimerRef.current = setTimeout(() => {
        actions.selectKeepZone(getRandomZone());
      }, 600);
      return () => clearTimeout(botTimerRef.current);
    }

    // Human is keeper → bot picks shooter zone automatically
    if (humanRole === 'keeper' && phase === PHASES.SHOOTER_TURN) {
      botTimerRef.current = setTimeout(() => {
        actions.selectShootZone(getRandomZone());
      }, 600);
      return () => clearTimeout(botTimerRef.current);
    }

    // In training, auto-advance from PASS_DEVICE screens
    if (phase === PHASES.PASS_DEVICE_SHOOTER) {
      botTimerRef.current = setTimeout(() => actions.readyShooter(), 100);
      return () => clearTimeout(botTimerRef.current);
    }
    if (phase === PHASES.PASS_DEVICE_KEEPER) {
      botTimerRef.current = setTimeout(() => actions.readyKeeper(), 100);
      return () => clearTimeout(botTimerRef.current);
    }
  }, [state.phase, state.mode, state.humanRole, actions]);

  // ---- Auto-advance result in training (2s) ----
  useEffect(() => {
    if (state.mode !== 'training' || state.phase !== PHASES.RESULT) return;
    const t = setTimeout(() => { resetScene(); actions.nextShot(); }, 2000);
    return () => clearTimeout(t);
  }, [state.mode, state.phase, actions, resetScene]);

  // ---- Handlers ----
  const handleStartLocal = useCallback(() => { resetScene(); actions.startGame(); setMenuScreen('main'); }, [actions, resetScene]);
  const handleStartTraining = useCallback((role) => { resetScene(); actions.startTraining(role); setMenuScreen('main'); }, [actions, resetScene]);
  const handleReadyShooter = useCallback(() => { updateScene({ cameraPreset: 'shooterPick' }); actions.readyShooter(); }, [actions, updateScene]);
  const handleSelectShootZone = useCallback((zone) => { updateScene({ cameraPreset: 'wide' }); actions.selectShootZone(zone); }, [actions, updateScene]);
  const handleReadyKeeper = useCallback(() => { updateScene({ cameraPreset: 'keeperPick' }); actions.readyKeeper(); }, [actions, updateScene]);
  const handleSelectKeepZone = useCallback((zone) => { updateScene({ cameraPreset: 'wide' }); actions.selectKeepZone(zone); }, [actions, updateScene]);
  const handleAnimDone = useCallback(() => actions.animationComplete(), [actions]);
  const handleNextShot = useCallback(() => { resetScene(); actions.nextShot(); }, [actions, resetScene]);
  const handleReset = useCallback(() => { resetBallStore(); setSceneProps(SCENE_DEFAULTS); setMenuScreen('main'); commentary.stop(); actions.resetGame(); }, [actions, commentary]);
  const handleRestartTraining = useCallback(() => { resetBallStore(); resetScene(); actions.startTraining(state.humanRole); }, [actions, resetScene, state.humanRole]);

  const handleSceneUpdate = useCallback((updates) => {
    updateScene(updates);
  }, [updateScene]);

  // === Commentary triggers based on phase transitions ===
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = state.phase;
    if (prev === state.phase) return;

    const { phase: p, currentShooter: cs, shotResult: sr, penaltyIndex: pi } = state;
    const keeper = cs === 'holly' ? 'benji' : 'holly';
    const penaltyNum = Math.floor(pi / 2) + 1; // 1-based penalty number per player

    // Game just started
    if (prev === PHASES.MENU && (p === PHASES.PASS_DEVICE_SHOOTER || p === PHASES.SHOOTER_TURN)) {
      commentary.matchIntro();
    }

    // Shooter is about to take their turn
    if (p === PHASES.SHOOTER_TURN && prev !== PHASES.SHOOTER_TURN) {
      const scoreDiff = Math.abs(state.scores.holly - state.scores.benji);
      if (state.isSuddenDeath || penaltyNum >= PENALTIES_PER_PLAYER || (penaltyNum >= 3 && scoreDiff <= 1)) {
        setTimeout(() => commentary.tensionMoment(), 500);
      } else {
        setTimeout(() => commentary.preShot(cs), 300);
      }
    }

    // Keeper is about to take their turn
    if (p === PHASES.KEEPER_TURN && prev !== PHASES.KEEPER_TURN) {
      setTimeout(() => commentary.keeperReady(keeper), 300);
    }

    // Shot result came in (entering animation)
    if (p === PHASES.ANIMATING_3D && prev !== PHASES.ANIMATING_3D) {
      setTimeout(() => {
        commentary.shotResult(sr, null);
      }, 1900);

      if (sr === 'goal') {
        consecutiveGoalsRef.current++;
      } else {
        consecutiveGoalsRef.current = 0;
      }
    }

    // Result screen — momentum comments
    if (p === PHASES.RESULT && prev === PHASES.ANIMATING_3D) {
      if (consecutiveGoalsRef.current >= 3) {
        setTimeout(() => commentary.momentumComment(), 800);
      }
    }

    // Game over
    if (p === PHASES.GAME_OVER) {
      setTimeout(() => commentary.matchWin(), 500);
    }
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const { phase, scores, currentShooter, history, mode, penaltyIndex, isSuddenDeath } = state;
  const keeper = currentShooter === 'holly' ? 'benji' : 'holly';
  const isTraining = mode === 'training';
  const showHud = ![PHASES.MENU, PHASES.GAME_OVER, PHASES.TRAINING_SETUP].includes(phase);
  const penaltyNum = Math.floor(penaltyIndex / 2) + 1;

  return (
    <ScreenShake active={state.screenShake}>
      <div className="game-container">
        <Scene3D {...sceneProps} />
        <PersistentMenu onReturnToMenu={handleReset} commentaryEnabled={commentary.enabledRef} onToggleCommentary={commentary.setEnabled} />
        <CommentaryOverlay subscribe={commentary.subscribe} />

        {showHud && (
          <div className="overlay">
            <Scoreboard3D scores={scores} penaltyNum={penaltyNum} currentShooter={currentShooter} isTraining={isTraining} humanRole={state.humanRole} isSuddenDeath={isSuddenDeath} />
            <ShotHistoryBar history={history} currentShooter={currentShooter} />
            {isTraining && <div style={{ position: 'absolute', top: 88, left: '50%', transform: 'translateX(-50%)', fontFamily: "'Russo One', sans-serif", fontSize: '0.65rem', color: '#ffd700', opacity: 0.7, zIndex: 25, pointerEvents: 'none' }}>ALLENAMENTO</div>}
          </div>
        )}

        {/* MENU */}
        {phase === PHASES.MENU && menuScreen === 'main' && (
          <MenuScreen onStart={handleStartLocal} onOnline={() => setMenuScreen('online')} onTraining={() => setMenuScreen('training')} />
        )}
        {phase === PHASES.MENU && menuScreen === 'training' && (
          <TrainingSetupScreen onSelectRole={handleStartTraining} onBack={() => setMenuScreen('main')} />
        )}
        {phase === PHASES.MENU && menuScreen === 'online' && (
          <OnlineLobbyScreen onStartOnline={() => { setMenuScreen('main'); handleStartLocal(); }} onBack={() => setMenuScreen('main')} />
        )}

        {/* PASS DEVICE (local only, skipped in training via useEffect) */}
        {phase === PHASES.PASS_DEVICE_SHOOTER && !isTraining && (
          <PassDeviceScreen targetPlayer={currentShooter} role="shooter" onReady={handleReadyShooter} />
        )}
        {phase === PHASES.PASS_DEVICE_KEEPER && !isTraining && (
          <PassDeviceScreen targetPlayer={keeper} role="keeper" onReady={handleReadyKeeper} />
        )}

        {/* Bot turn overlay in training */}
        {isTraining && ((state.humanRole === 'keeper' && phase === PHASES.SHOOTER_TURN) || (state.humanRole === 'shooter' && phase === PHASES.KEEPER_TURN)) && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ fontFamily: "'Bangers', cursive", fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', color: '#ffd700', textShadow: '0 0 20px rgba(255,215,0,0.5)', animation: 'breathe 1s infinite' }}>
              {state.humanRole === 'keeper' ? '⚽ Bot sta tirando...' : '🧤 Bot para...'}
            </div>
          </div>
        )}

        {/* SHOOTER TURN — pick a zone */}
        {phase === PHASES.SHOOTER_TURN && !(isTraining && state.humanRole === 'keeper') && (
          <ShooterComboScreen onSelect={handleSelectShootZone} />
        )}

        {/* KEEPER TURN — pick a zone */}
        {phase === PHASES.KEEPER_TURN && !(isTraining && state.humanRole === 'shooter') && (
          <KeeperComboScreen onSelect={handleSelectKeepZone} />
        )}

        {phase === PHASES.ANIMATING_3D && (
          <AnimationScreen shotResult={state.shotResult} dramaticLine={state.dramaticLine} shooterZone={state.shooterZone} keeperZone={state.keeperZone} onComplete={handleAnimDone} onSceneUpdate={handleSceneUpdate} />
        )}

        {phase === PHASES.RESULT && (
          <ResultScreen shotResult={state.shotResult} shooterZone={state.shooterZone} keeperZone={state.keeperZone} currentShooter={currentShooter} onNext={handleNextShot} autoAdvance={isTraining} />
        )}

        {phase === PHASES.GAME_OVER && (
          <GameOverScreen scores={scores} history={history} isSuddenDeath={isSuddenDeath} onReset={handleReset} isTraining={isTraining} onRestartTraining={handleRestartTraining} />
        )}
      </div>
    </ScreenShake>
  );
}
