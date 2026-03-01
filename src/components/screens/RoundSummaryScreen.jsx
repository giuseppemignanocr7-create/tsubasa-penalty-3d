import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PLAYERS } from '../../data/players';
import { isGoal } from '../../game/gameTypes';
import ActionButton from '../ui/ActionButton';
import MangaPanel from '../ui/MangaPanel';
import GlowText from '../ui/GlowText';

export default function RoundSummaryScreen({ scores, round, history, roundScores, onStartNextRound, autoAdvance }) {
  const roundShots = history.filter(h => h.round === round);
  const hollyGoals = roundShots.filter(h => h.shooter === 'holly' && isGoal(h.result)).length;
  const benjiGoals = roundShots.filter(h => h.shooter === 'benji' && isGoal(h.result)).length;
  const leader = scores.holly > scores.benji ? 'holly' : scores.benji > scores.holly ? 'benji' : null;

  useEffect(() => {
    if (!autoAdvance) return;
    const t = setTimeout(onStartNextRound, 3000);
    return () => clearTimeout(t);
  }, [autoAdvance, onStartNextRound]);

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
          FINE ROUND {round}
        </GlowText>

        <MangaPanel variant="gold" style={{ maxWidth: 400, width: '90vw', textAlign: 'center' }}>
          <div style={styles.roundResult}>
            Round {round}: Holly {hollyGoals} — {benjiGoals} Benji
          </div>

          <div style={styles.divider} />

          <div style={styles.totalLabel}>PUNTEGGIO TOTALE</div>
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

          {leader && (
            <div style={{ ...styles.leaderLine, color: PLAYERS[leader].accentColor }}>
              {PLAYERS[leader].avatar} {PLAYERS[leader].nickname} IN VANTAGGIO!
            </div>
          )}
          {!leader && <div style={styles.tiedLine}>PARITÀ!</div>}

          {/* Previous rounds */}
          {roundScores.length > 0 && (
            <>
              <div style={styles.divider} />
              <div style={styles.prevLabel}>Round precedenti:</div>
              {roundScores.map((rs, i) => (
                <div key={i} style={styles.prevRound}>
                  R{rs.round}: Holly {rs.holly} — {rs.benji} Benji
                </div>
              ))}
            </>
          )}
        </MangaPanel>

        {autoAdvance ? (
          <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: '0.7rem', color: '#888', marginTop: 8 }}>Prossimo round in 3s...</div>
        ) : (
          <ActionButton onClick={onStartNextRound} size="medium">
            ROUND {round + 1}
          </ActionButton>
        )}
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'auto', padding: 20,
  },
  backdrop: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
  },
  content: {
    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
  },
  roundResult: {
    fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(0.8rem, 3vw, 1.1rem)', color: '#ddd',
  },
  divider: { height: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 0' },
  totalLabel: {
    fontFamily: "'Bangers', cursive", fontSize: '1rem', color: '#ffd700', letterSpacing: 2, marginBottom: 8,
  },
  scoreRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 },
  scoreBlock: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '8px 16px', borderRadius: 8, border: '2px solid', background: 'rgba(0,0,0,0.3)',
  },
  scoreAvatar: { fontSize: '1.5rem' },
  scoreNum: { fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(1.2rem, 5vw, 2rem)' },
  scoreName: { fontFamily: "'Russo One', sans-serif", fontSize: '0.65rem', color: '#aaa' },
  dash: { fontFamily: "'Bangers', cursive", fontSize: '2rem', color: '#555' },
  leaderLine: {
    fontFamily: "'Bangers', cursive", fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
    textShadow: '0 0 10px currentColor', marginTop: 12,
  },
  tiedLine: {
    fontFamily: "'Bangers', cursive", fontSize: '1.3rem', color: '#aaa', marginTop: 12,
  },
  prevLabel: { fontFamily: "'Russo One', sans-serif", fontSize: '0.7rem', color: '#888' },
  prevRound: { fontFamily: "'Russo One', sans-serif", fontSize: '0.65rem', color: '#777', marginTop: 2 },
};
