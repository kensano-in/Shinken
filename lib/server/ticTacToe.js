export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function evaluateBoard(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return { winner: board[a], line: [a, b, c] };
  }
  if (board.every(Boolean)) return { winner: 'draw', line: [] };
  return null;
}

export function validateMove({ board, index, player, turn }) {
  if (!Array.isArray(board) || board.length !== 9) return { ok: false, reason: 'INVALID_BOARD' };
  if (!["X", "O"].includes(player)) return { ok: false, reason: 'INVALID_PLAYER' };
  if (player !== turn) return { ok: false, reason: 'NOT_YOUR_TURN' };
  if (index < 0 || index > 8 || board[index]) return { ok: false, reason: 'ILLEGAL_MOVE' };

  const next = [...board];
  next[index] = player;
  return { ok: true, next, result: evaluateBoard(next), nextTurn: player === 'X' ? 'O' : 'X' };
}
