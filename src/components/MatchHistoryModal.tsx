import React, { useMemo, useState } from 'react';
import { MatchRecord, CHARACTERS } from '../types/rank';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  History,
  Swords,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Percent,
  Flame,
  Award,
} from 'lucide-react';
import { sound } from '../lib/audio';

interface MatchHistoryModalProps {
  history: MatchRecord[];
  onClearHistory: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      matchNum: number;
      opponent: string;
      result: 'VICTORY' | 'DEFEAT';
      winRate: number;
      points: number;
      delta: number;
    };
  }>;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isWin = data.result === 'VICTORY';

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-xl text-xs space-y-1.5 min-w-[170px]">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
          <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
            Match #{data.matchNum}
          </span>
          <span
            className={`font-display font-black px-1.5 py-0.5 rounded text-[10px] ${
              isWin
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {data.result}
          </span>
        </div>

        <div className="text-slate-700 dark:text-slate-300">
          vs <b className="text-slate-900 dark:text-white">{data.opponent}</b>
        </div>

        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Cumulative Win Rate:</span>
          <b className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">
            {data.winRate}%
          </b>
        </div>

        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>MMR Standing:</span>
          <b className="font-mono text-slate-900 dark:text-white">
            {data.points.toLocaleString()} pts
          </b>
        </div>
      </div>
    );
  }
  return null;
};

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  history,
  onClearHistory,
}) => {
  const [chartMetric, setChartMetric] = useState<'WIN_RATE' | 'MMR'>('WIN_RATE');

  // Compute trend data for the last 20 matches (or fewer if total < 20)
  const { chartData, last20Wins, last20Losses, windowWinRate, netPoints, recentForm } = useMemo(() => {
    const recent = history.slice(0, 20);
    const chronological = [...recent].reverse();

    let wins = 0;
    let losses = 0;
    let net = 0;

    const data = chronological.map((record, index) => {
      const isWin = record.result === 'VICTORY';
      if (isWin) wins++;
      else losses++;

      net += isWin ? record.pointsChange : -record.pointsChange;
      const matchNum = index + 1;
      const currentWinRate = Math.round((wins / matchNum) * 100);

      return {
        matchNum,
        label: `M${matchNum}`,
        opponent: record.opponentName,
        result: record.result,
        winRate: currentWinRate,
        points: record.finalPoints,
        delta: record.pointsChange,
      };
    });

    const totalInWindow = recent.length;
    const rate = totalInWindow > 0 ? Math.round((wins / totalInWindow) * 100) : 0;
    // Recent 5 form (from newest)
    const form = recent.slice(0, 5).map((r) => r.result === 'VICTORY');

    return {
      chartData: data,
      last20Wins: wins,
      last20Losses: losses,
      windowWinRate: rate,
      netPoints: net,
      recentForm: form,
    };
  }, [history]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
              Season Match Ledger & Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {history.length} logged bouts · Recharts win-rate trajectory over your last 20 matches
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              sound.playClick();
              if (confirm('Clear local match history? Your rank and points remain intact.')) {
                onClearHistory();
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Ledger</span>
          </button>
        )}
      </div>

      {/* Visual Recharts Trend Section */}
      {history.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          {/* Chart Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Progression Trend (Last {Math.min(20, history.length)} Matches)
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cumulative win/loss ratio evolution across your recent competitive encounters
              </p>
            </div>

            {/* Metric Toggle Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => {
                  sound.playClick();
                  setChartMetric('WIN_RATE');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  chartMetric === 'WIN_RATE'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Win Rate %
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setChartMetric('MMR');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  chartMetric === 'MMR'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                MMR Points
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Window Record
              </div>
              <div className="font-mono font-bold text-lg text-slate-900 dark:text-white mt-0.5">
                <span className="text-emerald-600 dark:text-emerald-400">{last20Wins}W</span>
                <span className="text-slate-400 mx-1">-</span>
                <span className="text-rose-600 dark:text-rose-400">{last20Losses}L</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3 h-3 text-indigo-500" />
                <span>Window Win Rate</span>
              </div>
              <div className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 mt-0.5">
                {windowWinRate}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-500" />
                <span>Net MMR Delta</span>
              </div>
              <div
                className={`font-mono font-bold text-lg mt-0.5 ${
                  netPoints >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {netPoints >= 0 ? `+${netPoints}` : netPoints} pts
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span>Recent 5 Form</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {recentForm.map((win, idx) => (
                  <span
                    key={idx}
                    className={`w-5 h-5 rounded-md font-mono text-[10px] font-black flex items-center justify-center text-white ${
                      win ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  >
                    {win ? 'W' : 'L'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="mmrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />

                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1', opacity: 0.2 }}
                />

                {chartMetric === 'WIN_RATE' ? (
                  <>
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(val) => `${val}%`}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1', opacity: 0.2 }}
                    />
                    <ReferenceLine
                      y={50}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      label={{
                        value: '50% Baseline',
                        fill: '#94a3b8',
                        fontSize: 10,
                        position: 'insideBottomRight',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="winRate"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#winRateGradient)"
                      activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: '#6366f1' }}
                    />
                  </>
                ) : (
                  <>
                    <YAxis
                      domain={['auto', 'auto']}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1', opacity: 0.2 }}
                      tickFormatter={(val) => `${val}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="points"
                      stroke="#ec4899"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#mmrGradient)"
                      activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: '#ec4899' }}
                    />
                  </>
                )}

                <Tooltip content={<CustomChartTooltip />} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Swords className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="font-display font-bold text-base text-slate-700 dark:text-slate-300">
            No matches logged yet this season
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Queue an Arena Match or use the quick "I Won / I Lost" buttons to record your competitive bouts and visualize your win-rate trend.
          </p>
        </div>
      ) : (
        /* Match Ledger List */
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="h-11 px-4 sm:px-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Encounter Details</span>
            <span>MMR Result</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((record) => {
              const isWin = record.result === 'VICTORY';
              const isSafe = !isWin && record.pointsChange === 0;
              const oppChar = CHARACTERS.find((c) => c.id === record.opponentCharacterId) || CHARACTERS[0];
              const dateStr = new Date(record.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={record.id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="shrink-0">
                      {isWin ? (
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                          <XCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-display font-black text-xs px-2 py-0.5 rounded ${
                            isWin ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                          }`}
                        >
                          {record.result}
                        </span>
                        <span className="font-display font-bold text-slate-900 dark:text-white truncate">
                          vs {record.opponentName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          (#{record.opponentRank.toLocaleString()})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>
                          {oppChar.avatarEmoji} {oppChar.name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{record.mode === 'ARENA' ? 'Arena Bo3 Duel' : 'Quick Match'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px] text-slate-400">{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-sm sm:text-base">
                      {isWin ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          +{record.pointsChange} pts
                        </span>
                      ) : isSafe ? (
                        <span className="text-indigo-600 dark:text-indigo-400 flex items-center justify-end gap-1 text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Safe (0 pts)</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">
                          -{record.pointsChange} pts
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {record.finalPoints.toLocaleString()} PTS total
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
