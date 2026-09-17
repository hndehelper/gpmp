import React from 'react';
import { X, Sparkles, Flame, Users, CheckCircle2, Trophy } from 'lucide-react';

export function HowToPlayModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-2xl shadow-lg">
            📜
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">How To Play GPMP</h2>
            <p className="text-xs text-slate-400 sinhala-text">
              "ගෑනු, පිරිමි, මල්, පළතුරු" තරඟ නීති සහ ලකුණු ක්‍රමය
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300 max-h-[60vh] overflow-y-auto pr-2">
          {/* Rule 1 */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>1. Random Letter Generation (අහඹු අකුරක් ලැබීම)</span>
            </div>
            <p className="text-xs text-slate-400">
              සෑම වටයක් ආරම්භයේදීම Screen එක මත Roulette Animation එකක් සමඟ English අකුරක් (e.g., 'B') ලැබේ. සියලුම පිළිතුරු අනිවාර්යයෙන්ම එම අකුරෙන්ම ආරම්භ විය යුතුය.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-cyan-400 mb-1">
              <span>📝 2. 6 Categories & 3-Minute Timer</span>
            </div>
            <p className="text-xs text-slate-400">
              Girl Name, Boy Name, Flower, Fruit, Vegetable, Village/City යන Categories 6 සම්පූර්ණ කිරීමට මිනිත්තු 3 ක කාලයක් ලැබේ.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
              <Flame className="w-4 h-4" />
              <span>3. The "FINISH" Panic Button & 60s Sudden Death! 🔥</span>
            </div>
            <p className="text-xs text-slate-400">
              යම් ක්‍රීඩකයෙකු Categories 6ම ලියා අවසන් වූ වහාම <strong>"FINISH"</strong> ඔබනු ලැබේ. ඒ ක්ෂණිකවම අනෙක් සියලුම ක්‍රීඩකයින්ගේ ඉතිරි කාලය <strong>තත්පර 60</strong> දක්වා අඩු වේ!
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
              <Users className="w-4 h-4" />
              <span>4. Duplicate Split-Scoring (ලකුණු බෙදී යාම)</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-5 mt-1">
              <li><strong>Unique Answer:</strong> වෙන කාටවත් සමාන නැති නිවැරදි පිළිතුරකට = <span className="text-emerald-400 font-bold">10 Points</span></li>
              <li><strong>Duplicate Answers:</strong> එකම පිළිතුර ක්‍රීඩකයින් 2ක් හෝ වැඩි ගණනක් ලියා තිබුණහොත් 10 Points ලියූ ගණනින් බෙදී යයි (2 Players = <span className="text-amber-400 font-bold">5 pts each</span>, 5 Players = <span className="text-amber-400 font-bold">2 pts each</span>).</li>
              <li><strong>Empty / Wrong:</strong> 0 Points.</li>
            </ul>
          </div>

          {/* Rule 5 */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-indigo-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>5. Manual Overrule / Peer Review (අභියාචනා)</span>
            </div>
            <p className="text-xs text-slate-400">
              දේශීය ගම් නම් හෝ විශේෂ නම් සඳහා Verification Matrix හි ✅ හෝ ❌ ඔබා පිළිතුර වලංගු හෝ අවලංගු කළ හැක. ලකුණු සජීවීව update වේ.
            </p>
          </div>

          {/* Rule 6 */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span>6. Ultimate Mastermind Trophy</span>
            </div>
            <p className="text-xs text-slate-400">
              වට 10 අවසානයේ වැඩිම ලකුණු ලබන ශූරයා "Ultimate Mastermind" කුසලානය දිනා ගනී!
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition"
          >
            තේරුණා! (Let's Play)
          </button>
        </div>
      </div>
    </div>
  );
}
