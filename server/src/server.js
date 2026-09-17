import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './GameManager.js';
import { globalMetrics } from './MetricsService.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static client build if available
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const gameManager = new GameManager(io);

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/stats', (req, res) => {
  res.json(globalMetrics.getGlobalStats());
});

// Real-time Socket.IO Handlers
io.on('connection', (socket) => {
  const stats = globalMetrics.userConnected();
  io.emit('global_stats_update', stats);

  socket.on('get_global_stats', () => {
    socket.emit('global_stats_update', globalMetrics.getGlobalStats());
  });

  socket.on('create_room', ({ hostName, avatar }) => {
    const room = gameManager.createRoom(socket.id, hostName, avatar);
    socket.join(room.code);
    socket.emit('room_created', { room: gameManager.getPublicRoom(room), playerId: socket.id });
    io.emit('global_stats_update', globalMetrics.getGlobalStats());
  });

  socket.on('join_room', ({ roomCode, playerName, avatar }) => {
    const result = gameManager.joinRoom(roomCode, socket.id, playerName, avatar);
    if (result.error) {
      socket.emit('error_message', { message: result.error });
      return;
    }
    socket.join(roomCode.toUpperCase());
    socket.emit('room_joined', { room: gameManager.getPublicRoom(result.room), playerId: socket.id });
    io.to(roomCode.toUpperCase()).emit('room_state_update', { room: gameManager.getPublicRoom(result.room) });
  });

  socket.on('toggle_ready', ({ roomCode }) => {
    const room = gameManager.toggleReady(roomCode, socket.id);
    if (room) {
      io.to(roomCode).emit('room_state_update', { room: gameManager.getPublicRoom(room) });
    }
  });

  socket.on('update_settings', ({ roomCode, settings }) => {
    const room = gameManager.updateSettings(roomCode, settings);
    if (room) {
      io.to(roomCode).emit('room_state_update', { room: gameManager.getPublicRoom(room) });
    }
  });

  socket.on('add_bot', ({ roomCode }) => {
    const room = gameManager.addBot(roomCode);
    if (room) {
      io.to(roomCode).emit('room_state_update', { room: gameManager.getPublicRoom(room) });
    }
  });

  socket.on('remove_bot', ({ roomCode, botId }) => {
    const room = gameManager.removeBot(roomCode, botId);
    if (room) {
      io.to(roomCode).emit('room_state_update', { room: gameManager.getPublicRoom(room) });
    }
  });

  socket.on('start_game', ({ roomCode }) => {
    const room = gameManager.startGame(roomCode);
    if (room) {
      io.to(roomCode).emit('room_state_update', { room: gameManager.getPublicRoom(room) });
    }
  });

  socket.on('save_draft', ({ roomCode, answers }) => {
    gameManager.updatePlayerDraft(roomCode, socket.id, answers);
  });

  socket.on('trigger_panic', ({ roomCode, answers }) => {
    const result = gameManager.triggerPanicFinish(roomCode, socket.id, answers);
    if (result.error) {
      socket.emit('error_message', { message: result.error });
    }
  });

  socket.on('overrule_answer', ({ roomCode, playerId, categoryId, isValid }) => {
    gameManager.overruleAnswer(roomCode, { playerId, categoryId, isValid });
  });

  socket.on('confirm_scores', ({ roomCode }) => {
    gameManager.confirmAndShowLeaderboard(roomCode);
  });

  socket.on('next_round', ({ roomCode }) => {
    gameManager.startNextRound(roomCode);
  });

  socket.on('reset_game', ({ roomCode }) => {
    gameManager.resetToLobby(roomCode);
  });

  socket.on('send_chat', ({ roomCode, senderName, avatar, message }) => {
    io.to(roomCode).emit('chat_received', {
      senderName,
      avatar,
      message,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    const leaveResult = gameManager.leaveRoom(socket.id);
    if (leaveResult && !leaveResult.roomDeleted) {
      io.to(leaveResult.code).emit('player_left', {
        leavingPlayer: leaveResult.leavingPlayer,
        room: leaveResult.room
      });
    }
    const updatedStats = globalMetrics.userDisconnected();
    io.emit('global_stats_update', updatedStats);
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🎮 GPMP Real-Time Multiplayer Server running on port ${PORT}`);
});
