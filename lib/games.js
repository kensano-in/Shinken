export const GAME_CATALOG = [
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', genre: 'Strategy', modes: ['single', 'multiplayer', 'bot'], skill: 'mind' },
  { id: 'snake', name: 'Snake', genre: 'Arcade', modes: ['single'], skill: 'speed' },
  { id: 'reaction', name: 'Reaction Speed', genre: 'Reflex', modes: ['single', '2p-local'], skill: 'reaction' },
  { id: 'memory', name: 'Memory Pattern', genre: 'Puzzle', modes: ['single', 'adaptive-ai'], skill: 'memory' },
  { id: 'rps', name: 'Rock Paper Scissors', genre: 'Competitive', modes: ['multiplayer', 'bot'], skill: 'mixup' },
  { id: 'mini-battle', name: 'Mini Battle', genre: 'Arena', modes: ['2p-local', 'multiplayer', 'bot'], skill: 'timing' },
];

export function getGameById(gameId) {
  return GAME_CATALOG.find((game) => game.id === gameId);
}
