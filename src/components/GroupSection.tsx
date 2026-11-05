import React, { useRef, useEffect } from 'react';
import { PlayerProfile, LeaderboardRowData } from '../types/rank';
import { rankedEngine, N } from '../lib/engine';
import { sound } from '../lib/audio';
import { Users, Flame, ArrowUp, ArrowDown, Shield, Trophy } from 'lucide-react';

interface GroupSectionProps {
  user: PlayerProfile;
  userRank: number;
  userRankDelta: number;
}

const GROUP_SIZE = 100;
const ROW_HEIGHT = 56;

export const GroupSection: React.FC<GroupSectionProps> = ({
  user,
  userRank,
  userRankDelta,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Group range: centered around user
  const startRank = Math.max(1, Math.min(userRank - 50, N + 2 - GROUP_SIZE));
  const endRank = startRank + GROUP_SIZE - 1;
  const userGroupIndex = userRank - startRank + 1;

  // Build the 100 rows
  const groupRows: LeaderboardRowData[] = [];
  for (let k = 0; k < GROUP_SIZE; k++) {
    const r = startRank + k;
    groupRows.push(rankedEngine.getRowAtRank(r, userRank, user, userRankDelta));
  }

  // Smooth scroll to user row on mount or rank change
  useEffect(() => {
    if (containerRef.current) {
      const userIndexInList = userRank - startRank;
      const targetScroll = Math.max(0, userIndexInList * ROW_HEIGHT - 220);
      containerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, [userRank, startRank]);

  return (
    <div className="space-y-4">
      {/* Group Summary Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
              Division Bracket (100 Contenders)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranks #{startRank.toLocaleString()} to #{endRank.toLocaleString()} · Compete against your immediate ladder peers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-2xl self-start sm:self-auto">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Your Standing</div>
            <div className="font-mono font-black text-lg text-slate-900 dark:text-white">
              #{userGroupIndex} <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          {userRankDelta !== 0 && (
            <div className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-1 rounded-lg ${
              userRankDelta > 0
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
            }`}>
              {userRankDelta > 0 ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(userRankDelta)} Ranks</span>
            </div>
          )}
        </div>
      </div>

      {/* Group List Container */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="h-11 px-4 sm:px-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-16">Global</span>
            <span className="w-16">Tier</span>
            <span>Fighter</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Streak</span>
            <span>MMR Points</span>
          </div>
        </div>

        {/* Scrollable list */}
        <div
          ref={containerRef}
          className="overflow-y-auto max-h-[580px] divide-y divide-slate-100 dark:divide-slate-800/60"
        >
          {groupRows.map((row) => {
            const isUser = row.isUser;
            return (
              <div
                key={row.rank}
                className={`px-4 sm:px-6 h-14 flex items-center justify-between transition-colors ${
                  isUser
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-l-4 border-l-indigo-600 shadow-xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Left side */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-16 font-mono font-bold text-xs sm:text-sm text-slate-500 dark:text-slate-400 shrink-0">
                    #{row.rank.toLocaleString()}
                  </span>

                  <span
                    className="w-14 px-2 py-0.5 rounded-md text-xs font-bold text-white text-center shrink-0 shadow-xs"
                    style={{ backgroundColor: row.tier.color }}
                  >
                    {row.tier.id}
                  </span>

                  <span className="text-xl shrink-0">{row.character.avatarEmoji}</span>

                  <div className="truncate">
                    <div className="font-display font-bold text-sm text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      {isUser && <span className="text-indigo-600 dark:text-indigo-400 font-bold">★</span>}
                      <span>{row.name}</span>
                      {isUser && userRankDelta !== 0 && (
                        <span className={`text-[11px] font-bold font-mono px-1.5 py-0.2 rounded ${
                          userRankDelta > 0 ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60' : 'text-rose-600 bg-rose-100 dark:bg-rose-950/60'
                        }`}>
                          {userRankDelta > 0 ? '▲' : '▼'}{Math.abs(userRankDelta)}
                        </span>
                      )}
                      {row.streak >= 3 && (
                        <span className="flex items-center gap-0.5 text-xs text-orange-500 font-bold shrink-0">
                          <Flame className="w-3 h-3 fill-orange-500" />
                          <span>{row.streak}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {row.character.name}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="font-mono text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                    {row.matches} matches
                  </div>

                  <div className="font-mono font-black text-sm sm:text-base text-slate-900 dark:text-white text-right">
                    {row.points.toLocaleString()} <span className="text-xs text-slate-400 font-normal">pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
