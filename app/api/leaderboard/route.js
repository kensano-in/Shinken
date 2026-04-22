import { NextResponse } from 'next/server';

const board = [
  { rank: 1, user: 'NovaPulse', rating: 1933, wins: 241 },
  { rank: 2, user: 'QuickFang', rating: 1887, wins: 219 },
  { rank: 3, user: 'AIMuse', rating: 1832, wins: 191 },
  { rank: 4, user: 'Guest_9Z', rating: 1798, wins: 160 },
];

export async function GET() {
  return NextResponse.json({ updatedAt: Date.now(), global: board });
}
