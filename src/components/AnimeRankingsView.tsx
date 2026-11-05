import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { PlayerProfile, TierDefinition, TIERS, LeaderboardRowData } from '../types/rank';
import { rankedEngine, N, WEEK_MS } from '../lib/engine';
import { sound } from '../lib/audio';
import { TierMedal } from './TierMedal';
import { SeasonRewardsModal } from './SeasonRewardsModal';
import {
  RotateCcw,
  Search,
  Flame,
  ArrowUp,
  User,
  Swords,
  Gift,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  Smartphone,
} from 'lucide-react';

interface AnimeRankingsViewProps {
  user: PlayerProfile;
  userRank: number;
  userRankDelta: number;
  seasonNumber: number;
  onBackToLobby: () => void;
  onOpenArena: () => void;
  onChallengePlayer?: (name: string, rank: number, points: number, characterId: string) => void;
  onOpenApkModal?: () => void;
}

const ROW_HEIGHT = 58;

export const AnimeRankingsView: React.FC<AnimeRankingsViewProps> = ({
  user,
  userRank,
  userRankDelta,
  seasonNumber,
  onBackToLobby,
  onOpenArena,
  onChallengePlayer,
  onOpenApkModal,
}) => {
  const [rankingMode, setRankingMode] = useState<'GLOBAL' | 'GROUP'>('GROUP');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [scrollTop, setScrollTop] = useState(0);
  const [inspectedPlayer, setInspectedPlayer] = useState<LeaderboardRowData | null>(null);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Group range: centered around user (100 contenders)
  const groupSize = 100;
  const startGroupRank = Math.max(1, Math.min(userRank - 50, N + 2 - groupSize));

  // Compute days remaining in season
  const daysRemaining = useMemo(() => {
    const left = rankedEngine.sEnd - rankedEngine.now();
    return Math.max(1, Math.floor(left / 86400000));
  }, []);

  // Compute filtered rank indices if searching or filtering
  const filteredRanks = useMemo(() => {
    if (rankingMode === 'GROUP') {
      const results: number[] = [];
      for (let k = 0; k < groupSize; k++) {
        results.push(startGroupRank + k);
      }
      return results;
    }

    if (!searchQuery && selectedTier === 'ALL') {
      return null; // Full 60,001 list
    }

    if (searchQuery) {
      return rankedEngine.searchRanks(searchQuery, userRank, user, 150);
    }

    if (selectedTier !== 'ALL') {
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
  }, [rankingMode, searchQuery, selectedTier, userRank, user, userRankDelta, startGroupRank]);

  const totalRowCount = filteredRanks ? filteredRanks.length : N + 1;

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Virtualization window
  const viewportHeight = 490;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 3);
  const endIndex = Math.min(totalRowCount, startIndex + Math.ceil(viewportHeight / ROW_HEIGHT) + 6);

  const visibleRows = useMemo(() => {
    const rows: LeaderboardRowData[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      const rank = filteredRanks ? filteredRanks[i] : i + 1;
      const row = rankedEngine.getRowAtRank(rank, userRank, user, userRankDelta);
      rows.push(row);
    }
    return rows;
  }, [startIndex, endIndex, filteredRanks, userRank, user, userRankDelta]);

  // Scroll to user row in group mode or search
  const scrollToUser = () => {
    sound.playClick();
    if (containerRef.current) {
      if (rankingMode === 'GROUP') {
        const targetIndex = userRank - startGroupRank;
        const targetTop = Math.max(0, targetIndex * ROW_HEIGHT - viewportHeight / 2 + ROW_HEIGHT / 2);
        containerRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
      } else {
        const targetTop = Math.max(0, (userRank - 1) * ROW_HEIGHT - viewportHeight / 2 + ROW_HEIGHT / 2);
        containerRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    }
  };

  const userTier = useMemo(() => rankedEngine.getRowAtRank(userRank, userRankDelta, user).tier, [userRank, user, userRankDelta]);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a] text-white shadow-2xl border-2 border-indigo-400/40 select-none min-h-[720px] flex flex-col">
      {/* Manga Halftone Overlay */}
      <div className="absolute inset-0 bg-manga-dots opacity-25 pointer-events-none" />

      {/* Tenkaichi Tournament Stone Dais Engraving on the Left (SVG) */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-[380px] h-[380px] pointer-events-none opacity-20">
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-white fill-none stroke-[3]">
          <circle cx="200" cy="200" r="180" />
          <circle cx="200" cy="200" r="140" strokeDasharray="12 12" />
          <circle cx="200" cy="200" r="100" />
          <circle cx="200" cy="200" r="60" strokeDasharray="8 8" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={200 + Math.cos(angle) * 100}
                y1={200 + Math.sin(angle) * 100}
                x2={200 + Math.cos(angle) * 180}
                y2={200 + Math.sin(angle) * 180}
              />
            );
          })}
        </svg>
      </div>

      {/* Floating Translucent Dragon Balls in Background */}
      <div className="absolute top-12 left-10 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-300/30 to-amber-600/20 blur-xs border border-amber-300/30 flex items-center justify-center pointer-events-none">
        <span className="text-amber-300 text-lg opacity-40">★★</span>
      </div>

      <div className="absolute bottom-24 right-12 w-32 h-32 rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-300/25 to-amber-600/15 blur-xs border border-amber-300/20 flex items-center justify-center pointer-events-none">
        <span className="text-amber-300 text-xl opacity-35">★★★★</span>
      </div>

      {/* Top Banner (Replicating the screenshot's header and exit button) */}
      <div className="relative z-10 px-4 sm:px-8 pt-5 pb-3 flex items-start justify-between gap-4 border-b border-white/15 bg-slate-950/20 backdrop-blur-xs">
        {/* Left Side: Exit Button & Title */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              sound.playClick();
              onBackToLobby();
            }}
            title="Return to Arena Lobby"
            className="w-11 h-11 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 border-2 border-white/60 shadow-lg shadow-rose-900/50 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-transform shrink-0"
          >
            <RotateCcw className="w-5 h-5 -rotate-45 stroke-[2.5]" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-2xl sm:text-3xl tracking-widest text-white comic-title-shadow uppercase">
                RANKINGS
              </h2>
            </div>
            <p className="text-xs text-white/80 font-medium tracking-wide">
              Rankings are updated hourly. · Season {seasonNumber}
            </p>
          </div>
        </div>

        {/* Right Side: Dual Tabs matching screenshot (Global vs Group with timers) */}
        <div className="flex items-end gap-1.5 shrink-0">
          {/* Global Tab */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-t-md bg-white/90 text-slate-900 border-t border-x border-white flex items-center gap-1 shadow-xs">
              <Clock className="w-2.5 h-2.5" />
              <span>{daysRemaining + 13} day(s)</span>
            </span>
            <button
              onClick={() => {
                sound.playClick();
                setRankingMode('GLOBAL');
              }}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-display font-black uppercase tracking-wider transition-all cursor-pointer ${
                rankingMode === 'GLOBAL'
                  ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 border-2 border-yellow-100 scale-[1.03]'
                  : 'bg-white/80 hover:bg-white text-slate-800 border border-white/60'
              }`}
            >
              Global
            </button>
          </div>

          {/* Group Tab */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-t-md bg-yellow-400 text-slate-950 border-t border-x border-yellow-200 flex items-center gap-1 shadow-xs">
              <Clock className="w-2.5 h-2.5" />
              <span>{daysRemaining} day(s)</span>
            </span>
            <button
              onClick={() => {
                sound.playClick();
                setRankingMode('GROUP');
              }}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-display font-black uppercase tracking-wider transition-all cursor-pointer ${
                rankingMode === 'GROUP'
                  ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 border-2 border-yellow-100 scale-[1.03]'
                  : 'bg-white/80 hover:bg-white text-slate-800 border border-white/60'
              }`}
            >
              Group
            </button>
          </div>
        </div>
      </div>

      {/* Search & Navigation Bar */}
      <div className="relative z-10 px-4 sm:px-8 py-2.5 bg-slate-950/20 backdrop-blur-xs flex flex-col sm:flex-row items-center gap-2.5 border-b border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contender name or jump to rank # (e.g. #20, #1400)"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/90 text-slate-900 placeholder:text-slate-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={scrollToUser}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 font-display font-black text-xs shadow-md border border-emerald-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>Find You (#{userRank.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* Main Leaderboard Table matching screenshot */}
      <div className="relative z-10 flex-1 px-4 sm:px-8 py-3 overflow-hidden flex flex-col">
        {/* Scrollable Rows Container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto pr-1"
          style={{ height: `${viewportHeight}px` }}
        >
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
                    height: `${ROW_HEIGHT - 6}px`,
                  }}
                  className={`px-4 sm:px-5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-[#bef264] to-[#a3e635] text-slate-950 border-2 border-white shadow-lg scale-[1.01] ring-2 ring-emerald-400/50'
                      : 'bg-white/95 hover:bg-white text-slate-900 border border-white/70 shadow-sm hover:scale-[1.005]'
                  }`}
                >
                  {/* Left: Rank, Name, Character */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`font-mono font-black text-sm sm:text-base w-9 text-left ${
                        isUser ? 'text-slate-950' : 'text-slate-700'
                      }`}
                    >
                      {row.rank}
                    </span>

                    <span className="text-xl shrink-0">{row.character.avatarEmoji}</span>

                    <div className="truncate">
                      <div className="font-display font-bold text-sm sm:text-base truncate flex items-center gap-1.5">
                        {isUser && <span className="text-indigo-800 font-black">★</span>}
                        <span className={isUser ? 'text-slate-950' : 'text-slate-900'}>
                          {row.name}
                        </span>
                        {row.streak >= 3 && (
                          <span className="flex items-center gap-0.5 text-xs text-orange-600 font-bold shrink-0">
                            <Flame className="w-3.5 h-3.5 fill-orange-500" />
                            <span>{row.streak}</span>
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] truncate ${isUser ? 'text-slate-800' : 'text-slate-500'}`}>
                        {row.character.name}
                      </div>
                    </div>
                  </div>

                  {/* Right: Gold Tier Medal Emblem + Points */}
                  <div className="flex items-center gap-3.5 shrink-0">
                    <TierMedal tier={row.tier} size="md" />

                    <div
                      className={`font-mono font-black text-sm sm:text-base w-16 text-right tabular-nums ${
                        isUser ? 'text-slate-950' : 'text-slate-900'
                      }`}
                    >
                      {row.points.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pinned Bottom User Bar (The signature Green Highlight Bar from the screenshot!) */}
      <div className="relative z-20 px-4 sm:px-8 py-3 bg-slate-950/40 backdrop-blur-md border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Action: View Rewards Pill Button and APK Standalone Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              sound.playClick();
              setIsRewardsOpen(true);
            }}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-display font-bold text-xs shadow-md border border-white flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <Gift className="w-3.5 h-3.5 text-amber-500" />
            <span>View Rewards</span>
          </button>

          {onOpenApkModal && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenApkModal();
              }}
              title="Install as Standalone App or Download APK"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-display font-black text-xs shadow-md border border-amber-200 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Standalone APK</span>
            </button>
          )}
        </div>

        {/* Center/Right: Neon Lime-Green Pinned Bar matching screenshot */}
        <div className="flex-1 max-w-xl w-full h-12 px-4 rounded-xl bg-gradient-to-r from-[#bef264] to-[#a3e635] border-2 border-white shadow-xl flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono font-black text-base w-8 text-left text-slate-950">
              {userRank}
            </span>
            <span className="font-display font-black text-sm sm:text-base text-slate-950 truncate">
              {user.name}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <TierMedal tier={userTier} size="md" />
            <span className="font-mono font-black text-sm sm:text-base text-slate-950 tabular-nums">
              {user.points.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Rewards Modal */}
      {isRewardsOpen && <SeasonRewardsModal onClose={() => setIsRewardsOpen(false)} />}

      {/* Inspect Player Modal */}
      {inspectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-400 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Contender Dossier
              </span>
              <button
                onClick={() => setInspectedPlayer(null)}
                className="text-xs text-slate-400 hover:text-white font-semibold"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl shrink-0">
                {inspectedPlayer.character.avatarEmoji}
              </div>
              <div>
                <h4 className="font-display font-black text-xl text-white">
                  {inspectedPlayer.name}
                </h4>
                <div className="text-xs text-indigo-400 font-medium">
                  {inspectedPlayer.character.name}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Signature: {inspectedPlayer.character.specialMove}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 text-slate-900">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-[11px] text-slate-500 uppercase font-bold">Standing</div>
                <div className="font-mono font-bold text-lg mt-0.5">
                  #{inspectedPlayer.rank.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-[11px] text-slate-500 uppercase font-bold">Points</div>
                <div className="font-mono font-bold text-lg text-indigo-600 mt-0.5">
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
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-display font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>Challenge in Arena</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
