import React, { useState, useEffect } from 'react';
import { PlayerProfile, FighterCharacter, TierDefinition, TIERS } from '../types/rank';
import { rankedEngine } from '../lib/engine';
import { sound } from '../lib/audio';
import { Swords, Flame, Trophy, ShieldCheck, Sparkles, TrendingUp, ChevronRight, Edit3 } from 'lucide-react';

interface MatchSectionProps {
  user: PlayerProfile;
  userCharacter: FighterCharacter;
  userTier: TierDefinition;
  userRank: number;
  onQuickMatch: (won: boolean) => void;
  onOpenArena: () => void;
  onOpenFighterSelect: () => void;
  onUpdateName: (name: string) => void;
  onTriggerChallenger: () => void;
  randomChallengesEnabled: boolean;
  onToggleRandomChallenges: () => void;
  onNavigateToRankings?: () => void;
}

export const MatchSection: React.FC<MatchSectionProps> = ({
  user,
  userCharacter,
  userTier,
  userRank,
  onQuickMatch,
  onOpenArena,
  onOpenFighterSelect,
  onUpdateName,
  onTriggerChallenger,
  randomChallengesEnabled,
  onToggleRandomChallenges,
  onNavigateToRankings,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [floatingFx, setFloatingFx] = useState<{ text: string; isGreen: boolean } | null>(null);
  const [cardFx, setCardFx] = useState<'glow' | 'shake' | null>(null);
  const [hottestStreakers, setHottestStreakers] = useState(rankedEngine.getHottestStreaks(3));

  // Determine next tier
  const currentTierIndex = TIERS.findIndex((t) => t.id === userTier.id);
  const nextTier: TierDefinition | null = currentTierIndex > 0 ? TIERS[currentTierIndex - 1] : null;

  // Calculate progress in current tier
  let progressPercent = 100;
  let pointsNeeded = 0;
  if (nextTier) {
    const tierSpan = nextTier.minPoints - userTier.minPoints;
    const progressInTier = Math.max(0, user.points - userTier.minPoints);
    progressPercent = Math.min(100, Math.max(0, (progressInTier / tierSpan) * 100));
    pointsNeeded = Math.max(0, nextTier.minPoints - user.points);
  }

  // Refresh hottest streaks periodically
  useEffect(() => {
    setHottestStreakers(rankedEngine.getHottestStreaks(3));
  }, [user.matches]);

  const handleQuickWin = () => {
    sound.playVictorySequence();
    const d = 22 + Math.floor(Math.random() * 9);
    setFloatingFx({ text: `+${d} PTS`, isGreen: true });
    setCardFx('glow');
    setTimeout(() => setFloatingFx(null), 1200);
    setTimeout(() => setCardFx(null), 700);
    onQuickMatch(true);
  };

  const handleQuickLoss = () => {
    const isSafe = user.points < 1500;
    sound.playDefeatSequence(isSafe);
    const d = 22 + Math.floor(Math.random() * 9);
    setFloatingFx({ text: isSafe ? 'SAFE!' : `-${d} PTS`, isGreen: isSafe });
    setCardFx('shake');
    setTimeout(() => setFloatingFx(null), 1200);
    setTimeout(() => setCardFx(null), 700);
    onQuickMatch(false);
  };

  const handleSaveName = () => {
    const trimmed = tempName.trim() || 'You';
    onUpdateName(trimmed);
    setIsEditingName(false);
  };

  const winRate = user.matches > 0 ? Math.round((user.wins / user.matches) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Cinematic Arena Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg h-44 sm:h-52 bg-slate-900">
        <img
          src="/src/assets/images/tenkaichi_arena_hero_1793910743091.jpg"
          alt="Tenkaichi Budokai Tournament Arena"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5 sm:p-7">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Budokai Tenkaichi Championship Circuit</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight drop-shadow-md">
            World Martial Arts Ranked Arena
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl line-clamp-1 mt-0.5">
            Log your matches, challenge ladder competitors, and climb from Novice D-Rank to the legendary Z-Rank.
          </p>
        </div>
      </div>

      {/* Main Fighter Card */}
      <div
        className={`relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-7 shadow-sm transition-all duration-300 ${
          cardFx === 'glow'
            ? 'ring-4 ring-emerald-500/40 shadow-emerald-500/20'
            : cardFx === 'shake'
            ? 'ring-4 ring-rose-500/30'
            : ''
        }`}
      >
        {/* Floating points indicator */}
        {floatingFx && (
          <div
            className={`absolute right-6 top-6 font-display font-black text-3xl sm:text-4xl pointer-events-none animate-bounce z-20 ${
              floatingFx.isGreen ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {floatingFx.text}
          </div>
        )}

        {/* Top Profile Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            {/* Fighter Avatar & Selector */}
            <div
              onClick={() => {
                sound.playClick();
                onOpenFighterSelect();
              }}
              title="Click to change fighter"
              className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-3xl shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
            >
              {userCharacter.avatarEmoji}
            </div>

            <div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={18}
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      className="px-2.5 py-1 text-base font-bold bg-slate-100 dark:bg-slate-800 border border-indigo-500 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                    <span className="font-display font-black text-xl text-slate-900 dark:text-white">
                      {user.name}
                    </span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                )}
              </div>

              <div
                onClick={() => {
                  sound.playClick();
                  onOpenFighterSelect();
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer hover:underline mt-0.5"
              >
                <span>{userCharacter.name}</span>
                <span className="text-slate-400 dark:text-slate-600">·</span>
                <span className="text-slate-500 dark:text-slate-400">{userCharacter.specialMove}</span>
                <ChevronRight className="w-3 h-3 ml-0.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Quick Win / Loss Logging */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickWin}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <span>I Won (+pts)</span>
            </button>

            <button
              onClick={handleQuickLoss}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <span>I Lost (-pts)</span>
            </button>
          </div>
        </div>

        {/* Big Standing & Rank Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          {/* Rank Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 relative overflow-hidden">
            <div
              key={userTier.id}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-md shrink-0 animate-badge-evolve"
              style={{
                backgroundColor: userTier.color,
                boxShadow: `0 0 16px ${userTier.color}88`,
              }}
            >
              {userTier.id}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Current Division
              </div>
              <div className="font-display font-bold text-base text-slate-900 dark:text-white">
                {userTier.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {userTier.tagline}
              </div>
            </div>
          </div>

          {/* Global Standing */}
          <div
            onClick={onNavigateToRankings}
            title="Click to view Dragon Ball Rankings screen"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer group"
          >
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Global Standing</span>
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline">
                View Screen →
              </span>
            </div>
            <div className="font-mono font-black text-2xl text-slate-900 dark:text-white mt-1">
              #{userRank.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              out of 60,001 active fighters
            </div>
          </div>

          {/* Points */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span>Ranked MMR</span>
            </div>
            <div className="font-mono font-black text-2xl text-indigo-600 dark:text-indigo-400 mt-1">
              {user.points.toLocaleString()} <span className="text-sm font-bold text-slate-500">PTS</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              {user.points < 1500 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Loss Shield Active</span>
                </span>
              ) : (
                <span>Competitive Loss Active</span>
              )}
            </div>
          </div>
        </div>

        {/* Animated Rank Progression Gauge */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            <div className="flex items-center gap-1.5">
              <span>Progress to next rank:</span>
              {nextTier ? (
                <span className="font-bold text-slate-900 dark:text-white">
                  {nextTier.name} ({nextTier.minPoints.toLocaleString()} PTS)
                </span>
              ) : (
                <span className="text-rose-500 font-bold">Z-Rank Apex Reached!</span>
              )}
            </div>
            <div className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {nextTier ? `${pointsNeeded.toLocaleString()} pts to rank up` : 'Maximum Prestige'}
            </div>
          </div>

          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out animate-shimmer"
              style={{
                width: `${progressPercent}%`,
                background: nextTier
                  ? `linear-gradient(90deg, ${userTier.color}, ${nextTier.color})`
                  : userTier.color,
              }}
            />
          </div>
        </div>

        {/* Primary Action Button: Arena Matchmaker */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onOpenArena();
            }}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:opacity-95 text-white font-display font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-transform active:scale-[0.98]"
          >
            <Swords className="w-5 h-5" />
            <span>Queue Matchmaking (Find Opponent & Enter Results)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onTriggerChallenger();
            }}
            title="Simulate a rival from the 60,000 pool finding and challenging you in the lobby right now"
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-display font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>Test Lobby Challenger</span>
          </button>
        </div>

        {/* Ambient Challenger Notification Status */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${randomChallengesEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>Lobby Match Alerts: {randomChallengesEnabled ? 'Active (Players find you while in Lobby)' : 'Muted'}</span>
          </span>
          <button
            onClick={onToggleRandomChallenges}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {randomChallengesEnabled ? 'Disable Random Challenges' : 'Enable Random Challenges'}
          </button>
        </div>

        {/* Performance Analytics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <div>
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Fights
            </div>
            <div className="font-mono font-bold text-lg text-slate-800 dark:text-slate-200 mt-0.5">
              {user.matches}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Win Rate
            </div>
            <div className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
              {winRate}%
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Current Streak
            </div>
            <div className="font-mono font-bold text-lg text-orange-500 mt-0.5 flex items-center justify-center gap-1">
              {user.streak > 0 && <Flame className="w-4 h-4 fill-orange-500" />}
              <span>{user.streak}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Season Best Streak
            </div>
            <div className="font-mono font-bold text-lg text-slate-800 dark:text-slate-200 mt-0.5">
              {user.highestStreak}
            </div>
          </div>
        </div>
      </div>

      {/* Hottest Streaks Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Hottest Win Streaks in the World
            </h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">Live 60,000 Contender Pool</span>
        </div>

        <div className="space-y-2">
          {hottestStreakers.map((streakPlayer, index) => (
            <div
              key={streakPlayer.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 w-5">
                  #{index + 1}
                </span>
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: streakPlayer.tier.color }}
                >
                  {streakPlayer.tier.id}
                </span>
                <span className="text-xl shrink-0">{streakPlayer.character.avatarEmoji}</span>
                <div className="truncate">
                  <div className="font-display font-bold text-slate-900 dark:text-white truncate">
                    {streakPlayer.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {streakPlayer.character.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-right">
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  {streakPlayer.matches} games
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-orange-500 text-sm">
                  <Flame className="w-4 h-4 fill-orange-500" />
                  <span>{streakPlayer.streak} Wins</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
