'use client';

import { useState } from 'react';
import NavBar from '@/components/platform/NavBar';

export default function LobbyPage() {
  const [status, setStatus] = useState('Ready');

  async function quickMatch() {
    setStatus('Queueing...');
    const res = await fetch('/api/matchmaking/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'tic-tac-toe', playerId: 'guest_web', mode: 'quick', region: 'us-east' }),
    });
    const data = await res.json();
    setStatus(JSON.stringify(data));
  }

  return (
    <main className="app-wrap">
      <NavBar />
      <section className="game-shell">
        <h1>Multiplayer Lobby</h1>
        <p>Public rooms, private invite codes, and skill-based quick matching.</p>
        <button className="play-btn" onClick={quickMatch}>Join quick match</button>
        <pre className="json-box">{status}</pre>
      </section>
    </main>
  );
}
