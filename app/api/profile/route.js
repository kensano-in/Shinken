import { NextResponse } from 'next/server';

export async function GET(request) {
  const username = request.nextUrl.searchParams.get('username') || 'Guest';
  return NextResponse.json({
    username,
    avatar: '🎮',
    rating: 1240,
    level: 9,
    xp: 2860,
    wins: 44,
    losses: 28,
    dailyRewardReady: true,
    achievements: ['3-win streak', 'first blood', 'speedster'],
    history: [
      { game: 'tic-tac-toe', result: 'win', at: '2026-04-21T09:13:00Z' },
      { game: 'reaction', result: 'loss', at: '2026-04-21T09:02:00Z' },
    ],
  });
}
