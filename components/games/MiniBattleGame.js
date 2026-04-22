'use client';

import { useState } from 'react';

export default function MiniBattleGame() {
  const [hp, setHp] = useState({ you: 100, enemy: 100 });
  return (
    <section className="game-shell">
      <h2>Mini Battle</h2>
      <p>You: {hp.you} HP • Enemy: {hp.enemy} HP</p>
      <div className="row">
        <button className="chip" onClick={() => setHp((v) => ({ ...v, enemy: Math.max(0, v.enemy - 14) }))}>Quick strike</button>
        <button className="chip" onClick={() => setHp((v) => ({ ...v, you: Math.max(0, v.you - 10) }))}>Enemy turn</button>
      </div>
    </section>
  );
}
