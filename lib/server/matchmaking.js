import crypto from 'node:crypto';

const queues = new Map();
const rooms = new Map();

function key({ gameId, region = 'global' }) {
  return `${gameId}:${region}`;
}

function ratingGap(a, b) {
  return Math.abs((a ?? 1200) - (b ?? 1200));
}

export function joinQueue({ gameId, playerId, region, rating = 1200, mode = 'quick', allowBotFallback = true }) {
  const queueKey = key({ gameId, region });
  const q = queues.get(queueKey) ?? [];

  const idx = q.findIndex((candidate) => mode === 'quick' || ratingGap(candidate.rating, rating) <= 250);
  if (idx >= 0) {
    const opponent = q.splice(idx, 1)[0];
    queues.set(queueKey, q);

    const roomId = `room_${crypto.randomUUID().slice(0, 8)}`;
    const match = { roomId, gameId, region, players: [opponent.playerId, playerId], mode, createdAt: Date.now(), bot: false };
    rooms.set(roomId, match);
    return { status: 'matched', match };
  }

  q.push({ gameId, playerId, region, rating, mode, joinedAt: Date.now(), allowBotFallback });
  queues.set(queueKey, q);
  return { status: 'queued', etaSec: 12, queueDepth: q.length };
}

export function botFallback({ gameId, playerId, region }) {
  const roomId = `room_${crypto.randomUUID().slice(0, 8)}`;
  const match = { roomId, gameId, region, players: [playerId, `bot_${gameId}`], mode: 'bot-fallback', createdAt: Date.now(), bot: true };
  rooms.set(roomId, match);
  return { status: 'matched', match };
}

export function getRoom(roomId) {
  return rooms.get(roomId);
}
