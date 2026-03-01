export const THEME = {
  colors: {
    bgPrimary: '#0a0a1a',
    bgSecondary: '#1a0a2e',
    bgTertiary: '#0a1a3e',
    panelBg: 'rgba(26, 26, 46, 0.92)',
    holly: { primary: '#1a4fd4', accent: '#ffd700', glow: 'rgba(26, 79, 212, 0.3)' },
    benji: { primary: '#d42020', accent: '#ff6b00', glow: 'rgba(212, 32, 32, 0.3)' },
    result: { goal: '#ffd700', save: '#00ff88', miss: '#ff4444', post: '#ff8800', crossbar: '#ff6600' },
    gold: '#ffd700',
    textPrimary: '#ffffff',
    textSecondary: '#aaaaaa',
    textMuted: '#666666',
    field: { dark: '#0d3d0d', light: '#1a5e1a' },
  },
  fonts: {
    display: "'Bangers', cursive",
    mono: "'Press Start 2P', monospace",
    heading: "'Russo One', sans-serif",
  },
};

export const getPlayerColor = (playerId) => THEME.colors[playerId] || THEME.colors.holly;

export const getResultColor = (result) => {
  switch (result) {
    case 'goal': return THEME.colors.result.goal;
    case 'save': case 'keeper_tip': return THEME.colors.result.save;
    case 'post': return THEME.colors.result.post;
    case 'crossbar': return THEME.colors.result.crossbar;
    default: return THEME.colors.result.miss;
  }
};
