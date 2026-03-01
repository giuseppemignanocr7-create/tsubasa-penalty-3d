import React from 'react';
import { motion } from 'framer-motion';
import { PLAYERS } from '../../data/players';
import { isGoal, isSave } from '../../game/gameTypes';
import ActionButton from '../ui/ActionButton';
import MangaPanel from '../ui/MangaPanel';
import GlowText from '../ui/GlowText';
import CutsceneImage, { CUTSCENE_IMAGES } from '../ui/CutsceneImage';

export default function GameOverScreen({ scores, history, isSuddenDeath, onReset, isTraining, onRestartTraining }) {
  const winner = scores.holly > scores.benji ? 'holly' : scores.benji > scores.holly ? 'benji' : null;
  const winnerPlayer = winner ? PLAYERS[winner] : null;

  return (
    <div style={styles.container}>
      <div style={styles.backdrop} />
      <motion.div
        style={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Anime cutscene art */}
        <CutsceneImage src={CUTSCENE_IMAGES.team_celebration} position="topCenter" maxWidth={280} maxHeight={160} opacity={0.6} borderGlow="#ffd700" />

        {/* Winner announcement */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          {winnerPlayer ? (
            <>
              <div style={styles.crownEmoji}>👑</div>
              <GlowText size="clamp(2rem, 8vw, 3.5rem)" color={winnerPlayer.accentColor}>
                {winnerPlayer.nickname.toUpperCase()} VINCE!
              </GlowText>
              {isSuddenDeath && (
                <div style={{ textAlign: 'center', fontFamily: "'Bangers', cursive", fontSize: '1rem', color: '#ff6600', marginTop: 4 }}>⚡ AI CALCI DI RIGORE AD OLTRANZA!</div>
              )}
            </>
          ) : (
            <GlowText size="clamp(2rem, 8vw, 3rem)">PAREGGIO!</GlowText>
          )}
        </motion.div>

        {/* Final score */}
        <div style={styles.finalScore}>
          <div style={{ ...styles.finalScoreNum, color: PLAYERS.holly.accentColor }}>
            {PLAYERS.holly.avatar} {scores.holly}
          </div>
          <div style={styles.dash}>—</div>
          <div style={{ ...styles.finalScoreNum, color: PLAYERS.benji.accentColor }}>
            {scores.benji} {PLAYERS.benji.avatar}
          </div>
        </div>

        {/* Shot history */}
        <MangaPanel style={{ maxWidth: 420, width: '92vw', maxHeight: '40vh', overflowY: 'auto' }}>
          <div style={styles.sectionTitle}>TUTTI I RIGORI ({history.length})</div>
          <div style={styles.shotGrid}>
            {history.map((h, i) => {
              const shooter = PLAYERS[h.shooter];
              const isG = isGoal(h.result);
              return (
                <div
                  key={i}
                  style={{
                    ...styles.shotCell,
                    borderColor: isG ? '#ffd700' : '#00ff88',
                    background: isG ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <span style={styles.shotNum}>#{i + 1}</span>
                  <span style={styles.shotIcon}>{isG ? '⚽' : '🧤'}</span>
                  <span style={{ ...styles.shotShooter, color: shooter.primaryColor }}>
                    {shooter.nickname[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div style={styles.divider} />
          <div style={styles.sectionTitle}>STATISTICHE</div>
          {['holly', 'benji'].map(pid => {
            const shots = history.filter(h => h.shooter === pid);
            const goals = shots.filter(h => isGoal(h.result)).length;
            return (
              <div key={pid} style={styles.statRow}>
                <span style={{ color: PLAYERS[pid].accentColor, fontWeight: 'bold' }}>
                  {PLAYERS[pid].nickname}
                </span>
                <span>: {goals}/{shots.length} gol</span>
              </div>
            );
          })}
        </MangaPanel>

        <div style={styles.buttonRow}>
          {isTraining && (
            <ActionButton onClick={onRestartTraining} color="#00ff88">
              RIPROVA ALLENAMENTO
            </ActionButton>
          )}
          <ActionButton onClick={onReset} color="#ffd700">
            {isTraining ? 'MENÙ' : 'RIVINCITA!'}
          </ActionButton>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'auto', padding: 16,
  },
  backdrop: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
  },
  content: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 16, padding: '10px 0',
  },
  crownEmoji: { textAlign: 'center', fontSize: '3rem', marginBottom: -4 },
  finalScore: {
    display: 'flex', alignItems: 'center', gap: 16,
  },
  finalScoreNum: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
  },
  dash: { fontFamily: "'Bangers', cursive", fontSize: '2rem', color: '#555' },
  sectionTitle: {
    fontFamily: "'Bangers', cursive", fontSize: '1rem', color: '#ffd700',
    letterSpacing: 2, marginBottom: 8, textAlign: 'center',
  },
  roundRow: {
    display: 'flex', justifyContent: 'space-between', padding: '3px 0',
    fontFamily: "'Russo One', sans-serif", fontSize: '0.7rem', color: '#bbb',
  },
  roundLabel: { color: '#888' },
  roundScore: {},
  divider: { height: 1, background: 'rgba(255,255,255,0.08)', margin: '10px 0' },
  shotGrid: {
    display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center',
  },
  shotCell: {
    position: 'relative', width: 42, height: 42, borderRadius: 6,
    border: '1.5px solid', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem',
  },
  shotNum: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '0.3rem', color: '#777',
    position: 'absolute', top: 2, left: 3,
  },
  shotIcon: { fontSize: '0.9rem', lineHeight: 1 },
  shotShooter: {
    fontFamily: "'Russo One', sans-serif", fontSize: '0.45rem', position: 'absolute',
    bottom: 2, right: 3,
  },
  fireBadge: {
    position: 'absolute', top: -4, right: -4, fontSize: '0.6rem',
  },
  statRow: {
    fontFamily: "'Russo One', sans-serif", fontSize: '0.7rem', color: '#bbb',
    textAlign: 'center', marginBottom: 2,
  },
  buttonRow: {
    display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
  },
};
