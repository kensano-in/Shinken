'use client';

import { useMemo, useState } from 'react';
import { chooseTicTacToeMove } from '@/lib/server/botEngine';

const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function winner(board) {
  for (const [a,b,c] of lines) {
    if (board[a] && board[a]===board[b] && board[b]===board[c]) return board[a];
  }
  return board.every(Boolean) ? 'draw' : null;
}

export default function TicTacToeGame() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [mode, setMode] = useState('bot');
  const result = useMemo(() => winner(board), [board]);

  function play(i, player = turn) {
    if (result || board[i]) return;
    const next = [...board];
    next[i] = player;
    setBoard(next);
    setTurn(player === 'X' ? 'O' : 'X');
  }

  function handleClick(i) {
    if (mode === 'local-2p') return play(i);
    if (turn !== 'X') return;
    play(i, 'X');

    setTimeout(() => {
      const move = chooseTicTacToeMove({ board: [...board.slice(0, i), 'X', ...board.slice(i + 1)], bot: 'O', level: 'adaptive', playerPerformance: 0.6 });
      if (move && !winner([...board.slice(0, i), 'X', ...board.slice(i + 1)])) {
        play(move.index, 'O');
      }
    }, 250);
  }

  return (
    <section className="game-shell">
      <h2>Tic Tac Toe</h2>
      <div className="row">
        <button onClick={() => setMode('bot')} className="chip">Single + AI</button>
        <button onClick={() => setMode('local-2p')} className="chip">2 Player Local</button>
        <button onClick={() => { setBoard(Array(9).fill(null)); setTurn('X'); }} className="chip">Reset</button>
      </div>
      <p>{result ? `Result: ${result}` : `Turn: ${turn}`}</p>
      <div className="ttt-grid">
        {board.map((cell, i) => <button key={i} className="ttt-cell" onClick={() => handleClick(i)}>{cell}</button>)}
      </div>
    </section>
  );
}
