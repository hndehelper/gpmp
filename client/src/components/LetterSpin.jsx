import React, { useEffect, useState } from 'react';
import { sounds } from '../utils/soundEffects.js';

export function LetterSpin({ letter, round, totalRounds }) {
  const [displayLetter, setDisplayLetter] = useState('?');
  const [countdown, setCountdown] = useState(3);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // 3-second initial countdown
    let c = 3;
    sounds.playTick(600);
    const countInterval = setInterval(() => {
      c--;
      if (c > 0) {
        setCountdown(c);
        sounds.playTick(600);
      } else {
        clearInterval(countInterval);
        startSpinning();
      }
    }, 800);

    return () => clearInterval(countInterval);
  }, [letter]);

  const startSpinning = () => {
    setCountdown(null);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let ticks = 0;
    const spinInterval = setInterval(() => {
      ticks++;
      const rand = alphabet[Math.floor(Math.random() * alphabet.length)];
      setDisplayLetter(rand);
      sounds.playTick(800 + ticks * 20);

      if (ticks > 18) {
        clearInterval(spinInterval);
        setDisplayLetter(letter);
        setIsLocked(true);
        sounds.playLetterLock();
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-4">
          <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full inline-block">
            ROUND {round} OF {totalRounds}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-300 mb-6 sinhala-text">
          {countdown !== null ? 'අකුර තෝරනවා... සූදානම් වෙන්න!' : 'අද වටයේ අකුර:'}
        </h2>

        {countdown !== null ? (
          <div className="w-36 h-36 mx-auto rounded-3xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-7xl font-black text-amber-400 shadow-2xl animate-bounce-short">
            {countdown}
          </div>
        ) : (
          <div className="relative inline-block">
            {isLocked && (
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 rounded-3xl blur-xl opacity-75 animate-pulse" />
            )}
            <div
              className={`relative w-44 h-44 rounded-3xl bg-slate-900 border-4 flex items-center justify-center text-8xl font-black shadow-2xl transition-all duration-300 ${
                isLocked
                  ? 'border-amber-400 text-amber-400 scale-110 shadow-amber-500/50'
                  : 'border-slate-700 text-slate-200'
              }`}
            >
              {displayLetter}
            </div>
          </div>
        )}

        {isLocked && (
          <div className="mt-8 animate-fade-in">
            <p className="text-lg font-bold text-amber-300 tracking-wide uppercase">
              LETTER "{letter}" SELECTED!
            </p>
            <p className="text-xs text-slate-400 mt-1 sinhala-text">
              හැම Categories එකක්ම "{letter}" අකුරෙන් ආරම්භ කරන්න!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
