import React from 'react';
import { TIERS } from '../types/rank';
import { X, Trophy, Sparkles, Gift } from 'lucide-react';
import { TierMedal } from './TierMedal';

interface SeasonRewardsModalProps {
  onClose: () => void;
}

export const SeasonRewardsModal: React.FC<SeasonRewardsModalProps> = ({ onClose }) => {
  const rewardsList = [
    { tier: TIERS[0], crystals: '1,500 Chrono Crystals', title: 'Transcendent God of Ki', trophy: '🌌 Grand Dragon Trophy' },
    { tier: TIERS[1], crystals: '1,000 Chrono Crystals', title: 'Ultra Saiyan Elite', trophy: '🔥 Golden Aura Relic' },
    { tier: TIERS[2], crystals: '800 Chrono Crystals', title: 'Master Martial Artist', trophy: '👑 Silver Dragon Emblem' },
    { tier: TIERS[3], crystals: '600 Chrono Crystals', title: 'Veteran Contender', trophy: '💎 Diamond Tournament Crest' },
    { tier: TIERS[4], crystals: '400 Chrono Crystals', title: 'Competitive Fighter', trophy: '⚔️ Bronze Warrior Plaque' },
    { tier: TIERS[5], crystals: '250 Chrono Crystals', title: 'Adept Contender', trophy: '🛡️ Arena Defender Ribbon' },
    { tier: TIERS[6], crystals: '150 Chrono Crystals', title: 'Tournament Challenger', trophy: '🔰 Novice Fighter Band' },
    { tier: TIERS[7], crystals: '100 Chrono Crystals', title: 'Training Ground Scout', trophy: '🌱 Participation Seal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-white flex flex-col max-h-[88vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
              <span>Season Ranking Rewards</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Distributed to contenders at weekly season reset based on final standing.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {rewardsList.map((item) => (
            <div
              key={item.tier.id}
              className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <TierMedal tier={item.tier} size="md" />
                <div>
                  <div className="font-display font-bold text-white text-sm">
                    {item.tier.name} ({item.tier.minPoints.toLocaleString()}+ pts)
                  </div>
                  <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 mt-0.5">
                    <Gift className="w-3.5 h-3.5" />
                    <span>{item.crystals}</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs">
                <div className="text-indigo-400 font-medium">{item.title}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{item.trophy}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-display font-bold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25"
        >
          Close
        </button>
      </div>
    </div>
  );
};
