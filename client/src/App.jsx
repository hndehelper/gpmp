import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Navbar } from './components/Navbar.jsx';
import { GlobalStats } from './components/GlobalStats.jsx';
import { LobbyView } from './components/LobbyView.jsx';
import { LetterSpin } from './components/LetterSpin.jsx';
import { GameRoundView } from './components/GameRoundView.jsx';
import { PanicBanner } from './components/PanicBanner.jsx';
import { VerificationMatrix } from './components/VerificationMatrix.jsx';
import { LeaderboardView } from './components/LeaderboardView.jsx';
import { GameOverPodium } from './components/GameOverPodium.jsx';
import { HowToPlayModal } from './components/HowToPlayModal.jsx';
import { sounds } from './utils/soundEffects.js';

// Auto-determine backend URL (supports VITE_SERVER_URL if deployed separately, e.g. GitHub Pages + Render)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : window.location.origin
);

export default function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    liveOnlineUsers: 0,
    totalRoundsPlayed: 0,
    totalMatchesPlayed: 0,
    activeRoomsCount: 0
  });

  // Room & Game State
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [spinData, setSpinData] = useState(null);
  const [roundData, setRoundData] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Initialize Socket.io connection and fetch initial stats
  useEffect(() => {
    fetch(`${SERVER_URL}/api/stats`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.liveOnlineUsers !== 'undefined') {
          setGlobalStats(data);
        }
      })
      .catch(() => {});

    const s = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    s.on('connect', () => {
      setConnected(true);
      setSocket(s);
      s.emit('get_global_stats');
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('global_stats_update', (stats) => {
      setGlobalStats(stats);
    });

    s.on('room_created', ({ room, playerId }) => {
      setRoom(room);
      setPlayerId(playerId);
      window.history.replaceState({}, '', `?room=${room.code}`);
    });

    s.on('room_joined', ({ room, playerId }) => {
      setRoom(room);
      setPlayerId(playerId);
      window.history.replaceState({}, '', `?room=${room.code}`);
    });

    s.on('room_state_update', ({ room }) => {
      setRoom(room);
    });

    s.on('letter_spinning', (data) => {
      setSpinData(data);
      setRoom(prev => prev ? { ...prev, status: 'LETTER_SPIN' } : prev);
    });

    s.on('round_started', (data) => {
      setSpinData(null);
      setRoundData(data);
      setRoom(prev => prev ? {
        ...prev,
        status: 'ROUND_ACTIVE',
        currentLetter: data.letter,
        currentRound: data.round,
        timeRemaining: data.timeRemaining,
        isSuddenDeath: false,
        panicTriggeredBy: null
      } : prev);
    });

    s.on('timer_tick', ({ timeRemaining, isSuddenDeath, panicTriggeredBy }) => {
      setRoom(prev => prev ? {
        ...prev,
        timeRemaining,
        isSuddenDeath,
        panicTriggeredBy
      } : prev);
    });

    s.on('panic_activated', ({ finisher, timeRemaining }) => {
      setRoom(prev => prev ? {
        ...prev,
        isSuddenDeath: true,
        panicTriggeredBy: finisher,
        timeRemaining
      } : prev);
    });

    s.on('round_frozen', ({ results, categories, currentLetter, globalStats }) => {
      if (globalStats) setGlobalStats(globalStats);
      setVerificationData({ results, categories, currentLetter });
      setRoom(prev => prev ? { ...prev, status: 'VERIFICATION' } : prev);
    });

    s.on('overrule_updated', ({ results }) => {
      setVerificationData(prev => prev ? { ...prev, results } : prev);
    });

    s.on('leaderboard_view', (data) => {
      setLeaderboardData(data);
      setRoom(prev => prev ? { ...prev, status: 'LEADERBOARD' } : prev);
    });

    s.on('game_over', (data) => {
      if (data.globalStats) setGlobalStats(data.globalStats);
      setGameOverData(data);
      setRoom(prev => prev ? { ...prev, status: 'GAME_OVER' } : prev);
    });

    s.on('room_reset_to_lobby', ({ room }) => {
      setRoom(room);
      setSpinData(null);
      setRoundData(null);
      setVerificationData(null);
      setLeaderboardData(null);
      setGameOverData(null);
    });

    s.on('error_message', ({ message }) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 3500);
    });

    // Check for query param ?room=XYZ
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      // Auto-populate or notify
    }

    return () => {
      s.disconnect();
    };
  }, []);

  // Room action handlers
  const handleCreateRoom = ({ hostName, avatar }) => {
    if (!socket) return;
    socket.emit('create_room', { hostName, avatar });
  };

  const handleJoinRoom = ({ roomCode, playerName, avatar }) => {
    if (!socket) return;
    socket.emit('join_room', { roomCode, playerName, avatar });
  };

  const handleToggleReady = () => {
    if (!socket || !room) return;
    socket.emit('toggle_ready', { roomCode: room.code });
  };

  const handleStartGame = () => {
    if (!socket || !room) return;
    socket.emit('start_game', { roomCode: room.code });
  };

  const handleAddBot = () => {
    if (!socket || !room) return;
    socket.emit('add_bot', { roomCode: room.code });
  };

  const handleRemoveBot = (botId) => {
    if (!socket || !room) return;
    socket.emit('remove_bot', { roomCode: room.code, botId });
  };

  const handleUpdateSettings = (newSettings) => {
    if (!socket || !room) return;
    socket.emit('update_settings', { roomCode: room.code, settings: newSettings });
  };

  const handleSaveDraft = (answers) => {
    if (!socket || !room) return;
    socket.emit('save_draft', { roomCode: room.code, answers });
  };

  const handleTriggerPanic = (answers) => {
    if (!socket || !room) return;
    socket.emit('trigger_panic', { roomCode: room.code, answers });
  };

  const handleOverrule = ({ playerId, categoryId, isValid }) => {
    if (!socket || !room) return;
    socket.emit('overrule_answer', {
      roomCode: room.code,
      playerId,
      categoryId,
      isValid
    });
  };

  const handleConfirmLeaderboard = () => {
    if (!socket || !room) return;
    socket.emit('confirm_scores', { roomCode: room.code });
  };

  const handleNextRound = () => {
    if (!socket || !room) return;
    socket.emit('next_round', { roomCode: room.code });
  };

  const handlePlayAgain = () => {
    if (!socket || !room) return;
    socket.emit('reset_game', { roomCode: room.code });
  };

  const handleLeaveRoom = () => {
    window.location.href = window.location.pathname;
  };

  const isHost = room && room.players.find(p => p.id === playerId)?.isHost;
  const currentStatus = room ? room.status : 'HOME';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500">
      <div>
        {/* Navbar */}
        <Navbar
          room={room}
          onLeaveRoom={handleLeaveRoom}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Panic Sudden Death Top Alert Banner */}
        {currentStatus === 'ROUND_ACTIVE' && room?.isSuddenDeath && (
          <PanicBanner
            panicTriggeredBy={room.panicTriggeredBy}
            timeRemaining={room.timeRemaining}
          />
        )}

        {/* Floating Error Toast */}
        {errorMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white font-bold px-6 py-3 rounded-2xl shadow-2xl border border-rose-400 animate-bounce">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Global Stats Counter - Always visible on Home and Lobby */}
        {(currentStatus === 'HOME' || currentStatus === 'LOBBY') && (
          <GlobalStats stats={globalStats} />
        )}

        {/* Main Stage Router */}
        <main className="transition-all duration-300">
          {currentStatus === 'HOME' || currentStatus === 'LOBBY' ? (
            <LobbyView
              room={room}
              playerId={playerId}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              onToggleReady={handleToggleReady}
              onStartGame={handleStartGame}
              onAddBot={handleAddBot}
              onRemoveBot={handleRemoveBot}
              onUpdateSettings={handleUpdateSettings}
            />
          ) : currentStatus === 'LETTER_SPIN' ? (
            <LetterSpin
              letter={spinData?.letter || room?.currentLetter}
              round={spinData?.round || room?.currentRound}
              totalRounds={spinData?.totalRounds || room?.settings?.totalRounds}
            />
          ) : currentStatus === 'ROUND_ACTIVE' ? (
            <GameRoundView
              letter={room?.currentLetter || 'B'}
              round={room?.currentRound || 1}
              totalRounds={room?.settings?.totalRounds || 10}
              timeRemaining={room?.timeRemaining ?? 180}
              isSuddenDeath={room?.isSuddenDeath}
              panicTriggeredBy={room?.panicTriggeredBy}
              categories={roundData?.categories || [
                { id: 'girlName', labelEn: 'Girl Name', labelSi: 'ගෑනු ළමයා', icon: '👧' },
                { id: 'boyName', labelEn: 'Boy Name', labelSi: 'පිරිමි ළමයා', icon: '👦' },
                { id: 'flower', labelEn: 'Flower', labelSi: 'මල්', icon: '🌺' },
                { id: 'fruit', labelEn: 'Fruit', labelSi: 'පළතුරු', icon: '🍍' },
                { id: 'vegetable', labelEn: 'Vegetable', labelSi: 'එළවළු', icon: '🥦' },
                { id: 'villageCity', labelEn: 'Village / City', labelSi: 'ගම / නගරය', icon: '🏡' }
              ]}
              onTriggerPanic={handleTriggerPanic}
              onSaveDraft={handleSaveDraft}
            />
          ) : currentStatus === 'VERIFICATION' ? (
            <VerificationMatrix
              results={verificationData?.results}
              categories={verificationData?.categories || []}
              currentLetter={verificationData?.currentLetter || room?.currentLetter}
              isHost={isHost}
              onOverrule={handleOverrule}
              onConfirmLeaderboard={handleConfirmLeaderboard}
            />
          ) : currentStatus === 'LEADERBOARD' ? (
            <LeaderboardView
              leaderboard={leaderboardData?.leaderboard || room?.players || []}
              round={leaderboardData?.round || room?.currentRound}
              totalRounds={leaderboardData?.totalRounds || room?.settings?.totalRounds}
              roundPoints={leaderboardData?.roundPoints || {}}
              isFinalRound={leaderboardData?.isFinalRound}
              isHost={isHost}
              onNextRound={handleNextRound}
            />
          ) : currentStatus === 'GAME_OVER' ? (
            <GameOverPodium
              winner={gameOverData?.winner}
              podium={gameOverData?.podium || []}
              allPlayers={gameOverData?.allPlayers || []}
              isHost={isHost}
              onPlayAgain={handlePlayAgain}
            />
          ) : null}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-900 mt-12">
        <p className="sinhala-text">
          GPMP Online • ගෑනු, පිරිමි, මල්, පළතුරු • Built with ❤️ for Sri Lankan Campus & Gen Z Gamers
        </p>
      </footer>

      {/* Rules & How to Play Modal */}
      <HowToPlayModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
