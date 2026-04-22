import { NextResponse } from 'next/server';
import { validateMove } from '@/lib/server/ticTacToe';

export async function POST(request) {
  const body = await request.json();
  const { gameId, payload } = body;

  if (gameId !== 'tic-tac-toe') {
    return NextResponse.json({ accepted: true, note: 'Validation currently implemented for tic-tac-toe' });
  }

  const check = validateMove(payload);
  if (!check.ok) {
    return NextResponse.json({ accepted: false, reason: check.reason }, { status: 422 });
  }

  return NextResponse.json({ accepted: true, state: { board: check.next, turn: check.nextTurn, result: check.result } });
}
