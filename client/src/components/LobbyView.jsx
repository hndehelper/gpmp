import React, { useState } from 'react';
import { Users, Play, Bot, Crown, CheckCircle2, Circle, Settings, Copy, Check, Sparkles, UserPlus } from 'lucide-react';
import { sounds } from '../utils/soundEffects.js';

const AVATARS = ['😎', '🦁', '🦊', '🐯', '🚀', '👑', '🦄', '🔥', '⚡', '🎸', '🎮', '🍕'];

export function LobbyView({
  room,
  playerId,
  onCreateRoom,
  onJoinRoom,
  onToggleReady,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onUpdateSettings
}) {
  const [playerName, setPlayerName] = useState(localStorage.getItem('gpmp_player_name') || '');
  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem('gpmp_avatar') || '😎');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const isHost = room && room.players.find(p => p.id === playerId)?.isHost;
  const myPlayer = room?.players.find(p => p.id === playerId);

  const handleCreate = () => {
    const name = playerName.trim() || 'Player 1';
    localStorage.setItem('gpmp_player_name', name);
    localStorage.setItem('gpmp_avatar', selectedAvatar);
    sounds.playSuccess();
    onCreateRoom({ hostName: name, avatar: selectedAvatar });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const name = playerName.trim() || 'Player';
    localStorage.setItem('gpmp_player_name', name);
    localStorage.setItem('gpmp_avatar', selectedAvatar);
    sounds.playTick();
    onJoinRoom({ roomCode: inputCode.trim().toUpperCase(), playerName: name, avatar: selectedAvatar });
  };

  const handleCopyLink = () => {
    if (!room) return;
    const shareUrl = `${window.location.origin}?room=${room.code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    sounds.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  // If player is NOT yet in a room (Landing / Join Screen)
  if (!room) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Header */}
          <div className="text-center mb-8">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full inline-block mb-3">
              ⚡ Real-Time Multiplayer Word Showdown
            </span>
            <h1 className="game-title text-4xl sm:text-5xl font-black bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent mb-2">
              ගෑනු, පිරිමි, මල්, පළතුරු
            </h1>
            <p className="text-slate-400 text-sm sinhala-text">
              100% Gamified Sri Lankan Campus Nostalgia with 60-Second Sudden Death!
            </p>
          </div>

          {/* Profile Customization */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Choose Your Avatar
              </label>
              <div className="flex flex-wrap gap-2 justify-center bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                {AVATARS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(emoji);
                      sounds.playTick(900);
                    }}
                    className={`text-2xl w-11 h-11 rounded-xl transition flex items-center justify-center ${
                      selectedAvatar === emoji
                        ? 'bg-rose-500 shadow-lg shadow-rose-500/40 scale-110'
                        : 'bg-slate-800/80 hover:bg-slate-700 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Your Nickname
              </label>
              <input
                type="text"
                placeholder="Enter your name (e.g. Kasun, Chathura...)"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={20}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition font-medium"
              />
            </div>
          </div>

          {/* Action Tabs: Create or Join */}
          <div className="space-y-4">
            <button
              onClick={handleCreate}
              className="w-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:from-rose-600 hover:to-amber-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transform active:scale-95 transition text-base"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Create New Room (Host Game)</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold uppercase text-slate-500">OR JOIN WITH CODE</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                type="text"
                placeholder="6-LETTER CODE"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-400 uppercase"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
              >
                <UserPlus className="w-5 h-5" />
                <span>Join</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Inside Room Lobby
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Room Header & Invite */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
                Room Lobby
              </span>
              <span className="text-xs text-slate-400">
                {room.players.length} Player{room.players.length > 1 ? 's' : ''} in room
              </span>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 font-mono tracking-wider">
              CODE: <span className="text-amber-400">{room.code}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 text-sm font-semibold transition active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>

            {isHost && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-xl border transition ${
                  showSettings ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Game Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Host Settings Dropdown */}
        {isHost && showSettings && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Host Game Customization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Total Rounds</label>
                <select
                  value={room.settings.totalRounds}
                  onChange={e => onUpdateSettings({ totalRounds: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value={5}>5 Rounds (Quick Match)</option>
                  <option value={10}>10 Rounds (Standard)</option>
                  <option value={15}>15 Rounds (Marathon)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Round Timer</label>
                <select
                  value={room.settings.roundDuration}
                  onChange={e => onUpdateSettings({ roundDuration: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value={120}>2 Minutes (120s)</option>
                  <option value={180}>3 Minutes (180s - Classic)</option>
                  <option value={240}>4 Minutes (240s - Relaxed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Sudden Death Panic</label>
                <select
                  value={room.settings.suddenDeathDuration}
                  onChange={e => onUpdateSettings({ suddenDeathDuration: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value={30}>30s (Ultra Extreme)</option>
                  <option value={60}>60s (Standard Panic 🔥)</option>
                  <option value={90}>90s (Mild Rush)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Players List Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-400" />
              Players in Lobby ({room.players.length})
            </h3>

            {isHost && (
              <button
                onClick={onAddBot}
                className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>+ Add Practice Bot</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {room.players.map(p => (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                  p.id === playerId
                    ? 'bg-rose-500/10 border-rose-500/40 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                    {p.avatar || '🤠'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                      <span>{p.name}</span>
                      {p.isHost && (
                        <Crown className="w-3.5 h-3.5 text-amber-400" title="Room Host" />
                      )}
                      {p.isBot && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-mono">
                          BOT
                        </span>
                      )}
                      {p.id === playerId && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {p.isHost ? 'Host' : (p.isReady ? 'Ready' : 'Waiting...')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.isReady || p.isHost ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold bg-slate-800 px-2 py-1 rounded-lg">
                      <Circle className="w-3.5 h-3.5" />
                      Not Ready
                    </span>
                  )}

                  {isHost && p.isBot && (
                    <button
                      onClick={() => onRemoveBot(p.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 p-1"
                      title="Remove bot"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lobby Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {!isHost && (
            <button
              onClick={onToggleReady}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold transition flex items-center justify-center gap-2 ${
                myPlayer?.isReady
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{myPlayer?.isReady ? 'Cancel Ready' : 'I am Ready!'}</span>
            </button>
          )}

          {isHost && (
            <button
              onClick={onStartGame}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 text-lg transform active:scale-95 transition"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>START GAME (ROUND 1/{room.settings.totalRounds})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
