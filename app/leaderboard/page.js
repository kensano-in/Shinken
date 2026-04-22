'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/platform/NavBar';

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard').then((r) => r.json()).then((d) => setRows(d.global || []));
  }, []);

  return (
    <main className="app-wrap">
      <NavBar />
      <section className="game-shell">
        <h1>Global Leaderboard</h1>
        <ul className="leader-list">
          {rows.map((row) => (
            <li key={row.rank}><strong>#{row.rank}</strong> {row.user} — {row.rating} ELO ({row.wins} wins)</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
