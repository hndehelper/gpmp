import { calculateRoundScores, CATEGORIES } from './ScoringEngine.js';
import { getRandomWordForLetter, validateStartingLetter } from './dictionary.js';
import { globalMetrics } from './MetricsService.js';

// Pool of accessible letters for best gameplay experience
const EASY_LETTERS = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W'];

export class GameManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomCode -> Room
    this.roomTimers = new Map(); // roomCode -> NodeJS.Timeout
  }

  getPublicRoom(room) {
    if (!room) return null;
    return {
      code: room.code,
      hostId: room.hostId,
      status: room.status,
      settings: room.settings,
      players: room.players,
      currentRound: room.currentRound,
      currentLetter: room.currentLetter,
      timeRemaining: room.timeRemaining,
      isSuddenDeath: room.isSuddenDeath,
      panicTriggeredBy: room.panicTriggeredBy
    };
  }

  generateRoomCode() {
    let code = '';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(hostSocketId, hostName, avatar = '😎') {
    let code = this.generateRoomCode();
    while (this.rooms.has(code)) {
      code = this.generateRoomCode();
    }

    const hostPlayer = {
      id: hostSocketId,
      name: hostName || 'Host',
      avatar: avatar || '😎',
      isHost: true,
      isReady: true,
      isBot: false,
      totalScore: 0
    };

    const room = {
      code,
      hostId: hostSocketId,
      status: 'LOBBY', // LOBBY, LETTER_SPIN, ROUND_ACTIVE, VERIFICATION, LEADERBOARD, GAME_OVER
      settings: {
        totalRounds: 10,
        roundDuration: 180, // 3 minutes
        suddenDeathDuration: 60 // 60 seconds panic
      },
      players: [hostPlayer],
      currentRound: 0,
      usedLetters: [],
      currentLetter: '',
      timeRemaining: 180,
      isSuddenDeath: false,
      panicTriggeredBy: null,
      submittedAnswers: {}, // playerId -> { girlName, boyName, ... }
      currentRoundResults: null,
      manualOverrules: {}, // `${playerId}_${catId}` -> boolean
      history: []
    };

    this.rooms.set(code, room);
    globalMetrics.setRoomCount(this.rooms.size);
    return room;
  }

  joinRoom(roomCode, socketId, playerName, avatar = '🤠') {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { error: 'Room not found' };
    if (room.status !== 'LOBBY') return { error: 'Game already in progress' };

    // Check if player is reconnecting with same socket or already in
    const existing = room.players.find(p => p.id === socketId);
    if (!existing) {
      room.players.push({
        id: socketId,
        name: playerName || `Player ${room.players.length + 1}`,
        avatar: avatar || '🤠',
        isHost: false,
        isReady: false,
        isBot: false,
        totalScore: 0
      });
    }

    return { room };
  }

  leaveRoom(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      const pIndex = room.players.findIndex(p => p.id === socketId);
      if (pIndex !== -1) {
        const leavingPlayer = room.players[pIndex];
        room.players.splice(pIndex, 1);

        // If host left, reassign or delete
        if (room.players.length === 0) {
          const t = this.roomTimers.get(code);
          if (t) clearInterval(t);
          this.roomTimers.delete(code);
          this.rooms.delete(code);
          globalMetrics.setRoomCount(this.rooms.size);
          return { code, roomDeleted: true };
        } else if (leavingPlayer.isHost) {
          const nonBot = room.players.find(p => !p.isBot);
          if (nonBot) {
            nonBot.isHost = true;
            room.hostId = nonBot.id;
          } else {
            room.players[0].isHost = true;
            room.hostId = room.players[0].id;
          }
        }
        return { code, room, leavingPlayer };
      }
    }
    return null;
  }

  addBot(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'LOBBY') return null;

    const botNames = [
      { name: "Nimal (AI)", avatar: "🤖" },
      { name: "Kamal (AI)", avatar: "🧠" },
      { name: "Sanduni (AI)", avatar: "⚡" },
      { name: "Buddhika (AI)", avatar: "🦁" }
    ];

    const currentBots = room.players.filter(p => p.isBot).length;
    const botChoice = botNames[currentBots % botNames.length];

    const botPlayer = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: botChoice.name,
      avatar: botChoice.avatar,
      isHost: false,
      isReady: true,
      isBot: true,
      totalScore: 0
    };

    room.players.push(botPlayer);
    return room;
  }

  removeBot(roomCode, botId) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'LOBBY') return null;
    room.players = room.players.filter(p => p.id !== botId);
    return room;
  }

  updateSettings(roomCode, newSettings) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'LOBBY') return null;
    room.settings = { ...room.settings, ...newSettings };
    return room;
  }

  toggleReady(roomCode, socketId) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    const player = room.players.find(p => p.id === socketId);
    if (player) {
      player.isReady = !player.isReady;
    }
    return room;
  }

  startGame(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    room.currentRound = 0;
    room.usedLetters = [];
    room.players.forEach(p => p.totalScore = 0);
    this.startNextRound(roomCode);
    return room;
  }

  startNextRound(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    room.currentRound++;
    if (room.currentRound > room.settings.totalRounds) {
      this.endGame(roomCode);
      return;
    }

    // Pick a fresh random letter
    const available = EASY_LETTERS.filter(l => !room.usedLetters.includes(l));
    const letterPool = available.length > 0 ? available : EASY_LETTERS;
    const nextLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
    room.usedLetters.push(nextLetter);
    room.currentLetter = nextLetter;

    // Reset round state
    room.status = 'LETTER_SPIN';
    room.timeRemaining = room.settings.roundDuration;
    room.isSuddenDeath = false;
    room.panicTriggeredBy = null;
    room.submittedAnswers = {};
    room.manualOverrules = {};
    room.currentRoundResults = null;

    this.io.to(roomCode).emit('letter_spinning', {
      letter: nextLetter,
      round: room.currentRound,
      totalRounds: room.settings.totalRounds,
      spinDurationMs: 4000
    });

    // After 4 seconds roulette spin animation, start the active round timer
    setTimeout(() => {
      const activeRoom = this.rooms.get(roomCode);
      if (!activeRoom || activeRoom.status !== 'LETTER_SPIN') return;

      activeRoom.status = 'ROUND_ACTIVE';
      activeRoom.timeRemaining = activeRoom.settings.roundDuration;

      this.io.to(roomCode).emit('round_started', {
        letter: activeRoom.currentLetter,
        round: activeRoom.currentRound,
        totalRounds: activeRoom.settings.totalRounds,
        timeRemaining: activeRoom.timeRemaining,
        categories: CATEGORIES
      });

      // Start authoritative interval timer
      this.runTimer(roomCode);

      // Trigger bot player simulated behavior
      this.simulateBots(roomCode);
    }, 4000);
  }

  runTimer(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    const existing = this.roomTimers.get(roomCode);
    if (existing) clearInterval(existing);

    const timer = setInterval(() => {
      const r = this.rooms.get(roomCode);
      if (!r || r.status !== 'ROUND_ACTIVE') {
        const t = this.roomTimers.get(roomCode);
        if (t) clearInterval(t);
        this.roomTimers.delete(roomCode);
        return;
      }

      r.timeRemaining--;

      this.io.to(roomCode).emit('timer_tick', {
        timeRemaining: r.timeRemaining,
        isSuddenDeath: r.isSuddenDeath,
        panicTriggeredBy: r.panicTriggeredBy
      });

      if (r.timeRemaining <= 0) {
        const t = this.roomTimers.get(roomCode);
        if (t) clearInterval(t);
        this.roomTimers.delete(roomCode);
        this.freezeAndCalculate(roomCode);
      }
    }, 1000);

    this.roomTimers.set(roomCode, timer);
  }

  triggerPanicFinish(roomCode, socketId, playerAnswers) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'ROUND_ACTIVE') return { error: 'Round not active' };

    const player = room.players.find(p => p.id === socketId);
    if (!player) return { error: 'Player not found' };

    // Verify all 6 categories are filled starting with currentLetter
    const filledCount = CATEGORIES.filter(cat => {
      const val = playerAnswers[cat.id];
      return validateStartingLetter(val, room.currentLetter);
    }).length;

    if (filledCount < CATEGORIES.length) {
      return { error: 'All 6 categories must be filled starting with ' + room.currentLetter };
    }

    // Save finisher answers
    room.submittedAnswers[socketId] = playerAnswers;

    // Trigger Sudden Death if remaining time is greater than suddenDeathDuration (60s)
    if (room.timeRemaining > room.settings.suddenDeathDuration) {
      room.timeRemaining = room.settings.suddenDeathDuration;
    }

    room.isSuddenDeath = true;
    room.panicTriggeredBy = {
      id: player.id,
      name: player.name,
      avatar: player.avatar
    };

    this.io.to(roomCode).emit('panic_activated', {
      finisher: room.panicTriggeredBy,
      timeRemaining: room.timeRemaining
    });

    return { success: true };
  }

  updatePlayerDraft(roomCode, socketId, answers) {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    room.submittedAnswers[socketId] = answers;
  }

  simulateBots(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const bots = room.players.filter(p => p.isBot);
    bots.forEach(bot => {
      // Simulate answer generation
      const botAnswers = {};
      CATEGORIES.forEach(cat => {
        botAnswers[cat.id] = getRandomWordForLetter(cat.id, room.currentLetter);
      });
      room.submittedAnswers[bot.id] = botAnswers;
    });
  }

  freezeAndCalculate(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.status = 'VERIFICATION';
    const t = this.roomTimers.get(roomCode);
    if (t) clearInterval(t);
    this.roomTimers.delete(roomCode);

    // Increment global metric for completed round
    globalMetrics.incrementRound();

    // Calculate score matrix
    const results = calculateRoundScores(
      room.submittedAnswers,
      room.players,
      room.currentLetter,
      room.manualOverrules
    );

    room.currentRoundResults = results;

    this.io.to(roomCode).emit('round_frozen', {
      results,
      categories: CATEGORIES,
      currentLetter: room.currentLetter,
      globalStats: globalMetrics.getGlobalStats()
    });
  }

  overruleAnswer(roomCode, { playerId, categoryId, isValid }) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'VERIFICATION') return null;

    const overruleKey = `${playerId}_${categoryId}`;
    room.manualOverrules[overruleKey] = isValid;

    // Recalculate immediately
    const results = calculateRoundScores(
      room.submittedAnswers,
      room.players,
      room.currentLetter,
      room.manualOverrules
    );

    room.currentRoundResults = results;

    this.io.to(roomCode).emit('overrule_updated', {
      results,
      overruleKey,
      isValid
    });

    return results;
  }

  confirmAndShowLeaderboard(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'VERIFICATION') return null;

    // Apply round scores to total scores
    if (room.currentRoundResults && room.currentRoundResults.playerRoundTotals) {
      room.players.forEach(p => {
        const roundData = room.currentRoundResults.playerRoundTotals[p.id];
        if (roundData) {
          p.totalScore = Math.round((p.totalScore + roundData.score) * 10) / 10;
        }
      });
    }

    room.status = 'LEADERBOARD';

    // Sort players by total score
    const leaderboard = [...room.players].sort((a, b) => b.totalScore - a.totalScore);

    this.io.to(roomCode).emit('leaderboard_view', {
      leaderboard,
      round: room.currentRound,
      totalRounds: room.settings.totalRounds,
      roundPoints: room.currentRoundResults.playerRoundTotals,
      isFinalRound: room.currentRound >= room.settings.totalRounds
    });

    return room;
  }

  endGame(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.status = 'GAME_OVER';
    globalMetrics.incrementMatch();

    const sortedPlayers = [...room.players].sort((a, b) => b.totalScore - a.totalScore);
    const winner = sortedPlayers[0];

    this.io.to(roomCode).emit('game_over', {
      podium: sortedPlayers.slice(0, 3),
      allPlayers: sortedPlayers,
      winner,
      globalStats: globalMetrics.getGlobalStats()
    });
  }

  resetToLobby(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    room.status = 'LOBBY';
    room.currentRound = 0;
    room.usedLetters = [];
    room.currentLetter = '';
    room.submittedAnswers = {};
    room.currentRoundResults = null;
    room.manualOverrules = {};
    room.players.forEach(p => {
      p.totalScore = 0;
      p.isReady = p.isHost || p.isBot;
    });

    this.io.to(roomCode).emit('room_reset_to_lobby', { room: this.getPublicRoom(room) });
    return room;
  }
}
