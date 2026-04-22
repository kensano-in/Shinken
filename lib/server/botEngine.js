import { WIN_LINES } from './ticTacToe';

function findWinningMove(board, token) {
  for (const [a, b, c] of WIN_LINES) {
    const line = [board[a], board[b], board[c]];
    const empty = [a, b, c].find((idx) => !board[idx]);
    if (empty !== undefined && line.filter((x) => x === token).length === 2 && line.includes(null)) return empty;
  }
  return null;
}

export function chooseTicTacToeMove({ board, bot = 'O', level = 'adaptive', playerPerformance = 0.5 }) {
  const human = bot === 'X' ? 'O' : 'X';
  const empties = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (!empties.length) return null;

  const effectiveMistake = level === 'easy'
    ? 0.45
    : level === 'medium'
      ? 0.22
      : level === 'hard'
        ? 0.08
        : Math.max(0.05, 0.35 - playerPerformance * 0.3);

  const shouldMistake = Math.random() < effectiveMistake;
  if (!shouldMistake) {
    const win = findWinningMove(board, bot);
    if (win !== null) return { index: win, behavior: 'aggressive', delayMs: 350 + Math.floor(Math.random() * 350) };

    const block = findWinningMove(board, human);
    if (block !== null) return { index: block, behavior: 'defensive', delayMs: 400 + Math.floor(Math.random() * 400) };

    if (!board[4]) return { index: 4, behavior: 'strategic', delayMs: 450 + Math.floor(Math.random() * 500) };
  }

  const index = empties[Math.floor(Math.random() * empties.length)];
  return { index, behavior: 'human-like', delayMs: 600 + Math.floor(Math.random() * 900) };
}
