import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayerProfile, FighterCharacter, TierDefinition, MatchRecord, CHARACTERS, TIERS } from './types/rank';
import { rankedEngine, tierForPoints, START_POINTS, LOSS_PREVENTION_THRESHOLD, WEEK_MS } from './lib/engine';
import { TopNav } from './components/TopNav';
import { SeasonBanner } from './components/SeasonBanner';
import { MatchSection } from './components/MatchSection';
import { GlobalLadder } from './components/GlobalLadder';
import { GroupSection } from './components/GroupSection';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { TierMatrixModal } from './components/TierMatrixModal';
import { ArenaMatchModal, OpponentMatchData } from './components/ArenaMatchModal';
import { FighterSelectModal } from './components/FighterSelectModal';
import { RankUpOverlay } from './components/RankUpOverlay';
import { SeasonResetOverlay } from './components/SeasonResetOverlay';
import { IncomingChallengerToast } from './components/IncomingChallengerToast';
import { AnimeRankingsView } from './components/AnimeRankingsView';
import { StandaloneApkModal } from './components/StandaloneApkModal';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('t4r_theme');
      if (stored !== null) return stored === 'dark';
      return true; // default dark for competitive anime gaming vibe
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('t4r_theme', isDark ? 'dark' : 'light');
    } catch {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Active navigation tab (Default to the Anime Rankings view requested in screenshot)
  const [activeTab, setActiveTab] = useState<'play' | 'rankings' | 'history' | 'tiers'>('rankings');

  // User profile state
  const [user, setUser] = useState<PlayerProfile>(() => {
    try {
      const stored = localStorage.getItem('t4r_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.season === rankedEngine.season) {
          return {
            name: parsed.name || 'You',
            points: typeof parsed.points === 'number' ? parsed.points : START_POINTS,
            matches: parsed.matches || 0,
            wins: parsed.wins || 0,
            losses: parsed.losses || 0,
            streak: parsed.streak || 0,
            highestStreak: parsed.highestStreak || 0,
            characterId: parsed.characterId || CHARACTERS[0].id,
          };
        }
      }
    } catch {}
    return {
      name: 'You',
      points: START_POINTS,
      matches: 0,
      wins: 0,
      losses: 0,
      streak: 0,
      highestStreak: 0,
      characterId: CHARACTERS[0].id,
    };
  });

  // Match ledger
  const [history, setHistory] = useState<MatchRecord[]>(() => {
    try {
      const stored = localStorage.getItem('t4r_history');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Rank movement tracker
  const [prevRank, setPrevRank] = useState<number | null>(null);
  const [rankDelta, setRankDelta] = useState<number>(0);

  // Modals & Overlays
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [arenaOpponent, setArenaOpponent] = useState<OpponentMatchData | null>(null);
  const [incomingChallenger, setIncomingChallenger] = useState<OpponentMatchData | null>(null);
  const [randomChallengesEnabled, setRandomChallengesEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('t4r_challenges_enabled');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isFighterSelectOpen, setIsFighterSelectOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [rankUpData, setRankUpData] = useState<{ previousTier: TierDefinition; newTier: TierDefinition } | null>(null);
  const [seasonResetData, setSeasonResetData] = useState<{
    finalRank: number;
    finalPoints: number;
    finalTier: TierDefinition;
    matchesPlayed: number;
    bestStreak: number;
  } | null>(null);

  // Timers and tickers
  const [timeRemainingStr, setTimeRemainingStr] = useState('');
  const [seasonProgressPercent, setSeasonProgressPercent] = useState(0);
  const [nextUpdateStr, setNextUpdateStr] = useState('');

  // Derived user stats
  const userRank = useMemo(() => rankedEngine.rankFor(user.points), [user.points]);
  const userTier = useMemo(() => tierForPoints(user.points), [user.points]);
  const userCharacter = useMemo(
    () => CHARACTERS.find((c) => c.id === user.characterId) || CHARACTERS[0],
    [user.characterId]
  );

  // Persist user & history
  useEffect(() => {
    try {
      localStorage.setItem(
        't4r_user',
        JSON.stringify({
          season: rankedEngine.season,
          ...user,
        })
      );
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('t4r_history', JSON.stringify(history.slice(0, 50)));
    } catch {}
  }, [history]);

  // Handle season reset
  const handleSeasonReset = useCallback(() => {
    const finalR = rankedEngine.rankFor(user.points);
    const finalT = tierForPoints(user.points);

    setSeasonResetData({
      finalRank: finalR,
      finalPoints: user.points,
      finalTier: finalT,
      matchesPlayed: user.matches,
      bestStreak: user.highestStreak,
    });

    // Reset engine and user for new season
    rankedEngine.startSeason();
    setUser((prev) => ({
      name: prev.name,
      points: START_POINTS,
      matches: 0,
      wins: 0,
      losses: 0,
      streak: 0,
      highestStreak: 0,
      characterId: prev.characterId,
    }));
    setPrevRank(null);
    setRankDelta(0);
  }, [user.points, user.matches, user.highestStreak]);

  // Timer loop
  useEffect(() => {
    const tick = () => {
      const now = rankedEngine.now();
      const left = rankedEngine.sEnd - now;

      if (left <= 0) {
        handleSeasonReset();
        return;
      }

      // Format remaining time
      const days = Math.floor(left / 86400000);
      const hours = String(Math.floor((left % 86400000) / 3600000)).padStart(2, '0');
      const mins = String(Math.floor((left % 3600000) / 60000)).padStart(2, '0');
      const secs = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
      setTimeRemainingStr(`${days}d ${hours}:${mins}:${secs}`);

      // Progress percent
      const progress = ((1 - left / WEEK_MS) * 100);
      setSeasonProgressPercent(progress);

      // Background MMR simulation check
      const untilNext = rankedEngine.nextLiveAt - Date.now();
      if (untilNext <= 0) {
        rankedEngine.simulateLiveStep();
      } else {
        const nextMins = Math.floor(untilNext / 60000);
        const nextSecs = String(Math.floor((untilNext % 60000) / 1000)).padStart(2, '0');
        setNextUpdateStr(`${nextMins}:${nextSecs}`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [handleSeasonReset]);

  // Ambient random challenger generator (rival player finds you at random intervals ONLY when in lobby)
  useEffect(() => {
    if (!randomChallengesEnabled || activeTab !== 'play') {
      return;
    }

    let timeoutId: number;
    const scheduleNextChallenge = () => {
      const delay = 40000 + Math.random() * 35000; // ~40-75s
      timeoutId = window.setTimeout(() => {
        // Double check user is still in the lobby (play tab) and not in a modal
        if (activeTab === 'play' && !isArenaOpen && !rankUpData && !seasonResetData && !incomingChallenger) {
          const opp = rankedEngine.findOpponentNearPoints(user.points);
          setIncomingChallenger({
            ...opp,
            isChallenger: true,
          });
        }
        scheduleNextChallenge();
      }, delay);
    };

    scheduleNextChallenge();
    return () => clearTimeout(timeoutId);
  }, [randomChallengesEnabled, activeTab, isArenaOpen, rankUpData, seasonResetData, incomingChallenger, user.points]);

  const handleToggleRandomChallenges = () => {
    setRandomChallengesEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('t4r_challenges_enabled', String(next));
      } catch {}
      return next;
    });
  };

  const handleTriggerManualChallenger = () => {
    const opp = rankedEngine.findOpponentNearPoints(user.points);
    setIncomingChallenger({
      ...opp,
      isChallenger: true,
    });
  };

  const handleAcceptChallenger = (challenger: OpponentMatchData) => {
    setArenaOpponent(challenger);
    setIsArenaOpen(true);
    setIncomingChallenger(null);
  };

  // Execute manual simulation step
  const handleSimulateTick = () => {
    rankedEngine.simulateLiveStep();
    // Update rank delta if changed
    const currentR = rankedEngine.rankFor(user.points);
    if (prevRank !== null) {
      setRankDelta(prevRank - currentR);
    }
    setPrevRank(currentR);
  };

  // Record a match outcome
  const recordMatchOutcome = (
    won: boolean,
    pointsDelta: number,
    oppName: string = 'Rival Contender',
    oppRank: number = 0,
    oppTierId: string = 'D',
    oppCharId: string = 'goku_blue',
    mode: 'QUICK' | 'ARENA' = 'QUICK'
  ) => {
    const previousPoints = user.points;
    const previousTier = tierForPoints(previousPoints);
    const isSafe = !won && previousPoints < LOSS_PREVENTION_THRESHOLD;

    const actualDelta = isSafe ? 0 : pointsDelta;
    const newPoints = Math.max(0, previousPoints + (won ? actualDelta : -actualDelta));
    const newTier = tierForPoints(newPoints);

    const newStreak = won ? user.streak + 1 : 0;
    const newHighest = Math.max(user.highestStreak, newStreak);

    // Compute rank delta
    const currentR = rankedEngine.rankFor(previousPoints);
    const nextR = rankedEngine.rankFor(newPoints);
    setRankDelta(currentR - nextR);
    setPrevRank(nextR);

    // Update user state
    setUser((prev) => ({
      ...prev,
      points: newPoints,
      matches: prev.matches + 1,
      wins: prev.wins + (won ? 1 : 0),
      losses: prev.losses + (won ? 0 : 1),
      streak: newStreak,
      highestStreak: newHighest,
    }));

    // Record to history ledger
    const newRecord: MatchRecord = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      opponentName: oppName,
      opponentRank: oppRank || Math.max(1, nextR + Math.floor(Math.random() * 20 - 10)),
      opponentTier: (oppTierId as MatchRecord['opponentTier']) || 'D',
      opponentCharacterId: oppCharId,
      result: won ? 'VICTORY' : 'DEFEAT',
      pointsChange: actualDelta,
      finalPoints: newPoints,
      streak: newStreak,
      mode,
    };
    setHistory((prev) => [newRecord, ...prev]);

    // Check for Rank Up celebration
    if (won && newTier.id !== previousTier.id) {
      setRankUpData({ previousTier, newTier });
    }
  };

  // Quick match buttons
  const handleQuickMatch = (won: boolean) => {
    const delta = 22 + Math.floor(Math.random() * 9);
    const opp = rankedEngine.findOpponentNearPoints(user.points);
    recordMatchOutcome(
      won,
      delta,
      opp.name,
      opp.rank,
      opp.tier.id,
      opp.character.id,
      'QUICK'
    );
  };

  // Finish Arena Bo3 simulation
  const handleFinishArenaMatch = (
    won: boolean,
    delta: number,
    opponentName: string,
    opponentRank: number,
    opponentTier: string,
    opponentCharacterId: string
  ) => {
    recordMatchOutcome(
      won,
      delta,
      opponentName,
      opponentRank,
      opponentTier,
      opponentCharacterId,
      'ARENA'
    );
    setIsArenaOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onSimulateTick={handleSimulateTick}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Season Timer & Status Banner */}
        <SeasonBanner
          seasonNumber={rankedEngine.season}
          timeRemainingStr={timeRemainingStr}
          seasonProgressPercent={seasonProgressPercent}
          nextUpdateStr={nextUpdateStr}
          onTestReset={() => rankedEngine.testFastForwardToReset()}
        />

        {/* Tab Routing */}
        {activeTab === 'play' && (
          <MatchSection
            user={user}
            userCharacter={userCharacter}
            userTier={userTier}
            userRank={userRank}
            onQuickMatch={handleQuickMatch}
            onOpenArena={() => {
              setArenaOpponent(null);
              setIsArenaOpen(true);
            }}
            onOpenFighterSelect={() => setIsFighterSelectOpen(true)}
            onUpdateName={(name) => setUser((prev) => ({ ...prev, name }))}
            onTriggerChallenger={handleTriggerManualChallenger}
            randomChallengesEnabled={randomChallengesEnabled}
            onToggleRandomChallenges={handleToggleRandomChallenges}
            onNavigateToRankings={() => setActiveTab('rankings')}
          />
        )}

        {activeTab === 'rankings' && (
          <AnimeRankingsView
            user={user}
            userRank={userRank}
            userRankDelta={rankDelta}
            seasonNumber={rankedEngine.season}
            onBackToLobby={() => setActiveTab('play')}
            onOpenArena={() => {
              setArenaOpponent(null);
              setIsArenaOpen(true);
            }}
            onOpenApkModal={() => setIsApkModalOpen(true)}
            onChallengePlayer={(name, rank, points, charId) => {
              setArenaOpponent({
                name,
                rank,
                points,
                tier: tierForPoints(points),
                character: CHARACTERS.find((c) => c.id === charId) || CHARACTERS[0],
                streak: 1,
                winRate: 54,
              });
              setIsArenaOpen(true);
            }}
          />
        )}

        {activeTab === 'history' && (
          <MatchHistoryModal
            history={history}
            onClearHistory={() => setHistory([])}
          />
        )}

        {activeTab === 'tiers' && <TierMatrixModal />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Tenkaichi 4 Ranked · Budokai Tournament Engine</span>
          <div className="flex items-center gap-4">
            <span>60,000 Contenders Online</span>
            <span aria-hidden="true">·</span>
            <span>Weekly Competitive Resets</span>
          </div>
        </div>
      </footer>

      {/* Arena Matchmaker Modal */}
      {isArenaOpen && (
        <ArenaMatchModal
          user={user}
          userCharacter={userCharacter}
          userTier={userTier}
          userRank={userRank}
          initialOpponent={arenaOpponent}
          onFinishMatch={handleFinishArenaMatch}
          onClose={() => {
            setIsArenaOpen(false);
            setArenaOpponent(null);
          }}
        />
      )}

      {/* Incoming Challenger Toast Alert (Only when in Lobby) */}
      {incomingChallenger && !isArenaOpen && activeTab === 'play' && (
        <IncomingChallengerToast
          challenger={incomingChallenger}
          onAccept={handleAcceptChallenger}
          onDecline={() => setIncomingChallenger(null)}
        />
      )}

      {/* Fighter Selection Modal */}
      {isFighterSelectOpen && (
        <FighterSelectModal
          selectedCharacterId={user.characterId}
          onSelectCharacter={(char) => setUser((prev) => ({ ...prev, characterId: char.id }))}
          onClose={() => setIsFighterSelectOpen(false)}
        />
      )}

      {/* Rank Up Celebration Overlay */}
      {rankUpData && (
        <RankUpOverlay
          previousTier={rankUpData.previousTier}
          newTier={rankUpData.newTier}
          onClose={() => setRankUpData(null)}
        />
      )}

      {/* Season Reset Celebration Overlay */}
      {seasonResetData && (
        <SeasonResetOverlay
          finalRank={seasonResetData.finalRank}
          finalPoints={seasonResetData.finalPoints}
          finalTier={seasonResetData.finalTier}
          matchesPlayed={seasonResetData.matchesPlayed}
          bestStreak={seasonResetData.bestStreak}
          onClose={() => setSeasonResetData(null)}
        />
      )}

      {/* Standalone APK & App Install Modal */}
      {isApkModalOpen && (
        <StandaloneApkModal onClose={() => setIsApkModalOpen(false)} />
      )}
    </div>
  );
}
