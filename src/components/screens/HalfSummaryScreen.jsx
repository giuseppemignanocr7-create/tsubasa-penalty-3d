import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PLAYERS } from '../../data/players';
import { isGoal } from '../../game/gameTypes';
import ActionButton from '../ui/ActionButton';
import MangaPanel from '../ui/MangaPanel';
import GlowText from '../ui/GlowText';

export default function HalfSummaryScreen({ scores, round, half, history, currentShooter, onStartSecondHalf, autoAdvance }) {
  const nextShooter = currentShooter === 'holly' ? 'benji' : 'holly';
  const halfShots = history.filter(h => h.round === round && h.half === half);
  const shooterGoals = halfShots.filter(h => isGoal(h.result)).length;

  useEffect(() => {
    if (!autoAdvance) return;
    const t = setTimeout(onStartSecondHalf, 3000);
    return () => clearTimeout(t);
  }, [autoAdvance, onStartSecondHalf]);

  return (
    <div style={styles.container}>
      <div style={styles.backdrop} />
      <motion.div
        style={styles.content}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <GlowText size="clamp(1.5rem, 6vw, 2.2rem)">
          FINE PRIMA METÀ
        </GlowText>

        <MangaPanel variant="gold" style={{ maxWidth: 380, width: '90vw', textAlign: 'center' }}>
          <div style={styles.shooterLine}>
            {PLAYERS[currentShooter].avatar} {PLAYERS[currentShooter].nickname} ha segnato{' '}
            <span style={styles.goalCount}>{shooterGoals}</span> gol su 5 tiri
          </div>

          <div style={styles.divider} />

          <div style={styles.scoreRow}>
            <div style={{ ...styles.scoreBlock, borderColor: PLAYERS.holly.primaryColor }}>
              <span style={styles.scoreAvatar}>{PLAYERS.holly.avatar}</span>
              <span style={{ ...styles.scoreNum, color: PLAYERS.holly.accentColor }}>{scores.holly}</span>
              <span style={styles.scoreName}>HOLLY</span>
            </div>
            <div style={styles.dash}>—</div>
            <div style={{ ...styles.scoreBlock, borderColor: PLAYERS.benji.primaryColor }}>
              <span style={styles.scoreAvatar}>{PLAYERS.benji.avatar}</span>
              <span style={{ ...styles.scoreNum, color: PLAYERS.benji.accentColor }}>{scores.benji}</span>
              <span style={styles.scoreName}>BENJI</span>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.swapNotice}>
            🔄 INVERSIONE RUOLI!
          </div>
          <div style={styles.swapDetail}>
            Ora {PLAYERS[nextShooter].nickname} tira e {PLAYERS[currentShooter].nickname} para
          </div>
        </MangaPanel>

        {autoAdvance ? (
          <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: '0.7rem', color: '#888', marginTop: 8 }}>Continua in 3s...</div>
        ) : (
          <ActionButton onClick={onStartSecondHalf} size="medium">
            INIZIA 2ª METÀ
          </ActionButton>
        )}
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    zIndex: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'auto', padding: 20,
  },
  backdrop: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
  },
  content: {
    position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
  },
  shooterLine: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: 'clamp(0.75rem, 2.5vw, 0.95rem)',
    color: '#ccc',
    lineHeight: 1.5,
  },
  goalCount: {
    fontFamily: "'Bangers', cursive",
    fontSize: '1.4rem',
    color: '#ffd700',
  },
  divider: { height: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 0' },
  scoreRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
  },
  scoreBlock: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '8px 16px', borderRadius: 8, border: '2px solid',
    background: 'rgba(0,0,0,0.3)',
  },
  scoreAvatar: { fontSize: '1.5rem' },
  scoreNum: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 'clamp(1.2rem, 5vw, 2rem)',
  },
  scoreName: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: '0.65rem', color: '#aaa',
  },
  dash: {
    fontFamily: "'Bangers', cursive", fontSize: '2rem', color: '#555',
  },
  swapNotice: {
    fontFamily: "'Bangers', cursive",
    fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
    color: '#ffd700',
    textShadow: '0 0 10px rgba(255,215,0,0.4)',
    marginTop: 4,
  },
  swapDetail: {
    fontFamily: "'Russo One', sans-serif",
    fontSize: '0.75rem', color: '#aaa',
  },
};
