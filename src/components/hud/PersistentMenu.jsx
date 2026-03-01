import React, { useState, useCallback } from 'react';

export default function PersistentMenu({ onReturnToMenu, onSettings, onQuit, commentaryEnabled, onToggleCommentary }) {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(80);
  const [quality, setQuality] = useState('high');
  const [commentaryOn, setCommentaryOn] = useState(true);

  const toggle = useCallback(() => {
    setOpen(prev => !prev);
    setShowSettings(false);
  }, []);

  const handleReturn = useCallback(() => {
    setOpen(false);
    setShowSettings(false);
    if (onReturnToMenu) onReturnToMenu();
  }, [onReturnToMenu]);

  const handleSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleBackFromSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const handleQuit = useCallback(() => {
    setOpen(false);
    if (onQuit) onQuit();
  }, [onQuit]);

  return (
    <>
      {/* Hamburger button — always visible */}
      <button onClick={toggle} style={styles.hamburger} aria-label="Menu">
        <span style={{ ...styles.bar, transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
        <span style={{ ...styles.bar, opacity: open ? 0 : 1 }} />
        <span style={{ ...styles.bar, transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
      </button>

      {/* Overlay backdrop */}
      {open && <div style={styles.backdrop} onClick={toggle} />}

      {/* Menu panel */}
      {open && (
        <div style={styles.panel}>
          {!showSettings ? (
            <>
              <div style={styles.title}>MENU</div>
              <button style={styles.menuBtn} onClick={handleReturn}>
                <span style={styles.icon}>🏠</span> Torna al Menu
              </button>
              <button style={styles.menuBtn} onClick={handleSettings}>
                <span style={styles.icon}>⚙️</span> Impostazioni
              </button>
              <button style={{ ...styles.menuBtn, ...styles.quitBtn }} onClick={handleQuit}>
                <span style={styles.icon}>🚪</span> Esci
              </button>
              <button style={styles.closeBtn} onClick={toggle}>
                Chiudi
              </button>
            </>
          ) : (
            <>
              <div style={styles.title}>IMPOSTAZIONI</div>

              <div style={styles.settingRow}>
                <label style={styles.label}>Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  style={styles.slider}
                />
                <span style={styles.valueText}>{volume}%</span>
              </div>

              <div style={styles.settingRow}>
                <label style={styles.label}>Qualità Grafica</label>
                <div style={styles.qualityRow}>
                  {['low', 'medium', 'high'].map((q) => (
                    <button
                      key={q}
                      style={{
                        ...styles.qualityBtn,
                        ...(quality === q ? styles.qualityBtnActive : {}),
                      }}
                      onClick={() => setQuality(q)}
                    >
                      {q === 'low' ? 'Bassa' : q === 'medium' ? 'Media' : 'Alta'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.settingRow}>
                <label style={styles.label}>Telecronaca</label>
                <div style={styles.qualityRow}>
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      style={{
                        ...styles.qualityBtn,
                        ...(commentaryOn === v ? styles.qualityBtnActive : {}),
                      }}
                      onClick={() => {
                        setCommentaryOn(v);
                        if (onToggleCommentary) onToggleCommentary(v);
                      }}
                    >
                      {v ? 'ON' : 'OFF'}
                    </button>
                  ))}
                </div>
              </div>

              <button style={styles.closeBtn} onClick={handleBackFromSettings}>
                ← Indietro
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  hamburger: {
    position: 'fixed',
    top: 12,
    right: 12,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    width: 40,
    height: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'background 0.2s',
  },
  bar: {
    display: 'block',
    width: 20,
    height: 2,
    background: '#fff',
    borderRadius: 2,
    transition: 'all 0.25s ease',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.55)',
    zIndex: 9998,
    backdropFilter: 'blur(3px)',
  },
  panel: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    background: 'linear-gradient(145deg, rgba(10,16,40,0.97), rgba(5,8,25,0.97))',
    border: '1px solid rgba(255,215,0,0.25)',
    borderRadius: 16,
    padding: '28px 32px',
    minWidth: 280,
    maxWidth: 340,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(255,215,0,0.08)',
    fontFamily: "'Russo One', 'Segoe UI', sans-serif",
  },
  title: {
    fontSize: '1.1rem',
    color: '#ffd700',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 8,
    textShadow: '0 0 10px rgba(255,215,0,0.3)',
  },
  menuBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '12px 16px',
    color: '#ddd',
    fontSize: '0.85rem',
    fontFamily: "'Russo One', 'Segoe UI', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  quitBtn: {
    borderColor: 'rgba(255,60,60,0.25)',
    color: '#ff6666',
  },
  closeBtn: {
    marginTop: 6,
    background: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '8px 16px',
    color: '#888',
    fontSize: '0.75rem',
    fontFamily: "'Russo One', 'Segoe UI', sans-serif",
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'color 0.2s',
  },
  icon: {
    fontSize: '1rem',
  },
  settingRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '8px 0',
  },
  label: {
    color: '#aaa',
    fontSize: '0.75rem',
    letterSpacing: 1,
  },
  slider: {
    width: '100%',
    accentColor: '#ffd700',
    cursor: 'pointer',
  },
  valueText: {
    color: '#ffd700',
    fontSize: '0.7rem',
    textAlign: 'right',
  },
  qualityRow: {
    display: 'flex',
    gap: 6,
  },
  qualityBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: '8px 0',
    color: '#888',
    fontSize: '0.7rem',
    fontFamily: "'Russo One', 'Segoe UI', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  qualityBtnActive: {
    background: 'rgba(255,215,0,0.15)',
    borderColor: 'rgba(255,215,0,0.5)',
    color: '#ffd700',
  },
};
