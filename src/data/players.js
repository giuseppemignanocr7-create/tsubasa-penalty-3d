export const PLAYERS = {
  holly: {
    id: 'holly',
    name: 'Oliver Hutton',
    nickname: 'Holly',
    team: 'New Team',
    primaryColor: '#1a4fd4',
    accentColor: '#ffd700',
    number: '10',
    avatar: '\u26A1',
    role: 'Attaccante',
    image: 'https://i.imgur.com/8qYXKHx.png',
  },
  benji: {
    id: 'benji',
    name: 'Benji Price',
    nickname: 'Benji',
    team: 'Muppet FC',
    primaryColor: '#d42020',
    accentColor: '#ff6b00',
    number: '1',
    avatar: '\uD83E\uDDE4',
    role: 'Portiere',
    image: 'https://i.imgur.com/3kVm5qL.png',
  },
};

export const getPlayer = (id) => PLAYERS[id];
export const getOpponent = (id) => id === 'holly' ? PLAYERS.benji : PLAYERS.holly;
