import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnline } from '../../game/OnlineProvider';
import ActionButton from '../ui/ActionButton';
import MangaPanel from '../ui/MangaPanel';
import GlowText from '../ui/GlowText';

export default function OnlineLobbyScreen({ onStartOnline, onBack }) {
  const { mode, role, roomCode, connected, peerError, hostGame, joinGame, goLocal } = useOnline();
  const [joinCode, setJoinCode] = useState('');
  const [screen, setScreen] = useState('choice'); // 'choice' | 'host' | 'join'

  const handleHost = () => {
    hostGame();
    setScreen('host');
  };

  const handleJoin = () => {
    if (joinCode.length >= 4) {
      joinGame(joinCode);
      setScreen('join');
    }
  };

  const handleBack = () => {
    goLocal();
    onBack();
  };

  if (connected) {
    return (
      <div style={styles.container}>
        <div style={styles.backdrop} />
        <motion.div
          style={styles.content}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlowText size="clamp(1.5rem, 6vw, 2.2rem)" color="#00ff88">
            CONNESSO!
          </GlowText>
          <MangaPanel variant="gold" style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={styles.connectedInfo}>
              <div style={styles.roleText}>
                Sei: {role === 'host' ? '⚡ HOLLY (Host)' : '🧤 BENJI (Guest)'}
              </div>
              <div style={styles.roomInfo}>Stanza: <span style={styles.codeDisplay}>{roomCode}</span></div>
              <div style={styles.readyText}>Entrambi i giocatori connessi!</div>
            </div>
          </MangaPanel>
          <ActionButton onClick={onStartOnline}>INIZIA PARTITA ONLINE</ActionButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backdrop} />
      <motion.div
        style={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlowText size="clamp(1.5rem, 6vw, 2.2rem)">GIOCO ONLINE</GlowText>

        {screen === 'choice' && (
          <MangaPanel style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={styles.choiceText}>Ogni giocatore usa il proprio dispositivo!</div>
            <div style={styles.buttonCol}>
              <ActionButton onClick={handleHost} color="#1a4fd4" size="medium">
                CREA STANZA (Holly)
              </ActionButton>
              <div style={styles.orText}>oppure</div>
              <div style={styles.joinRow}>
                <input
                  style={styles.codeInput}
                  placeholder="CODICE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
                  maxLength={5}
                />
                <ActionButton
                  onClick={handleJoin}
                  color="#d42020"
                  size="small"
                  disabled={joinCode.length < 4}
                >
                  UNISCITI (Benji)
                </ActionButton>
              </div>
            </div>
          </MangaPanel>
        )}

        {screen === 'host' && (
          <MangaPanel variant="gold" style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={styles.waitingText}>In attesa dell'avversario...</div>
            <div style={styles.codeLabel}>Codice stanza:</div>
            <div style={styles.codeDisplay}>{roomCode || '...'}</div>
            <div style={styles.shareText}>Condividi questo codice con il tuo avversario!</div>
            {peerError && <div style={styles.errorText}>{peerError}</div>}
            <motion.div
              style={styles.spinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              ⚽
            </motion.div>
          </MangaPanel>
        )}

        {screen === 'join' && (
          <MangaPanel style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={styles.waitingText}>Connessione in corso...</div>
            <div style={styles.codeLabel}>Stanza: {roomCode}</div>
            {peerError && <div style={styles.errorText}>{peerError}</div>}
            <motion.div
              style={styles.spinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              ⚽
            </motion.div>
          </MangaPanel>
        )}

        <ActionButton onClick={handleBack} color="#555" size="small">
          INDIETRO
        </ActionButton>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
  },
  content: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 20,
  },
  choiceText: {
    fontFamily: "'Russo One', sans-serif", fontSize: '0.85rem', color: '#aaa',
    marginBottom: 16,
  },
  buttonCol: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  orText: {
    fontFamily: "'Russo One', sans-serif", fontSize: '0.8rem', color: '#666',
  },
  joinRow: {
    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
  },
  codeInput: {
    fontFamily: "'Press Start 2P', monospace", fontSize: '1.2rem', textAlign: 'center',
    width: 140, padding: '10px 12px', background: 'rgba(255,255,255,0.1)',
    border: '2px solid #555', borderRadius: 8, color: '#fff', outline: 'none',
    letterSpacing: 4,
  },
  waitingText: {
    fontFamily: "'Bangers', cursive", fontSize: '1.3rem', color: '#ffd700',
    marginBottom: 12,
  },
  codeLabel: {
    fontFamily: "'Russo One', sans-serif", fontSize: '0.8rem', color: '#aaa', marginBottom: 4,
  },
  codeDisplay: {
    fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
    color: '#ffd700', letterSpacing: 6, textShadow: '0 0 15px rgba(255,215,0,0.4)',
    margin: '8px 0',
  },
  shareText: {
    fontFamily: "'Russo One', sans-serif", fontSize: '0.7rem', color: '#888', marginTop: 8,
  },
  errorText: {
    fontFamily: "'Russo One', sans-serif", fontSize: '0.75rem', color: '#ff4444',
    marginTop: 8,
  },
  spinner: { fontSize: '2rem', marginTop: 12 },
  connectedInfo: {
    display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0',
  },
  roleText: {
    fontFamily: "'Bangers', cursive", fontSize: '1.4rem', color: '#fff',
  },
  roomInfo: {
    fontFamily: "'Russo One', sans-serif", fontSize: '0.8rem', color: '#aaa',
  },
  readyText: {
    fontFamily: "'Bangers', cursive", fontSize: '1.1rem', color: '#00ff88',
    textShadow: '0 0 10px rgba(0,255,136,0.4)',
  },
};
