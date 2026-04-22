# Shinken Fun Games Universe - Production Architecture

## 1) Full architecture diagram (text)

```text
[Web / Mobile Browser]
  ├─ Next.js App Router UI (Home, Play, Lobby, Profile, Leaderboard)
  ├─ Game Runtime Layer (input, rendering, client prediction)
  └─ WebSocket Client (reconnect, ping/pong, dedupe)
              │
              ▼
[Edge/API Layer]
  ├─ REST APIs (/matchmaking/join, /match/start, /game/move, /leaderboard, /profile)
  ├─ Auth Gateway (guest token or user JWT)
  ├─ Rate Limiter (IP + token bucket)
  └─ Anti-Cheat Guard (schema validation + move validation)
              │
              ▼
[Realtime Engine]
  ├─ Socket.io Gateway (rooms, lobby, invites)
  ├─ Match Service (queue, ELO pairing, bot timeout fallback)
  ├─ Session State (Redis pub/sub + state snapshots)
  └─ Game Rules Engine (authoritative server reconciliation)
              │
              ├────────► [Redis] queue/session cache + pub/sub + reconnect state
              └────────► [PostgreSQL] users, ratings, match history, progression

[Observability]
  ├─ metrics: latency, reconnect rate, drop rate
  ├─ logs: match lifecycle, suspicious events
  └─ tracing: matchmaking -> room -> result pipeline
```

## 2) Folder structure

```text
app/
  api/
    game/move/route.js
    leaderboard/route.js
    match/start/route.js
    matchmaking/join/route.js
    profile/route.js
  leaderboard/page.js
  lobby/page.js
  play/[game]/page.js
  profile/page.js
  globals.css
  layout.js
  page.js
backend/
  server.js
components/
  games/
    TicTacToeGame.js
    SnakeGame.js
    ReactionGame.js
    MemoryPatternGame.js
    RockPaperScissorsGame.js
    MiniBattleGame.js
  platform/
    NavBar.js
    GameCard.js
lib/
  games.js
  server/
    ticTacToe.js
    botEngine.js
    matchmaking.js
docs/
  ARCHITECTURE.md
```

## 3) Core API routes

- `POST /api/matchmaking/join` queue player; skill or quick mode; bot fallback after timeout.
- `POST /api/match/start` starts a room and returns deterministic seed.
- `POST /api/game/move` authoritative move validation (`tic-tac-toe` complete).
- `GET /api/leaderboard` global leaderboard payload.
- `GET /api/profile?username=` profile, W/L, XP, achievements, history.

## 4) WebSocket event system

- Client -> Server:
  - `queue_join`
  - `invite_create`
  - `player_move`
  - `sync_request`
  - `presence_ping`
- Server -> Client:
  - `match_start`
  - `sync_state`
  - `move_rejected`
  - `match_end`
  - `player_reconnect`

Dedup key format: `<roomId>:<tick>:<playerId>:<eventType>`.

## 5) Sample game implementation (Tic Tac Toe)

- Client component: `components/games/TicTacToeGame.js`
- Server validation: `lib/server/ticTacToe.js`
- API validation path: `app/api/game/move/route.js`
- Bot decisioning: `lib/server/botEngine.js`

## 6) Matchmaking logic

- Queue key: `gameId + region`
- Quick mode: first available candidate
- Skill mode: pair with rating gap <= 250
- Timeout fallback: bot assignment after 15 sec wait
- Output contract: `{ status: queued|matched, match?: {roomId, players...} }`

## 7) AI bot logic sample

- `chooseTicTacToeMove` supports easy/medium/hard/adaptive
- Behavior tags: aggressive, defensive, strategic, human-like
- Simulated human delay: randomized `delayMs`
- Mistake probability scales with player performance (adaptive)

## 8) UI component structure

- App shell nav: `components/platform/NavBar.js`
- Game discovery cards: `components/platform/GameCard.js`
- Dedicated pages: Home, Play, Lobby, Profile, Leaderboard
- Game modules are isolated components to enable plugin-style expansion

## 9) Scaling strategy

1. **Horizontal WebSocket pods** behind L4 load balancer, sticky by roomId hash.
2. **Redis pub/sub** for cross-pod room events and recovery snapshots.
3. **PostgreSQL read replicas** for profile/leaderboard reads.
4. **CDN edge caching** static assets and game bundles.
5. **Lazy game loading** via route-level split (`/play/[game]`).
6. **Event sourcing** for match states to replay disputes and anti-cheat audits.
7. **Regional matchmaking** first, then broaden radius to reduce queue times.
8. **Backpressure controls** reject duplicate events and cap per-user move frequency.

