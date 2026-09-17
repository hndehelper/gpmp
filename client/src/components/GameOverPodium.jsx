import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Sparkles, Flame, Crown } from 'lucide-react';
import { sounds } from '../utils/soundEffects.js';

export function GameOverPodium({ winner, podium, allPlayers, isHost, onPlayAgain }) {
  useEffect(() => {
    sounds.playFanfare();

    // Trigger golden victory confetti cannon
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#fbbf24'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const first = podium[0];
  const second = podium[1];
  const third = podium[2];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Grand Trophy Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden mb-8">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Mastermind Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-amber-300 mb-4 shadow-inner">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Ultimate Mastermind Champion</span>
          <Crown className="w-4 h-4 text-amber-400" />
        </div>

        <h1 className="game-title text-4xl sm:text-6xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent mb-2">
          VICTORY!
        </h1>
        <p className="text-slate-400 text-sm sinhala-text mb-8">
          තරඟ වට 10 සාර්ථකව අවසන්! ජයග්‍රාහකයාට උණුසුම් සුබපැතුම්!
        </p>

        {/* 3D Trophy Showcase */}
        <div className="relative inline-block mb-10">
          <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-7xl sm:text-8xl shadow-2xl shadow-amber-500/50 animate-bounce-short">
            🏆
          </div>
          <div className="mt-4 font-black text-2xl sm:text-3xl text-white flex items-center justify-center gap-2">
            <span>{winner?.avatar || '👑'}</span>
            <span className="bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
              {winner?.name || 'Champion'}
            </span>
          </div>
          <div className="text-lg font-mono font-bold text-amber-400 mt-1">
            {winner?.totalScore || 0} Total Points
          </div>
        </div>

        {/* Podium Pillars */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-lg mx-auto mb-10 pt-4">
          {/* 2nd Place */}
          {second && (
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{second.avatar || '🤠'}</span>
              <span className="text-xs font-bold text-slate-300 truncate max-w-[90px] mb-1">
                {second.name}
              </span>
              <span className="text-xs font-mono text-slate-400 mb-2 font-bold">
                {second.totalScore} pts
              </span>
              <div className="w-full h-24 bg-slate-800 border-t-4 border-slate-400 rounded-t-2xl flex items-center justify-center text-2xl font-black text-slate-300 shadow-lg">
                🥈 2nd
              </div>
            </div>
          )}

          {/* 1st Place */}
          {first && (
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">{first.avatar || '👑'}</span>
              <span className="text-sm font-black text-amber-300 truncate max-w-[110px] mb-1">
                {first.name}
              </span>
              <span className="text-xs font-mono text-amber-400 mb-2 font-black">
                {first.totalScore} pts
              </span>
              <div className="w-full h-36 bg-gradient-to-b from-amber-500 to-amber-700 border-t-4 border-amber-300 rounded-t-2xl flex items-center justify-center text-3xl font-black text-slate-950 shadow-xl shadow-amber-500/20">
                🥇 1st
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{third.avatar || '🤠'}</span>
              <span className="text-xs font-bold text-slate-300 truncate max-w-[90px] mb-1">
                {third.name}
              </span>
              <span className="text-xs font-mono text-slate-400 mb-2 font-bold">
                {third.totalScore} pts
              </span>
              <div className="w-full h-16 bg-slate-850 border-t-4 border-amber-800 rounded-t-2xl flex items-center justify-center text-xl font-black text-amber-700 shadow-md">
                🥉 3rd
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {isHost ? (
          <button
            onClick={onPlayAgain}
            className="w-full max-w-md mx-auto bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:from-rose-600 hover:to-amber-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-rose-500/30 flex items-center justify-center gap-3 text-lg transition active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN (NEW MATCH)</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 sinhala-text">
            නැවත ක්‍රීඩා කිරීමට Host "Play Again" එබෙන තෙක් රැඳී සිටින්න.
          </div>
        )}
      </div>
    </div>
  );
}
