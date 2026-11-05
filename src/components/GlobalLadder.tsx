import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { PlayerProfile, TierDefinition, TIERS, LeaderboardRowData } from '../types/rank';
import { rankedEngine, N } from '../lib/engine';
import { sound } from '../lib/audio';
import { Search, Flame, ArrowUp, User, Swords, Shield, Trophy } from 'lucide-react';

interface GlobalLadderProps {
  user: PlayerProfile;
  userRank: number;
  userRankDelta: number;
  onChallengePlayer?: (name: string, rank: number, points: number, characterId: string) => void;
}

const ROW_HEIGHT = 56;

export const GlobalLadder: React.FC<GlobalLadderProps> = ({
  user,
  userRank,
  userRankDelta,
  onChallengePlayer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [scrollTop, setScrollTop] = useState(0);
  const [inspectedPlayer, setInspectedPlayer] = useState<LeaderboardRowData | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute tier distributions
  const tierCounts = useMemo(() => {
    return rankedEngine.getTierCounts();
  }, [user.matches]);

  // Compute filtered rank indices if searching or filtering by tier
  const filteredRanks = useMemo(() => {
    if (!searchQuery && selectedTier === 'ALL') {
      return null; // Full 60,001 list
    }

    if (searchQuery) {
      return rankedEngine.searchRanks(searchQuery, userRank, user, 150);
    }

    if (selectedTier !== 'ALL') {
      // Find range of ranks corresponding to this tier
      const tierDef = TIERS.find((t) => t.id === selectedTier);
      if (!tierDef) return null;
      const results: number[] = [];
      for (let r = 1; r <= N + 1 && results.length < 200; r++) {
        const row = rankedEngine.getRowAtRank(r, userRank, user, userRankDelta);
        if (row.tier.id === selectedTier) {
          results.push(r);
        }
      }
      return results;
    }

    return null;
  }, [searchQuery, selectedTier, userRank, user, userRankDelta]);

  const totalRowCount = filteredRanks ? filteredRanks.length : N + 1;

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Virtualization window
  const viewportHeight = 520;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 4);
  const endIndex = Math.min(totalRowCount, startIndex + Math.ceil(viewportHeight / ROW_HEIGHT) + 8);

  const visibleRows = useMemo(() => {
    const rows: LeaderboardRowData[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      const rank = filteredRanks ? filteredRanks[i] : i + 1;
      const row = rankedEngine.getRowAtRank(rank, userRank, user, userRankDelta);
      rows.push(row);
    }
    return rows;
  }, [startIndex, endIndex, filteredRanks, userRank, user, userRankDelta]);

  const scrollToTop = () => {
    sound.playClick();
    setSearchQuery('');
    setSelectedTier('ALL');
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToMe = () => {
    sound.playClick();
    setSearchQuery('');
    setSelectedTier('ALL');
    if (containerRef.current) {
      const targetTop = Math.max(0, (userRank - 1) * ROW_HEIGHT - viewportHeight / 2 + ROW_HEIGHT / 2);
      containerRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Tier Distribution Strip */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
          Tier Populations ({N.toLocaleString()} Contenders)
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedTier('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTier === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Tiers
          </button>
          {TIERS.map((tier) => {
            const count = tierCounts[tier.id] || 0;
            const isSelected = selectedTier === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedTier(tier.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                style={isSelected ? { backgroundColor: tier.color } : {}}
              >
                <span>{tier.icon}</span>
                <span>{tier.id}</span>
                <span className="font-mono text-[11px] opacity-80">({count.toLocaleString()})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contender name or jump to #rank (e.g. #1, #1500)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={scrollToTop}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Top #1</span>
          </button>

          <button
            onClick={scrollToMe}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Find Me (#{userRank.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* Virtualized Leaderboard Container */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="h-11 px-4 sm:px-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-16">Rank</span>
            <span className="w-16">Tier</span>
            <span>Contender</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Streak</span>
            <span>MMR Points</span>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="relative overflow-y-auto"
          style={{ height: `${viewportHeight}px` }}
        >
          {/* Virtual height spacer */}
          <div style={{ height: `${totalRowCount * ROW_HEIGHT}px`, position: 'relative' }}>
            {visibleRows.map((row, idx) => {
              const absoluteIndex = startIndex + idx;
              const topOffset = absoluteIndex * ROW_HEIGHT;
              const isUser = row.isUser;

              return (
                <div
                  key={`${row.rank}-${row.name}`}
                  onClick={() => {
                    sound.playClick();
                    setInspectedPlayer(row);
                  }}
                  style={{
                    position: 'absolute',
                    top: `${topOffset}px`,
                    left: 0,
                    right: 0,
                    height: `${ROW_HEIGHT}px`,
                  }}
                  className={`px-4 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 cursor-pointer transition-colors ${
                    isUser
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Rank, Tier, Character, Name */}
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
                        {isUser && <span className="text-indigo-600 dark:text-indigo-400">★</span>}
                        <span>{row.name}</span>
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

                  {/* Right: Streak & Points */}
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

      {/* Contender Inspection Modal */}
      {inspectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Contender Profile
              </span>
              <button
                onClick={() => setInspectedPlayer(null)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl shrink-0">
                {inspectedPlayer.character.avatarEmoji}
              </div>
              <div>
                <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">
                  {inspectedPlayer.name}
                </h4>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {inspectedPlayer.character.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Signature: {inspectedPlayer.character.specialMove}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-medium">Global Rank</div>
                <div className="font-mono font-bold text-lg text-slate-900 dark:text-white mt-0.5">
                  #{inspectedPlayer.rank.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-medium">Ranked MMR</div>
                <div className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {inspectedPlayer.points.toLocaleString()} PTS
                </div>
              </div>
            </div>

            {!inspectedPlayer.isUser && onChallengePlayer && (
              <button
                onClick={() => {
                  onChallengePlayer(
                    inspectedPlayer.name,
                    inspectedPlayer.rank,
                    inspectedPlayer.points,
                    inspectedPlayer.character.id
                  );
                  setInspectedPlayer(null);
                }}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>Challenge in Arena Matchmaker</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
