# Holly & Benji — Penalty Shootout 3D ⚽

A Captain Tsubasa-inspired 3D penalty shootout game built with React, Three.js, and Framer Motion.

## Features

- **3D Stadium** — Procedurally generated stadium with goal, net, floodlights, stands
- **Skill-based Mechanics** — Power Bar + Precision Ring for shooters, Reflex Bar for keepers
- **7 Shot Outcomes** — Goal, Save, Keeper Tip, Over Bar, Crossbar, Post, Wide
- **12-Phase State Machine** — Complete game flow with pass-device privacy screens
- **Anime Effects** — Speed lines, impact flash, screen shake, dramatic text overlays
- **4 Rounds** — Increasing difficulty with faster bars and tighter timing
- **Online Multiplayer** — P2P via PeerJS (each player on their own device)
- **Procedural Audio** — Web Audio API fallback when no mp3 files are present
- **PWA Ready** — manifest.json included

## Tech Stack

- React 18 + Vite
- Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing
- Framer Motion
- Howler.js (with Web Audio API fallback)
- PeerJS (online multiplayer)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Game Flow

1. **Menu** — Choose Local (2P) or Online mode
2. **Pass Device** — Hand the device to the shooter
3. **Shooter Zone** — Pick where to shoot (3×3 grid)
4. **Power Bar** — Stop the oscillating bar in the green zone
5. **Precision Ring** — Tap when the shrinking ring overlaps the target
6. **Pass Device** — Hand the device to the keeper
7. **Keeper Zone** — Pick where to dive (3×3 grid)
8. **Reflex Bar** — Stop the oscillating bar at center for best reflexes
9. **3D Animation** — Cinematic shot sequence with camera cuts
10. **Result** — Shows outcome with detailed stats
11. **Half/Round Summary** — Score recap, role swap
12. **Game Over** — Full 40-shot history and stats

## Structure

- `src/game/` — State machine, reducer, engine, physics
- `src/three/` — All 3D components (stadium, goal, ball, keeper, shooter, camera, particles)
- `src/components/screens/` — All 12 game phase screens
- `src/components/hud/` — PowerBar, PrecisionRing, ReflexBar, Scoreboard, etc.
- `src/components/effects/` — SpeedLines, ImpactFlash, ScreenShake
- `src/components/ui/` — GoalGrid, MangaPanel, PlayerCard, ActionButton
- `src/hooks/` — useSound, useOscillator, useShrinkingRing, useAnimationSequence
- `src/data/` — Players, zones, dramatic lines, round config

## Build

```bash
npm run build
```

Output in `dist/` folder, ready to deploy.
