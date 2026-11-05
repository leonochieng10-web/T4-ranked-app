import React from 'react';
import { Calendar, Clock, RotateCcw, ShieldAlert } from 'lucide-react';
import { sound } from '../lib/audio';

interface SeasonBannerProps {
  seasonNumber: number;
  timeRemainingStr: string;
  seasonProgressPercent: number;
  nextUpdateStr: string;
  onTestReset: () => void;
}

export const SeasonBanner: React.FC<SeasonBannerProps> = ({
  seasonNumber,
  timeRemainingStr,
  seasonProgressPercent,
  nextUpdateStr,
  onTestReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-slate-900 dark:text-white">
                Season {seasonNumber}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                ACTIVE
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Weekly Competitive Reset</span>
              <span aria-hidden="true">·</span>
              <span>60,000 Active Fighters</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Time Remaining
            </div>
            <div className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{timeRemainingStr}</span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onTestReset();
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors flex items-center gap-1.5"
            title="Fast forward clock to test the season reset animation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Test Reset</span>
          </button>
        </div>
      </div>

      {/* Season Progress Bar */}
      <div className="mt-4">
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-full transition-all duration-1000 ease-linear shadow-xs"
            style={{ width: `${Math.min(100, Math.max(0, seasonProgressPercent))}%` }}
          />
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Loss protection active below B-Rank (1,500 pts)</span>
        </span>
        <span className="font-mono tabular-nums text-slate-400 dark:text-slate-500">
          Next MMR update in <b className="text-slate-700 dark:text-slate-300">{nextUpdateStr}</b>
        </span>
      </div>
    </div>
  );
};
