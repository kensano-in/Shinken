import Link from 'next/link';

export default function GameCard({ game }) {
  return (
    <article className="game-card">
      <h3>{game.name}</h3>
      <p>{game.genre} • {game.skill}</p>
      <small>{game.modes.join(' · ')}</small>
      <Link className="play-btn" href={`/play/${game.id}`}>Play now</Link>
    </article>
  );
}
