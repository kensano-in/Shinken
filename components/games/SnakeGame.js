'use client';

import { useEffect, useState } from 'react';

export default function SnakeGame() {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setScore((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return <section className="game-shell"><h2>Snake</h2><p>Session score: {score}</p><p>Leaderboard-ready arcade mode scaffold.</p></section>;
}
