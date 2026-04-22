'use client';

import { useState } from 'react';

const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

export default function RockPaperScissorsGame() {
  const [result, setResult] = useState('Choose your move');
  function play(pick) {
    const options = ['rock', 'paper', 'scissors'];
    const bot = options[Math.floor(Math.random() * 3)];
    if (pick === bot) return setResult(`Draw (${pick} vs ${bot})`);
    setResult(beats[pick] === bot ? `Win (${pick} vs ${bot})` : `Lose (${pick} vs ${bot})`);
  }
  return (
    <section className="game-shell">
      <h2>Rock Paper Scissors</h2>
      <div className="row">{['rock', 'paper', 'scissors'].map((s) => <button key={s} className="chip" onClick={() => play(s)}>{s}</button>)}</div>
      <p>{result}</p>
    </section>
  );
}
