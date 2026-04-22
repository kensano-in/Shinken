import { notFound } from 'next/navigation';
import NavBar from '@/components/platform/NavBar';
import { getGameById } from '@/lib/games';
import TicTacToeGame from '@/components/games/TicTacToeGame';
import SnakeGame from '@/components/games/SnakeGame';
import ReactionGame from '@/components/games/ReactionGame';
import MemoryPatternGame from '@/components/games/MemoryPatternGame';
import RockPaperScissorsGame from '@/components/games/RockPaperScissorsGame';
import MiniBattleGame from '@/components/games/MiniBattleGame';

const registry = {
  'tic-tac-toe': TicTacToeGame,
  snake: SnakeGame,
  reaction: ReactionGame,
  memory: MemoryPatternGame,
  rps: RockPaperScissorsGame,
  'mini-battle': MiniBattleGame,
};

export default function GamePage({ params }) {
  const game = getGameById(params.game);
  if (!game) return notFound();
  const Game = registry[params.game];

  return (
    <main className="app-wrap">
      <NavBar />
      <Game />
    </main>
  );
}
