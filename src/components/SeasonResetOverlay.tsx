import React, { useEffect } from 'react';
import { TierDefinition } from '../types/rank';
import { sound } from '../lib/audio';
import { Trophy, Swords, Flame, ArrowRight } from 'lucide-react';

interface SeasonResetOverlayProps {
  finalRank: number;
  finalPoints: number;
  finalTier: TierDefinition;
  matchesPlayed: number;
  bestStreak: number;
  onClose: () => void;
}

export const SeasonResetOverlay: React.FC<SeasonResetOverlayProps> = ({
  finalRank,
  finalPoints,
  finalTier,
  matchesPlayed,
  bestStreak,
  onClose,
}) => {
  useEffect(() => {
    sound.playWin();
  }, []);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg cursor-pointer select-none overflow-hidden p-6 text-center"
    >
      <div className="relative z-10 max-w-lg w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
        <div className="text-6xl sm:text-7xl mb-3">{finalTier.icon}</div>

        <div
          className="inline-block px-6 py-2 rounded-xl text-2xl font-display font-black text-white shadow-lg mb-3"
          style={{ backgroundColor: finalTier.color }}
        >
          {finalTier.name}
        </div>

        <h2 className="font-display font-black text-2xl sm:text-3xl tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400">
          SEASON CONCLUDED!
        </h2>

        <p className="text-sm text-slate-300 mt-1 mb-6">
          The weekly tournament has ended. All 60,000 fighters reset to D-Rank (1,000 pts) for the new season!
        </p>

        {/* Season Recap Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-left mb-6">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Final Standing</span>
            </div>
            <div className="font-mono font-black text-xl text-white">
              #{finalRank.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {finalPoints.toLocaleString()} PTS
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Swords className="w-3.5 h-3.5 text-indigo-400" />
              <span>Matches Fought</span>
            </div>
            <div className="font-mono font-black text-xl text-white">
              {matchesPlayed}
            </div>
            <div className="flex items-center gap-1 text-xs text-orange-400 font-mono mt-0.5">
              <Flame className="w-3 h-3 fill-orange-400" />
              <span>Best Streak: {bestStreak}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:opacity-95 font-display font-bold text-base text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <span>Claim Rewards & Enter New Season</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
