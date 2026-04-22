'use client';

import { useState } from 'react';

export default function MemoryPatternGame() {
  const [pattern] = useState([1, 3, 2, 4]);
  const [input, setInput] = useState([]);
  const done = input.length === pattern.length;
  return (
    <section className="game-shell">
      <h2>Memory Pattern</h2>
      <p>Pattern: {pattern.join(' - ')}</p>
      <div className="row">{[1,2,3,4].map((n) => <button key={n} className="chip" onClick={() => setInput((v) => [...v, n])}>{n}</button>)}</div>
      <p>Your input: {input.join(' - ') || '—'}</p>
      <p>{done ? (JSON.stringify(input) === JSON.stringify(pattern) ? 'Perfect!' : 'Try again') : 'Recreate the pattern'}</p>
    </section>
  );
}
