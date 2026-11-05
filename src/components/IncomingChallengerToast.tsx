import React, { useEffect, useState } from 'react';
import { OpponentMatchData } from './ArenaMatchModal';
import { Swords, X, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { sound } from '../lib/audio';

interface IncomingChallengerToastProps {
  challenger: OpponentMatchData;
  onAccept: (challenger: OpponentMatchData) => void;
  onDecline: () => void;
}

export const IncomingChallengerToast: React.FC<IncomingChallengerToastProps> = ({
  challenger,
  onAccept,
  onDecline,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(15);

  useEffect(() => {
    sound.playChallengerAlert();

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onDecline]);

  return (
    <div className="fixed bottom-5 right-5 sm:right-6 z-50 max-w-sm w-full mx-auto p-4 rounded-3xl bg-slate-900 border-2 border-amber-500/80 text-white shadow-2xl shadow-amber-500/20 animate-bounce select-none">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
          <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Challenger Approaching!</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400">
            {secondsRemaining}s
          </span>
          <button
            onClick={onDecline}
            className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-3">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-2xl shrink-0 border border-slate-700">
          {challenger.character.avatarEmoji}
        </div>

        <div className="truncate flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="px-1.5 py-0.2 rounded text-[10px] font-black text-white"
              style={{ backgroundColor: challenger.tier.color }}
            >
              {challenger.tier.id}
            </span>
            <span className="font-display font-bold text-sm text-white truncate">
              {challenger.name}
            </span>
          </div>
          <div className="text-xs text-slate-400 truncate mt-0.5">
            {challenger.character.name}
          </div>
          <div className="text-[11px] text-amber-400 font-mono mt-0.5 flex items-center gap-2">
            <span>Rank #{challenger.rank.toLocaleString()}</span>
            {challenger.streak > 1 && (
              <span className="flex items-center gap-0.5 text-orange-400">
                <Flame className="w-3 h-3 fill-orange-400" />
                <span>{challenger.streak} streak</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onAccept(challenger)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 font-display font-bold text-xs text-white shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Accept Challenge Duel</span>
        </button>

        <button
          onClick={onDecline}
          className="py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs"
        >
          Decline
        </button>
      </div>
    </div>
  );
};
