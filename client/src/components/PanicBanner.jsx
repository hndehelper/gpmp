import React, { useEffect } from 'react';
import { Flame, AlertTriangle } from 'lucide-react';
import { sounds } from '../utils/soundEffects.js';

export function PanicBanner({ panicTriggeredBy, timeRemaining }) {
  useEffect(() => {
    sounds.playPanicSiren();
  }, [panicTriggeredBy]);

  return (
    <div className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white px-4 py-3 shadow-2xl border-b-2 border-red-400 relative overflow-hidden animate-pulse-fast">
      {/* Background glowing bars */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl animate-bounce">
            🔥
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-black text-sm uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded text-amber-200">
                PANIC MODE ACTIVATED
              </span>
              <span className="font-bold text-sm">
                60s SUDDEN DEATH!
              </span>
            </div>
            <p className="text-xs text-rose-100 sinhala-text font-medium">
              <span className="font-bold text-white uppercase">{panicTriggeredBy?.name || 'Someone'}</span> සියලුම පිළිතුරු ලියා අවසන් කර FINISH ඔබා ඇත! ඉක්මන් කරන්න!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-xl border border-white/20">
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-bold text-amber-200 uppercase">Ends in:</span>
          <span className="text-xl font-black font-mono text-white tracking-widest">
            {timeRemaining}s
          </span>
        </div>
      </div>
    </div>
  );
}
