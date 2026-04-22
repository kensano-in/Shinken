# Shinken - Fun Games Universe

Production-oriented web gaming platform built with Next.js + realtime Node gateway patterns.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Implemented now

- Game pages: Tic Tac Toe, Snake, Reaction, Memory Pattern, RPS, Mini Battle
- API routes: matchmaking, match start, move validation, profile, leaderboard
- Matchmaking service with skill/quick queue + bot fallback
- Tic Tac Toe anti-cheat server move validation
- Adaptive bot engine with human-like delays
- Lobby/profile/leaderboard UI pages
- Realtime gateway reference service (`backend/server.js`)

## Architecture

See `docs/ARCHITECTURE.md`.
