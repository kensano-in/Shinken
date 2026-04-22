/**
 * Standalone realtime gateway for production deployment (Railway/Render/AWS ECS).
 * npm i express socket.io cors
 */
import express from 'express';
import http from 'node:http';
import cors from 'cors';
import { Server } from 'socket.io';
import { validateMove } from '../lib/server/ticTacToe.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const rooms = new Map();

io.on('connection', (socket) => {
  socket.on('queue_join', ({ roomId, playerId }) => {
    socket.join(roomId);
    socket.data.playerId = playerId;
    socket.data.roomId = roomId;
    io.to(roomId).emit('sync_state', { roomId, connected: io.sockets.adapter.rooms.get(roomId)?.size || 1 });
  });

  socket.on('player_move', ({ roomId, payload, eventId }) => {
    const room = rooms.get(roomId) || { board: Array(9).fill(null), turn: 'X', events: new Set() };
    if (room.events.has(eventId)) return;
    room.events.add(eventId);

    const check = validateMove({ ...payload, board: room.board, turn: room.turn });
    if (!check.ok) {
      socket.emit('move_rejected', { reason: check.reason });
      return;
    }

    room.board = check.next;
    room.turn = check.nextTurn;
    rooms.set(roomId, room);
    io.to(roomId).emit('sync_state', { board: room.board, turn: room.turn, result: check.result });

    if (check.result) io.to(roomId).emit('match_end', { result: check.result });
  });

  socket.on('disconnect', () => {
    if (socket.data.roomId) {
      io.to(socket.data.roomId).emit('player_reconnect', { playerId: socket.data.playerId, state: 'offline' });
    }
  });
});

app.get('/health', (_, res) => res.json({ ok: true, service: 'realtime-gateway' }));

const port = process.env.PORT || 4010;
server.listen(port, () => console.log(`Realtime gateway listening on :${port}`));
