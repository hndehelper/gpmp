import React, { useEffect } from 'react';
import { Trophy, ArrowRight, Award, Flame } from 'lucide-react';
import { sounds } from '../utils/soundEffects.js';

export function LeaderboardView({
  leaderboard,
  round,
  totalRounds,
  roundPoints,
  isFinalRound,
  isHost,
  onNextRound
}) {
  useEffect(() => {
    sounds.playSuccess();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full inline-block mb-3">
            ROUND {round} COMPLETED
          </span>
          <h2 className="text-3xl font-black text-white flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-amber-400" />
            <span>Leaderboard Standings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 sinhala-text">
            {isFinalRound ? 'අවසාන වටය නිමාවිය! ජයග්රාහකයා මෙන්න:' : `මීළඟ වටය: Round ${round + 1} / ${totalRounds}`}
          </p>
        </div>

        {/* Players Leaderboard List */}
        <div className="space-y-3 mb-8">
          {leaderboard.map((p, idx) => {
            const addedScore = roundPoints?.[p.id]?.score || 0;
            const isFirst = idx === 0;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  isFirst
                    ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-lg ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.avatar || '🤠'}</span>
                    <div>
                      <div className="font-bold text-white text-base flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.isBot && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                            BOT
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <span>Round gain:</span>
                        <span className="font-bold text-emerald-400">+{addedScore} pts</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-amber-400">
                    {p.totalScore}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Total Points
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {isHost ? (
          <button
            onClick={() => {
              sounds.playSuccess();
              onNextRound();
            }}
            className="w-full bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3 text-lg transition active:scale-95"
          >
            <span>{isFinalRound ? 'View Grand Finale & Trophy 🏆' : `Next Round (${round + 1}/${totalRounds})`}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-center p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 sinhala-text">
            කරුණාකර Host මීළඟ වටය ආරම්භ කරන තෙක් රැඳී සිටින්න...
          </div>
        )}
      </div>
    </div>
  );
}
