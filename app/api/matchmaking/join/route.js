import { NextResponse } from 'next/server';
import { botFallback, joinQueue } from '@/lib/server/matchmaking';

export async function POST(request) {
  const body = await request.json();
  const { gameId, playerId, region = 'us-east', rating = 1200, mode = 'quick', waitedSec = 0 } = body;

  if (!gameId || !playerId) {
    return NextResponse.json({ error: 'gameId and playerId are required' }, { status: 400 });
  }

  const result = joinQueue({ gameId, playerId, region, rating, mode, allowBotFallback: true });

  if (result.status === 'queued' && waitedSec >= 15) {
    return NextResponse.json(botFallback({ gameId, playerId, region }));
  }

  return NextResponse.json(result);
}
