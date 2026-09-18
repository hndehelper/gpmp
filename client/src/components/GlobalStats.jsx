import React, { useEffect, useRef, useState } from 'react';
import { Users, Flame, Trophy, Globe2 } from 'lucide-react';

// Smoothly animates a number from old value to new value
function useAnimatedCount(target, duration = 800) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    if (prev.current === target) return;
    const start = prev.current;
    const diff = target - start;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return display;
}

export function GlobalStats({ stats }) {
  if (!stats) return null;

  const animUsers   = useAnimatedCount(stats.liveOnlineUsers ?? 0);
  const animRounds  = useAnimatedCount(stats.totalRoundsPlayed || 0);
  const animMatches = useAnimatedCount(stats.totalMatchesPlayed || 0);
  const animRooms   = useAnimatedCount(stats.activeRoomsCount || 0);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-6">
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/60 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Global Community Activity
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              Live Sync
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {/* Live Online Users */}
          <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 hover:border-emerald-500/30 transition">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xl font-black tracking-tight font-mono">
                {animUsers}
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Players Online
            </div>
          </div>

          {/* Total Rounds Played */}
          <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 hover:border-amber-500/30 transition">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-xl font-black tracking-tight font-mono">
                {animRounds.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Rounds Played
            </div>
          </div>

          {/* Total Matches Finished */}
          <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 hover:border-purple-500/30 transition">
            <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xl font-black tracking-tight font-mono">
                {animMatches.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Matches Won
            </div>
          </div>

          {/* Active Rooms */}
          <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 hover:border-cyan-500/30 transition">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
              <span className="text-base">🎮</span>
              <span className="text-xl font-black tracking-tight font-mono">
                {animRooms}
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Rooms Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

