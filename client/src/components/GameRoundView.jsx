import React, { useState, useEffect } from 'react';
import { Flame, Clock, Check, AlertCircle, Lock } from 'lucide-react';
import { sounds } from '../utils/soundEffects.js';

export function GameRoundView({
  letter,
  round,
  totalRounds,
  timeRemaining,
  isSuddenDeath,
  panicTriggeredBy,
  categories,
  onTriggerPanic,
  onSaveDraft
}) {
  const [answers, setAnswers] = useState({
    girlName: '',
    boyName: '',
    flower: '',
    fruit: '',
    vegetable: '',
    villageCity: ''
  });

  const [hasFinished, setHasFinished] = useState(false);

  // Play tick sound on low time
  useEffect(() => {
    if (timeRemaining <= 10 && timeRemaining > 0) {
      sounds.playTick(1000 + (10 - timeRemaining) * 50);
    }
  }, [timeRemaining]);

  const handleInputChange = (catId, value) => {
    if (hasFinished || timeRemaining <= 0) return;
    const updated = { ...answers, [catId]: value };
    setAnswers(updated);
    onSaveDraft(updated);
  };

  // Check validation per category
  const checkCategoryValidity = (catId) => {
    const val = (answers[catId] || '').trim();
    if (!val) return { filled: false, validLetter: false };
    const startsWith = val[0].toUpperCase() === letter.toUpperCase();
    return { filled: true, validLetter: startsWith };
  };

  // Count how many categories are correctly filled starting with letter
  const validCompletedCount = categories.filter(cat => {
    const check = checkCategoryValidity(cat.id);
    return check.filled && check.validLetter;
  }).length;

  const canFinish = validCompletedCount === categories.length && !hasFinished && timeRemaining > 0;

  const handleFinishClick = () => {
    if (!canFinish) return;
    setHasFinished(true);
    sounds.playSuccess();
    onTriggerPanic(answers);
  };

  // Format mm:ss
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = timeRemaining <= 30 || isSuddenDeath;

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 py-6 ${isSuddenDeath ? 'panic-pulse' : ''}`}>
      {/* Top Status Bar: Round, Letter & Live Countdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Letter Badge */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-1 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[12px] flex items-center justify-center">
              <span className="text-4xl font-black text-amber-400 font-mono">{letter}</span>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ROUND {round} OF {totalRounds}
            </span>
            <h2 className="text-lg font-black text-white">
              Target Letter: <span className="text-amber-400 font-mono text-xl">{letter}</span>
            </h2>
            <p className="text-xs text-slate-400 sinhala-text">
              සියලුම නම් "{letter}" අකුරෙන් ආරම්භ විය යුතුය
            </p>
          </div>
        </div>

        {/* Progress & Countdown Timer */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold uppercase text-slate-400">Completion</div>
            <div className="text-sm font-bold text-slate-200">
              <span className={validCompletedCount === 6 ? 'text-emerald-400' : 'text-amber-400'}>
                {validCompletedCount}
              </span> / 6 Categories
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all ${
              isUrgent
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-950 border-slate-700 text-emerald-400'
            }`}
          >
            <Clock className={`w-5 h-5 ${isUrgent ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="text-2xl font-black font-mono tracking-widest">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Category Input Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {categories.map(cat => {
          const { filled, validLetter } = checkCategoryValidity(cat.id);
          const isFrozen = timeRemaining <= 0;

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-2xl border transition-all ${
                isFrozen
                  ? 'bg-slate-950/40 border-slate-800 opacity-80'
                  : filled && validLetter
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                  : filled && !validLetter
                  ? 'bg-slate-900/90 border-rose-500/40'
                  : 'bg-slate-900/90 border-slate-800 focus-within:border-indigo-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-sm text-slate-200">
                  <span className="text-xl">{cat.icon}</span>
                  <span>{cat.labelEn}</span>
                  <span className="text-xs text-slate-400 sinhala-text font-normal">
                    ({cat.labelSi})
                  </span>
                </label>

                {filled && validLetter && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <Check className="w-3 h-3" /> Valid '{letter}'
                  </span>
                )}
                {filled && !validLetter && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                    <AlertCircle className="w-3 h-3" /> Must start with '{letter}'
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  disabled={isFrozen}
                  placeholder={`Enter a ${cat.labelEn.toLowerCase()} starting with "${letter}"...`}
                  value={answers[cat.id] || ''}
                  onChange={e => handleInputChange(cat.id, e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition font-medium ${
                    filled && !validLetter
                      ? 'border-rose-500 text-rose-200'
                      : 'border-slate-700 focus:border-indigo-400'
                  }`}
                />
                {isFrozen && (
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* The "FINISH" Panic Button */}
      <div className="flex flex-col items-center justify-center gap-3">
        {hasFinished ? (
          <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold px-8 py-4 rounded-2xl text-center shadow-lg animate-pulse">
            ✅ You Pressed FINISH! 60s Sudden Death Activated for Everyone!
          </div>
        ) : (
          <div className="w-full max-w-md text-center">
            <button
              onClick={handleFinishClick}
              disabled={!canFinish}
              className={`w-full py-5 px-8 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all transform ${
                canFinish
                  ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-rose-600/50 scale-105 active:scale-95 animate-pulse cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Flame className={`w-7 h-7 ${canFinish ? 'text-amber-200 animate-bounce' : 'text-slate-600'}`} />
              <span>HIT "FINISH" & TRIGGER PANIC! 🔥</span>
            </button>

            {!canFinish && (
              <p className="text-xs text-slate-500 mt-2 sinhala-text">
                "FINISH" එබීමට Categories 6ම "{letter}" අකුරෙන් ආරම්භ වන නිවැරදි නම් වලින් සම්පූර්ණ කරන්න ({validCompletedCount}/6)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
