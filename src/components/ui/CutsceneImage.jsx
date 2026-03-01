import React, { useState } from 'react';

/**
 * CutsceneImage — displays anime cutscene images from /public/images/cutscenes/
 * with graceful fallback (hides itself if image doesn't exist).
 *
 * Usage:
 *   <CutsceneImage src="holly_kick.png" position="center" />
 *   <CutsceneImage src="benji_save.png" position="left" opacity={0.8} />
 *
 * To add images:
 *   1. Save Captain Tsubasa screenshots/artwork in /public/images/cutscenes/
 *   2. Reference them by filename: src="filename.png"
 *   3. Supported positions: 'center', 'left', 'right', 'full'
 */
export default function CutsceneImage({
  src,
  position = 'center',
  opacity = 1,
  maxWidth = 320,
  maxHeight = 240,
  borderGlow = '#ffd700',
  style: extraStyle = {},
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  const posStyles = {
    center: { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' },
    left: { left: '5%', top: '50%', transform: 'translateY(-50%)' },
    right: { right: '5%', top: '50%', transform: 'translateY(-50%)' },
    full: { left: 0, top: 0, width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none' },
    topCenter: { left: '50%', top: '10%', transform: 'translateX(-50%)' },
    bottomCenter: { left: '50%', bottom: '15%', transform: 'translateX(-50%)' },
  };

  return (
    <img
      src={`/images/cutscenes/${src}`}
      alt=""
      onError={() => setFailed(true)}
      style={{
        position: 'absolute',
        maxWidth,
        maxHeight,
        objectFit: 'contain',
        opacity,
        borderRadius: 8,
        boxShadow: `0 0 20px ${borderGlow}40, 0 4px 16px rgba(0,0,0,0.5)`,
        border: `2px solid ${borderGlow}30`,
        pointerEvents: 'none',
        zIndex: 15,
        ...posStyles[position],
        ...extraStyle,
      }}
    />
  );
}

/**
 * Image map — predefined cutscene images for each game moment.
 * When you have the actual images, update filenames here.
 * The component gracefully hides if the file doesn't exist.
 */
export const CUTSCENE_IMAGES = {
  // Menu screen
  menu_logo: 'menu_logo.png',
  menu_holly: 'menu_holly.png',
  menu_benji: 'menu_benji.png',

  // Pre-shot
  holly_prepares: 'holly_prepares.png',
  benji_prepares: 'benji_prepares.png',

  // Results
  holly_kick: 'holly_kick.png',
  benji_save: 'benji_save.png',
  benji_dive: 'benji_dive.png',
  goal_celebration: 'goal_celebration.png',
  save_celebration: 'save_celebration.png',
  crossbar_hit: 'crossbar_hit.png',

  // Special
  tiger_shot: 'tiger_shot.png',
  miracle_save: 'miracle_save.png',

  // Game over
  trophy: 'trophy.png',
  team_celebration: 'team_celebration.png',
};
