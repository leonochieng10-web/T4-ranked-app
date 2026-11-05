import React from 'react';
import { TierDefinition } from '../types/rank';

interface TierMedalProps {
  tier: TierDefinition;
  size?: 'sm' | 'md' | 'lg';
}

export const TierMedal: React.FC<TierMedalProps> = ({ tier, size = 'md' }) => {
  // Medal colors based on division
  const isApex = tier.id === 'Z' || tier.id === 'SS';
  const isGold = tier.id === 'S' || tier.id === 'A';
  const isSilver = tier.id === 'B' || tier.id === 'C';

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size];

  const medalGradient = isApex
    ? 'from-rose-400 via-amber-300 to-rose-600 border-amber-300 shadow-rose-500/40'
    : isGold
    ? 'from-amber-200 via-yellow-400 to-amber-600 border-yellow-200 shadow-amber-500/40'
    : isSilver
    ? 'from-slate-200 via-sky-300 to-slate-400 border-sky-100 shadow-sky-500/30'
    : 'from-purple-300 via-indigo-400 to-purple-600 border-indigo-200 shadow-indigo-500/30';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-b ${medalGradient} font-display font-black text-slate-950 border-2 shadow-md shrink-0 select-none ${sizeClasses}`}
      style={{
        boxShadow: `0 2px 6px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.7)`,
      }}
      title={`${tier.name} Medal`}
    >
      {/* Metallic highlight arc */}
      <div className="absolute inset-0.5 rounded-full border-t border-white/70 pointer-events-none" />
      <span className="drop-shadow-xs tracking-tighter">
        {tier.id}
      </span>
    </div>
  );
};
