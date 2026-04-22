import NavBar from '@/components/platform/NavBar';
import GameCard from '@/components/platform/GameCard';
import { GAME_CATALOG } from '@/lib/games';

export default function Home() {
  return (
    <main className="app-wrap">
      <NavBar />
      <section className="hero">
        <p className="eyebrow">Instant play • Real-time multiplayer • AI rivals</p>
        <h1>Fun Games Universe</h1>
        <p>Zero-friction web gaming with matchmaking, ELO progression, adaptive bots, and scalable real-time architecture.</p>
      </section>
      <section className="grid">
        {GAME_CATALOG.map((game) => <GameCard key={game.id} game={game} />)}
      </section>
    </main>
  );
}
