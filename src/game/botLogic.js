import { ZONES, getAdjacentZones } from '../data/zones';

// ── Adaptive AI Memory ──────────────────────────────────────────────
// Tracks human patterns and adapts across the entire session.
// Memory persists as long as the module is loaded (single game session).

const memory = {
  // Human shooting zones: how many times each zone was picked
  humanShootZones: new Array(9).fill(0),
  // Human keeper zones: how many times each zone was picked
  humanKeepZones: new Array(9).fill(0),
  // Last zones to avoid repetition
  lastBotShootZone: -1,
  lastBotKeepZone: -1,
  // Consecutive goals/saves to adjust difficulty
  consecutiveGoals: 0,   // human goals in a row → bot gets harder
  consecutiveSaves: 0,    // human misses in a row → bot gets easier
  totalShots: 0,
};

export function resetBotMemory() {
  memory.humanShootZones.fill(0);
  memory.humanKeepZones.fill(0);
  memory.lastBotShootZone = -1;
  memory.lastBotKeepZone = -1;
  memory.consecutiveGoals = 0;
  memory.consecutiveSaves = 0;
  memory.totalShots = 0;
}

// Record what the human chose (called after each turn)
export function recordHumanShot(zoneId, result) {
  memory.humanShootZones[zoneId] = (memory.humanShootZones[zoneId] || 0) + 1;
  memory.totalShots++;
  if (result === 'goal') {
    memory.consecutiveGoals++;
    memory.consecutiveSaves = 0;
  } else {
    memory.consecutiveSaves++;
    memory.consecutiveGoals = 0;
  }
}

export function recordHumanKeep(zoneId) {
  memory.humanKeepZones[zoneId] = (memory.humanKeepZones[zoneId] || 0) + 1;
}

// ── Helpers ─────────────────────────────────────────────────────────

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Weighted zone pick: zones with higher weight are more likely to be chosen
function weightedPick(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return Math.floor(Math.random() * 9);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

// Difficulty factor: 0 = easy, 1 = hard
function getDifficulty() {
  // Ramp up with consecutive goals, ramp down with saves
  const base = Math.min(memory.totalShots / 20, 0.3); // gradual learning
  const streak = memory.consecutiveGoals * 0.1 - memory.consecutiveSaves * 0.05;
  return Math.max(0, Math.min(1, base + streak));
}

// ── Bot as Keeper (counters human shooting patterns) ────────────────

export function botKeeperTurn() {
  const diff = getDifficulty();
  const hasData = memory.totalShots >= 2;

  let zone;

  if (hasData && Math.random() < 0.4 + diff * 0.35) {
    // SMART: dive toward where the human tends to shoot
    // Weight = frequency of human shooting to each zone
    const weights = memory.humanShootZones.map((count, i) => {
      let w = count + 0.5; // base weight so all zones have some chance
      // Boost adjacent zones of the most-shot zone too
      const adj = getAdjacentZones(i);
      adj.forEach(az => { w += (memory.humanShootZones[az] || 0) * 0.3; });
      // Penalize picking same zone as last time
      if (i === memory.lastBotKeepZone) w *= 0.3;
      return w;
    });
    zone = weightedPick(weights);
  } else {
    // RANDOM: pick any zone (keeps bot unpredictable)
    zone = pickRandom(ZONES).id;
    if (zone === memory.lastBotKeepZone && Math.random() > 0.3) {
      zone = pickRandom(ZONES).id; // re-roll to avoid repeat
    }
  }

  memory.lastBotKeepZone = zone;

  // Reflex quality scales with difficulty
  const reflexMin = 20 + diff * 25;  // 20–45
  const reflexMax = 55 + diff * 25;  // 55–80
  const reflex = rand(reflexMin, reflexMax);

  return { zone, reflex };
}

// ── Bot as Shooter (avoids human keeper patterns) ───────────────────

export function botShooterTurn() {
  const diff = getDifficulty();
  const hasKeepData = memory.humanKeepZones.some(c => c > 0);

  let zone;

  if (hasKeepData && Math.random() < 0.35 + diff * 0.3) {
    // SMART: shoot where the human keeper DOESN'T go
    const maxKeep = Math.max(...memory.humanKeepZones);
    const weights = memory.humanKeepZones.map((count, i) => {
      // Invert: less-guarded zones get higher weight
      let w = (maxKeep - count) + 1;
      // Penalize same zone as last shot
      if (i === memory.lastBotShootZone) w *= 0.3;
      return w;
    });
    zone = weightedPick(weights);
  } else {
    // RANDOM with anti-repeat
    zone = pickRandom(ZONES).id;
    if (zone === memory.lastBotShootZone && Math.random() > 0.3) {
      zone = pickRandom(ZONES).id;
    }
  }

  memory.lastBotShootZone = zone;

  // Power & precision scale with difficulty
  const power = rand(45 + diff * 10, 80 + diff * 5);
  const precision = rand(15 + diff * 20, 60 + diff * 15);

  return { zone, power, precision };
}
