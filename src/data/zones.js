// 5 penalty zones: corners + center
export const ZONES = [
  { id: 0, label: 'Alto SX',   icon: '↖', x: -2.8, y: 2.1, z: 0 },
  { id: 1, label: 'Alto DX',   icon: '↗', x:  2.8, y: 2.1, z: 0 },
  { id: 2, label: 'Centro',    icon: '●', x:  0,   y: 1.2, z: 0 },
  { id: 3, label: 'Basso SX',  icon: '↙', x: -2.5, y: 0.3, z: 0 },
  { id: 4, label: 'Basso DX',  icon: '↘', x:  2.5, y: 0.3, z: 0 },
];

export const ZONE_COUNT = ZONES.length;

export const getZone = (id) => ZONES.find(z => z.id === id);

export const getRandomZone = () => Math.floor(Math.random() * ZONE_COUNT);
