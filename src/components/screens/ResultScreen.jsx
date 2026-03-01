import React from 'react';
import { motion } from 'framer-motion';
import { PLAYERS } from '../../data/players';
import { getZone } from '../../data/zones';
import { isGoal, isSave } from '../../game/gameTypes';
import ActionButton from '../ui/ActionButton';
import MangaPanel from '../ui/MangaPanel';
import { getResultColor } from '../../styles/theme';
import CutsceneImage, { CUTSCENE_IMAGES } from '../ui/CutsceneImage';

const RESULT_LABELS = {
  goal: 'GOL!',
  save: 'PARATA!',
};

export default function ResultScreen({
  shotResult, shooterZone, keeperZone, currentShooter,
  onNext, autoAdvance,
}) {
  const shooter = PLAYERS[currentShooter];
  const keeper = PLAYERS[currentShooter === 'holly' ? 'benji' : 'holly'];
  const color = getResultColor(shotResult);
  const resultLabel = RESULT_LABELS[shotResult] || '?';
  const shootZoneData = getZone(shooterZone);
  const keepZoneData = getZone(keeperZone);
  const sameZone = shooterZone === keeperZone;

  return (
    <div style={styles.container}>
      <div style={styles.backdrop} />
      <motion.div
        style={styles.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isGoal(shotResult) && (
          <CutsceneImage src={CUTSCENE_IMAGES.goal_celebration} position="topCenter" maxWidth={200} maxHeight={120} opacity={0.55} borderGlow="#ffd700" />
        )}
        {isSave(shotResult) && (
          <CutsceneImage src={CUTSCENE_IMAGES.benji_save} position="topCenter" maxWidth={200} maxHeight={120} opacity={0.55} borderGlow="#00ff88" />
        )}

        {/* Result header */}
        <motion.div
          style={{ ...styles.resultLabel, color, textShadow: `0 0 30px ${color}` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {resultLabel}
        </motion.div>

        <MangaPanel style={{ maxWidth: 380, width: '90vw' }}>
          {/* Shooter info */}
          <div style={styles.row}>
            <span style={{ ...styles.avatar, color: shooter.primaryColor }}>{shooter.avatar}</span>
            <div style={styles.infoCol}>
              <div style={styles.infoLabel}>Tiratore: {shooter.nickname}</div>
              <div style={styles.infoDetail}>
                Tiro: {shootZoneData?.label || '?'} {shootZoneData?.icon}
              </div>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Keeper info */}
          <div style={styles.row}>
            <span style={{ ...styles.avatar, color: keeper.primaryColor }}>{keeper.avatar}</span>
            <div style={styles.infoCol}>
              <div style={styles.infoLabel}>Portiere: {keeper.nickname}</div>
              <div style={styles.infoDetail}>
                Tuffo: {keepZoneData?.label || '?'} {keepZoneData?.icon}
              </div>
            </div>
          </div>

          {/* Zone match indicator */}
          <div style={{ textAlign: 'center', marginTop: 6, fontFamily: "'Bangers', cursive", fontSize: '0.9rem', color: sameZone ? '#00ff88' : '#ffd700', letterSpacing: 1 }}>
            {sameZone ? '🧤 STESSA ZONA — PARATO!' : '⚽ ZONE DIVERSE — GOL!'}
          </div>
        </MangaPanel>

        {autoAdvance ? (
          <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: '0.7rem', color: '#888', marginTop: 8 }}>Prossimo tiro in 4s...</div>
        ) : (
          <ActionButton onClick={onNext} size="medium">
            AVANTI
          </ActionButton>
        )}
      </motion.div>
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
  },
  content: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  resultLabel: {
    fontFamily: "'Bangers', cursive",
    fontSize: 'clamp(2.5rem, 10vw, 4rem)',
    letterSpacing: 4,
    textAlign: 'center',
  },
  perfectBadge: {
    fontFamily: "'Bangers', cursive",
    fontSize: 'clamp(1rem, 4vw, 1.5rem)',
    color: '#ff6600',
    textShadow: '0 0 15px rgba(255,102,0,0.5)',
    marginTop: 4,
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '8px 0',
  },
  avatar: {
    fontSize: '2rem',
    lineHeight: 1,
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  infoLabel: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: '0.85rem',
    color: '#fff',
  },
  infoDetail: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: '0.7rem',
    color: '#aaa',
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.1)',
    margin: '4px 0',
  },
};
