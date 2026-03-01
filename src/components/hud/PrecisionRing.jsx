import React, { useEffect, useCallback, useState } from 'react';
import { useShrinkingRing } from '../../hooks/useShrinkingRing';

export default function PrecisionRing({ shrinkTime = 1500, onConfirm }) {
  const { radius, start, stop } = useShrinkingRing(shrinkTime);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => { start(); }, [start]);

  const handleTap = useCallback(() => {
    const accuracy = Math.abs(radius);
    stop();
    let color, label, emoji;
    if (accuracy <= 5) { color = '#ffd700'; label = 'PERFETTO!'; emoji = '🎯'; }
    else if (accuracy <= 15) { color = '#00cc44'; label = 'BUONO!'; emoji = '👍'; }
    else if (accuracy <= 30) { color = '#ffcc00'; label = 'DISCRETO'; emoji = '😐'; }
    else { color = '#ff4444'; label = 'SCARSO!'; emoji = '😬'; }
    setFeedback({ label, color, emoji });
    setTimeout(() => onConfirm(accuracy), 700);
  }, [radius, stop, onConfirm]);

  const targetSize = 90;
  const ringSize = targetSize + (radius / 100) * 200;
  const isClose = radius < 20;
  const isMedium = radius < 40;
  const ringColor = isClose ? '#ffd700' : isMedium ? '#00cc44' : '#ffffff';

  return (
    <div style={styles.container} onClick={!feedback ? handleTap : undefined} onTouchEnd={!feedback ? (e) => { e.preventDefault(); handleTap(); } : undefined}>
      <div style={styles.vignette} />

      {/* Guide text */}
      {!feedback && (
        <div style={styles.guideText}>
          {isClose ? '🎯 ORA!' : isMedium ? 'Quasi...' : 'Aspetta...'}
        </div>
      )}

      {/* Target zone — golden circle to aim for */}
      <div style={{ ...styles.targetCircle, width: targetSize, height: targetSize }}>
        <div style={styles.crosshairH} />
        <div style={styles.crosshairV} />
        <div style={styles.centerDot} />
      </div>

      {/* Outer ring guides */}
      <div style={{ ...styles.guideRing, width: targetSize + 60, height: targetSize + 60, borderColor: 'rgba(0,204,68,0.25)' }} />
      <div style={{ ...styles.guideRing, width: targetSize + 140, height: targetSize + 140, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Shrinking ring */}
      {!feedback && (
        <div style={{
          ...styles.shrinkingRing,
          width: ringSize, height: ringSize,
          borderColor: ringColor,
          borderWidth: isClose ? 5 : 3,
          boxShadow: `0 0 ${isClose ? 30 : 12}px ${ringColor}${isClose ? '' : '66'}`,
        }} />
      )}

      {/* Feedback */}
      {feedback && (
        <div style={styles.feedbackContainer}>
          <div style={{ fontSize: '3rem', marginBottom: 4 }}>{feedback.emoji}</div>
          <div style={{ ...styles.feedbackLabel, color: feedback.color }}>{feedback.label}</div>
        </div>
      )}

      {!feedback && <div style={styles.tapHint}>TOCCA QUANDO IL CERCHIO È PICCOLO!</div>}
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 30, cursor: 'pointer', userSelect: 'none',
  },
  vignette: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'radial-gradient(circle, transparent 25%, rgba(0,0,0,0.65) 100%)',
    pointerEvents: 'none',
  },
  guideText: {
    position: 'absolute', top: '18%',
    fontFamily: "'Bangers', cursive", fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
    color: '#fff', textShadow: '0 0 10px rgba(0,0,0,0.8)',
    letterSpacing: 2, pointerEvents: 'none', zIndex: 2,
  },
  targetCircle: {
    position: 'absolute', borderRadius: '50%',
    border: '3px solid #ffd700',
    background: 'rgba(255,215,0,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  crosshairH: {
    position: 'absolute', width: '140%', height: 1,
    background: 'rgba(255,215,0,0.35)',
  },
  crosshairV: {
    position: 'absolute', width: 1, height: '140%',
    background: 'rgba(255,215,0,0.35)',
  },
  centerDot: {
    position: 'absolute', width: 8, height: 8, borderRadius: '50%',
    background: '#ffd700',
  },
  guideRing: {
    position: 'absolute', borderRadius: '50%',
    border: '1px dashed', pointerEvents: 'none',
  },
  shrinkingRing: {
    position: 'absolute', borderRadius: '50%',
    borderStyle: 'solid',
    transition: 'border-width 0.1s',
  },
  feedbackContainer: {
    position: 'absolute', display: 'flex', flexDirection: 'column',
    alignItems: 'center', pointerEvents: 'none',
  },
  feedbackLabel: {
    fontFamily: "'Bangers', cursive",
    fontSize: 'clamp(2rem, 8vw, 3.5rem)',
    textShadow: '0 0 20px currentColor',
    letterSpacing: 3,
  },
  tapHint: {
    position: 'absolute', bottom: '12%',
    fontFamily: "'Russo One', sans-serif",
    fontSize: 'clamp(0.65rem, 2vw, 0.85rem)',
    color: 'rgba(255,215,0,0.7)', letterSpacing: 1,
    textShadow: '0 0 8px rgba(0,0,0,0.8)',
    animation: 'breathe 1.5s infinite',
  },
};
