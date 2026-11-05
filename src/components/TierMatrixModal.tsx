import React from 'react';
import { TIERS } from '../types/rank';
import { rankedEngine, LOSS_PREVENTION_THRESHOLD } from '../lib/engine';
import { Trophy, ShieldCheck, ShieldAlert, Sparkles, Flame, Check } from 'lucide-react';

export const TierMatrixModal: React.FC = () => {
  const tierCounts = rankedEngine.getTierCounts();
  const totalContenders = 60000;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
              Official Tenkaichi 4 Ranking Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The 8 competitive divisions of the Tenkaichi Budokai ladder system.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Starting Placement</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Every contender commences weekly seasons at <b>1,000 PTS (D-Rank)</b>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Loss Protection</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Below <b>1,500 PTS (B-Rank)</b>, defeats deduct 0 points. You cannot fall out of D or C through losses.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Competitive Stakes</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              From <b>B-Rank to Z-Rank</b>, defeats deduct 22 to 30 points. Win streaks grant matchmaking momentum.
            </p>
          </div>
        </div>
      </div>

      {/* The 8 Tiers Breakdown */}
      <div className="space-y-3">
        {TIERS.map((tier) => {
          const count = tierCounts[tier.id] || 0;
          const percentage = ((count / totalContenders) * 100).toFixed(1);
          const isLossProtected = tier.minPoints < LOSS_PREVENTION_THRESHOLD;

          return (
            <div
              key={tier.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-md shrink-0"
                  style={{ backgroundColor: tier.color }}
                >
                  <span className="text-lg">{tier.icon}</span>
                  <span className="font-display font-black text-sm leading-none mt-0.5">{tier.id}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                      {tier.name}
                    </h4>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {tier.minPoints.toLocaleString()}+ PTS
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {tier.tagline}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    {isLossProtected ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Loss Protected (0 pts lost)</span>
                      </span>
                    ) : (
                      <span className="text-rose-500 font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Loss Penalties Active (-22 to -30 pts)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                <div className="font-mono font-black text-base text-slate-900 dark:text-white">
                  {count.toLocaleString()} Fighters
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {percentage}% of active playerbase
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
