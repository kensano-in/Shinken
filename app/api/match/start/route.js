import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/server/matchmaking';

export async function POST(request) {
  const { roomId } = await request.json();
  const room = getRoom(roomId);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  return NextResponse.json({
    roomId,
    gameId: room.gameId,
    players: room.players,
    startedAt: Date.now(),
    seed: Math.floor(Math.random() * 1_000_000),
  });
}
