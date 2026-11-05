import React, { useState, useEffect } from 'react';
import { PlayerProfile, FighterCharacter, TierDefinition } from '../types/rank';
import { rankedEngine } from '../lib/engine';
import { sound } from '../lib/audio';
import {
  Swords,
  Flame,
  X,
  Shield,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Music,
  VolumeX,
  Radar,
  Radio,
  Trophy,
  ArrowRight,
} from 'lucide-react';

export interface OpponentMatchData {
  name: string;
  rank: number;
  points: number;
  tier: TierDefinition;
  character: FighterCharacter;
  streak: number;
  winRate: number;
  isChallenger?: boolean;
}

interface ArenaMatchModalProps {
  user: PlayerProfile;
  userCharacter: FighterCharacter;
  userTier: TierDefinition;
  userRank: number;
  initialOpponent?: OpponentMatchData | null;
  onFinishMatch: (
    won: boolean,
    delta: number,
    opponentName: string,
    opponentRank: number,
    opponentTier: string,
    opponentCharacterId: string,
    scores: string
  ) => void;
  onClose: () => void;
}

export const ArenaMatchModal: React.FC<ArenaMatchModalProps> = ({
  user,
  userCharacter,
  userTier,
  userRank,
  initialOpponent,
  onFinishMatch,
  onClose,
}) => {
  const [opponent, setOpponent] = useState<OpponentMatchData | null>(initialOpponent || null);
  const [phase, setPhase] = useState<'SEARCHING' | 'LOCKED_IN' | 'SUBMITTED'>(
    initialOpponent ? 'LOCKED_IN' : 'SEARCHING'
  );

  // Search countdown seconds
  const [searchSeconds, setSearchSeconds] = useState(0);

  // Manual result entry state
  const [selectedOutcome, setSelectedOutcome] = useState<'VICTORY' | 'DEFEAT' | null>(null);
  const [selectedScore, setSelectedScore] = useState<string>('3 - 1');
  const [pointsDelta, setPointsDelta] = useState(25);
  const [rematchCount, setRematchCount] = useState(0);
  const [isMusicActive, setIsMusicActive] = useState(true);

  // Start matchmaking music when modal opens
  useEffect(() => {
    sound.startMatchmakingMusic();
    setIsMusicActive(!sound.getMuted());

    return () => {
      sound.stopMatchmakingMusic();
    };
  }, []);

  // Multi-second realistic matchmaking search
  useEffect(() => {
    if (!initialOpponent && phase === 'SEARCHING') {
      const searchDurationMs = 3200 + Math.random() * 1800; // 3.2s to 5.0s
      const startTime = Date.now();

      const ticker = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setSearchSeconds(elapsed);
      }, 500);

      const timer = setTimeout(() => {
        clearInterval(ticker);
        const opp = rankedEngine.findOpponentNearPoints(user.points);
        setOpponent(opp);
        setPhase('LOCKED_IN');
        sound.playScouter();
      }, searchDurationMs);

      return () => {
        clearInterval(ticker);
        clearTimeout(timer);
      };
    }
  }, [initialOpponent, phase, user.points]);

  // Set randomized delta on load
  useEffect(() => {
    setPointsDelta(22 + Math.floor(Math.random() * 9));
  }, [rematchCount]);

  const toggleBgm = () => {
    sound.toggleMute();
    setIsMusicActive(!sound.getMuted());
  };

  const handleManualSubmit = () => {
    if (!opponent || !selectedOutcome) return;
    const isWin = selectedOutcome === 'VICTORY';

    if (isWin) {
      sound.playVictorySequence();
    } else {
      sound.playDefeatSequence(user.points < 1500);
    }

    setPhase('SUBMITTED');
  };

  const handleDoneAndExit = () => {
    if (!opponent || !selectedOutcome) return;
    onFinishMatch(
      selectedOutcome === 'VICTORY',
      pointsDelta,
      opponent.name,
      opponent.rank,
      opponent.tier.id,
      opponent.character.id,
      selectedScore
    );
  };

  const handleRematch = () => {
    if (!opponent || !selectedOutcome) return;
    // Commit the current match to history & ladder
    onFinishMatch(
      selectedOutcome === 'VICTORY',
      pointsDelta,
      opponent.name,
      opponent.rank,
      opponent.tier.id,
      opponent.character.id,
      selectedScore
    );

    // Reset for next manual rematch
    sound.playScouter();
    setRematchCount((prev) => prev + 1);
    setSelectedOutcome(null);
    setSelectedScore('3 - 1');
    setPointsDelta(22 + Math.floor(Math.random() * 9));
    setPhase('LOCKED_IN');
  };

  const isSafeLoss = selectedOutcome === 'DEFEAT' && user.points < 1500;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden transition-colors">
        {/* Top Controls: Music toggle & Close */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={toggleBgm}
            title={isMusicActive ? 'Mute Matchmaking BGM' : 'Unmute Matchmaking BGM'}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isMusicActive ? (
              <Music className="w-4 h-4 text-indigo-500 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase 1: Realistic Matchmaking Queue with multi-second wait */}
        {phase === 'SEARCHING' && (
          <div className="py-10 text-center flex flex-col items-center">
            <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
              {/* Radar pulse ripples */}
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/40 animate-ping opacity-75" />
              <div className="absolute inset-3 rounded-full border border-purple-500/50 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/60 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Radar className="w-9 h-9 text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 text-xs font-bold uppercase tracking-wider mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
              <span>Scanning 60,000 Contenders...</span>
            </div>

            <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
              Searching for Ranked Matchup
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Finding an active opponent in your skill bracket (±150 MMR). Matchmaking music is playing.
            </p>

            <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg mt-4 border border-slate-200 dark:border-slate-700">
              Elapsed Time: 0:0{searchSeconds}
            </div>

            <button
              onClick={onClose}
              className="mt-6 text-xs text-slate-400 hover:text-rose-500 font-semibold transition-colors"
            >
              Cancel Matchmaking
            </button>
          </div>
        )}

        {/* Phase 2: Locked-In Matchup & Manual Result Entry */}
        {phase === 'LOCKED_IN' && opponent && (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 text-xs font-bold uppercase tracking-wider mb-1">
                <Swords className="w-3.5 h-3.5" />
                <span>
                  {opponent.isChallenger
                    ? '⚡ Challenger Encounter'
                    : rematchCount > 0
                    ? `Rematch Bout · Round ${rematchCount + 1}`
                    : 'Matchup Locked In'}
                </span>
              </div>
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Key In Match Results
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Fight your bout in-game, then manually record whether you won or lost.
              </p>
            </div>

            {/* VS Contender Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl mb-6">
              {/* Player Side */}
              <div className="sm:col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="text-3xl mb-1">{userCharacter.avatarEmoji}</div>
                <div className="font-display font-bold text-base text-slate-900 dark:text-white truncate max-w-[180px]">
                  {user.name}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {userCharacter.name}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold text-white"
                    style={{ backgroundColor: userTier.color }}
                  >
                    {userTier.id}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    #{userRank.toLocaleString()}
                  </span>
                  {user.streak > 0 && (
                    <span className="flex items-center gap-0.5 text-xs font-bold text-orange-500">
                      <Flame className="w-3 h-3 fill-orange-500" />
                      <span>{user.streak}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* VS Badge */}
              <div className="sm:col-span-1 flex flex-col items-center justify-center my-2 sm:my-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white font-display font-black text-lg flex items-center justify-center shadow-lg shadow-rose-500/30">
                  VS
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-1">
                  Ranked Bout
                </span>
              </div>

              {/* Opponent Side */}
              <div className="sm:col-span-2 flex flex-col items-center sm:items-end text-center sm:text-right">
                <div className="text-3xl mb-1">{opponent.character.avatarEmoji}</div>
                <div className="font-display font-bold text-base text-slate-900 dark:text-white truncate max-w-[180px]">
                  {opponent.name}
                </div>
                <div className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                  {opponent.character.name}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {opponent.streak > 0 && (
                    <span className="flex items-center gap-0.5 text-xs font-bold text-orange-500">
                      <Flame className="w-3 h-3 fill-orange-500" />
                      <span>{opponent.streak}</span>
                    </span>
                  )}
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    #{opponent.rank.toLocaleString()}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold text-white"
                    style={{ backgroundColor: opponent.tier.color }}
                  >
                    {opponent.tier.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Result Input Section */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 mb-6">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-3">
                1. Select Match Result:
              </div>

              {/* Win / Loss Selector */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedOutcome('VICTORY');
                    setSelectedScore('3 - 1');
                  }}
                  className={`py-3.5 px-4 rounded-xl border-2 font-display font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    selectedOutcome === 'VICTORY'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>I Won (+{pointsDelta} pts)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedOutcome('DEFEAT');
                    setSelectedScore('1 - 3');
                  }}
                  className={`py-3.5 px-4 rounded-xl border-2 font-display font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    selectedOutcome === 'DEFEAT'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shadow-md shadow-rose-500/20 scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <span>
                    I Lost ({user.points < 1500 ? 'Safe · 0 pts' : `-${pointsDelta} pts`})
                  </span>
                </button>
              </div>

              {/* Round Score Selector */}
              {selectedOutcome && (
                <div className="animate-fadeIn">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                    2. Select Round Breakdown:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(selectedOutcome === 'VICTORY'
                      ? ['3 - 0 (Sweep)', '3 - 1', '3 - 2 (Clutch)']
                      : ['2 - 3 (Clutch Loss)', '1 - 3', '0 - 3']
                    ).map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedScore(sc);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          selectedScore === sc
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleManualSubmit}
              disabled={!selectedOutcome}
              className={`w-full py-4 px-6 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${
                selectedOutcome
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:opacity-95 text-white shadow-lg shadow-indigo-600/30 active:scale-[0.98] cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Record & Key In Result</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Phase 3: Submitted Result with Rematch and Exit */}
        {phase === 'SUBMITTED' && opponent && selectedOutcome && (
          <div className="animate-fadeIn">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                {selectedOutcome === 'VICTORY' ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-500" />
                )}
                <span className="font-display font-black text-2xl text-slate-900 dark:text-white">
                  {selectedOutcome === 'VICTORY' ? 'VICTORY RECORDED!' : 'DEFEAT RECORDED'}
                </span>
              </div>

              <div className="font-mono text-sm text-slate-600 dark:text-slate-300 mb-2">
                Round Score:{' '}
                <b className="text-slate-900 dark:text-white">{selectedScore}</b> vs{' '}
                <b className="text-slate-900 dark:text-white">{opponent.name}</b>
              </div>

              <div className="text-sm font-semibold">
                {selectedOutcome === 'VICTORY' ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    +{pointsDelta} Ranked MMR Points Gained
                  </span>
                ) : isSafeLoss ? (
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Loss Shield Active (Safe below 1,500 pts)</span>
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">
                    -{pointsDelta} Ranked MMR Points Deducted
                  </span>
                )}
              </div>
            </div>

            {/* Rematch or Finish Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleRematch}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-xl border-2 border-indigo-600 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-display font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rematch {opponent.name} (Round {rematchCount + 2})</span>
              </button>

              <button
                onClick={handleDoneAndExit}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-display font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <span>Commit & Return to Lobby</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
