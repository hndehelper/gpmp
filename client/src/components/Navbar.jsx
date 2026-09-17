import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, Share2, LogOut, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects.js';

export function Navbar({ room, onLeaveRoom, onOpenHelp }) {
  const [isMuted, setIsMuted] = useState(sounds.muted);
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playTick();
  };

  const copyRoomCode = () => {
    if (!room) return;
    const shareUrl = `${window.location.origin}?room=${room.code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    sounds.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-500 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xl">
              🌺
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="game-title text-xl font-bold tracking-wide bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
                GPMP Online
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
                Gen-Z Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 sinhala-text hidden md:block">
              ගෑනු • පිරිමි • මල් • පළතුරු • එළවළු • ගම
            </p>
          </div>
        </div>

        {/* Room Code Badge (if inside room) */}
        {room && (
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl shadow-inner">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">ROOM:</span>
            <span className="text-sm font-black tracking-widest text-amber-400 font-mono">
              {room.code}
            </span>
            <button
              onClick={copyRoomCode}
              title="Copy Invite Link"
              className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-semibold text-emerald-400">{copied ? 'COPIED!' : ''}</span>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="How To Play"
          >
            <HelpCircle className="w-5 h-5 text-indigo-400" />
          </button>

          {room && (
            <button
              onClick={onLeaveRoom}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition"
              title="Leave Room"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
