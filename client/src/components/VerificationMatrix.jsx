import React from 'react';
import { Check, X, Users, Sparkles, Award, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/soundEffects.js';

export function VerificationMatrix({
  results,
  categories,
  currentLetter,
  isHost,
  onOverrule,
  onConfirmLeaderboard
}) {
  if (!results || !results.categoryResults) return null;

  const { categoryResults, playerRoundTotals } = results;
  const playerIds = Object.keys(playerRoundTotals);

  const handleToggle = (playerId, categoryId, currentValid) => {
    sounds.playTick(950);
    onOverrule({
      playerId,
      categoryId,
      isValid: !currentValid
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 mb-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                Round Verification & Scoring Matrix
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                Letter: "{currentLetter}"
              </span>
            </div>
            <h2 className="text-2xl font-black text-white sinhala-text">
              පිළිතුරු පරීක්ෂා කිරීම සහ ලකුණු ලබාදීම
            </h2>
            <p className="text-xs text-slate-400 sinhala-text mt-1">
              Unique = 10 pts • Duplicates = 10/N pts • Empty/Wrong = 0 pts. අවශ්ය නම් ✅/❌ මගින් Overrule කරන්න.
            </p>
          </div>

          {isHost && (
            <button
              onClick={() => {
                sounds.playSuccess();
                onConfirmLeaderboard();
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition active:scale-95 text-sm"
            >
              <span>Confirm & Show Leaderboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Responsive Matrix Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="p-4 sticky left-0 bg-slate-950/95 z-20 min-w-[140px]">
                  Player
                </th>
                {categories.map(cat => (
                  <th key={cat.id} className="p-4 min-w-[170px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span>{cat.icon}</span>
                      <span>{cat.labelEn}</span>
                    </div>
                  </th>
                ))}
                <th className="p-4 text-center min-w-[110px] bg-slate-950/60 sticky right-0 z-10">
                  Round Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {playerIds.map(pId => {
                const pTotals = playerRoundTotals[pId];
                const playerName = pTotals?.breakdown[categories[0].id]?.playerName || 'Player';

                return (
                  <tr key={pId} className="hover:bg-slate-800/30 transition">
                    {/* Player Info Cell (Sticky Left) */}
                    <td className="p-4 font-bold text-white sticky left-0 bg-slate-900/95 z-10 border-r border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base">
                          👤
                        </span>
                        <div className="truncate max-w-[120px]" title={playerName}>
                          {playerName}
                        </div>
                      </div>
                    </td>

                    {/* Category Answers Cells */}
                    {categories.map(cat => {
                      const item = categoryResults[cat.id]?.[pId];
                      if (!item) return <td key={cat.id} className="p-3">-</td>;

                      const isUnique = item.status === 'unique';
                      const isDuplicate = item.status === 'duplicate';
                      const isInvalid = !item.isValid || item.rawAnswer.length === 0;

                      return (
                        <td key={cat.id} className="p-3 align-top border-r border-slate-800/30">
                          <div className="space-y-1.5">
                            {/* Word text */}
                            <div className="font-semibold text-slate-100 break-words">
                              {item.rawAnswer ? item.rawAnswer : (
                                <span className="text-slate-600 italic text-xs">[Empty]</span>
                              )}
                            </div>

                            {/* Status & Points Badge */}
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              {isUnique && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                                  <Sparkles className="w-3 h-3 text-emerald-400" />
                                  10 pts (Unique)
                                </span>
                              )}

                              {isDuplicate && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md" title={`Duplicated with: ${item.duplicatesWith?.join(', ')}`}>
                                  <Users className="w-3 h-3 text-amber-400" />
                                  {item.points} pts ({item.duplicateCount}x)
                                </span>
                              )}

                              {isInvalid && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md">
                                  0 pts
                                </span>
                              )}

                              {/* Manual Overrule Toggle Button */}
                              <button
                                onClick={() => handleToggle(pId, cat.id, item.isValid)}
                                title={item.isValid ? "Click to mark Invalid" : "Click to mark Valid"}
                                className={`p-1 rounded transition text-xs ${
                                  item.isValid
                                    ? 'hover:bg-rose-500/20 text-slate-400 hover:text-rose-400'
                                    : 'hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-400'
                                }`}
                              >
                                {item.isValid ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Round Score Cell (Sticky Right) */}
                    <td className="p-4 text-center sticky right-0 bg-slate-900/95 z-10 border-l border-slate-800 font-mono font-black text-lg text-amber-400">
                      +{pTotals?.score || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
