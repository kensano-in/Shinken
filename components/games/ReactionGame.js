'use client';

import { useState } from 'react';

export default function ReactionGame() {
  const [start, setStart] = useState(null);
  const [ms, setMs] = useState(null);
  return (
    <section className="game-shell">
      <h2>Reaction Speed</h2>
      <button className="chip" onClick={() => { setStart(performance.now()); setMs(null); }}>Start</button>
      <button className="chip" onClick={() => start && setMs(Math.round(performance.now() - start))}>Tap!</button>
      <p>{ms ? `Reaction time: ${ms}ms` : 'Press Start then Tap as fast as you can.'}</p>
    </section>
  );
}
