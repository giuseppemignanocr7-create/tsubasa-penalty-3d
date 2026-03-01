import React, { useState, useEffect } from 'react';

/**
 * CommentaryOverlay — shows commentary text as animated subtitles
 * at the bottom of the screen. Subscribes to the commentary hook's
 * text updates via the subscribe callback.
 */
export default function CommentaryOverlay({ subscribe }) {
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!subscribe) return;
    const unsub = subscribe((newText) => {
      if (newText) {
        setText(newText);
        setVisible(true);
      } else {
        setVisible(false);
      }
    });
    return unsub;
  }, [subscribe]);

  if (!visible || !text) return null;

  return (
    <div style={styles.container}>
      <div style={styles.textBox}>
        <span style={styles.icon}>🎙️</span>
        <span style={styles.text}>{text}</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9000,
    pointerEvents: 'none',
    width: '90%',
    maxWidth: 600,
    display: 'flex',
    justifyContent: 'center',
    animation: 'commentaryFadeIn 0.3s ease-out',
  },
  textBox: {
    background: 'linear-gradient(135deg, rgba(5,8,20,0.92), rgba(10,15,35,0.92))',
    border: '1px solid rgba(255,215,0,0.2)',
    borderRadius: 12,
    padding: '10px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.05)',
    backdropFilter: 'blur(6px)',
  },
  icon: {
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  text: {
    fontFamily: "'Russo One', 'Segoe UI', sans-serif",
    fontSize: 'clamp(0.65rem, 2.2vw, 0.85rem)',
    color: '#eee',
    lineHeight: 1.4,
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
  },
};
