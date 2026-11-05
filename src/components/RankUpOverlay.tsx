import React, { useEffect, useState, useMemo } from 'react';
import { TierDefinition } from '../types/rank';
import { sound } from '../lib/audio';
import { Sparkles, RotateCcw } from 'lucide-react';

interface RankUpOverlayProps {
  previousTier: TierDefinition;
  newTier: TierDefinition;
  onClose: () => void;
}

export const RankUpOverlay: React.FC<RankUpOverlayProps> = ({
  previousTier,
  newTier,
  onClose,
}) => {
  // Phase 1: 'SHAKE_CHARGE' (power build-up & seismic vibration)
  // Phase 2: 'EVOLVED' (breakthrough shockwave, morphing badge, radiant aura glow)
  const [phase, setPhase] = useState<'SHAKE_CHARGE' | 'EVOLVED'>('SHAKE_CHARGE');
  const [effectCounter, setEffectCounter] = useState(0);

  const triggerEvolutionSequence = () => {
    setPhase('SHAKE_CHARGE');
    sound.playScouter();

    const timer = setTimeout(() => {
      setPhase('EVOLVED');
      sound.playRankUp();
    }, 750);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    const cleanup = triggerEvolutionSequence();
    const autoDismiss = setTimeout(() => {
      onClose();
    }, 6000);

    return () => {
      cleanup();
      clearTimeout(autoDismiss);
    };
  }, [effectCounter, onClose]);

  // Generate 65 confetti pieces with varied colors and trajectories
  const confettiList = useMemo(() => {
    const colors = [newTier.color, previousTier.color, '#ffd54a', '#ff6b9a', '#ffffff', '#38bdf8', '#a855f7'];
    return Array.from({ length: 65 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[i % colors.length],
      duration: 1.8 + Math.random() * 1.6,
      delay: Math.random() * 0.8,
      size: 6 + Math.random() * 8,
    }));
  }, [newTier, previousTier, effectCounter]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md select-none overflow-hidden text-center p-6 transition-opacity duration-300">
      {/* Spinning Rays Backdrop */}
      <div
        className="absolute w-[180vmax] h-[180vmax] pointer-events-none opacity-25 animate-spin-slow"
        style={{
          background: 'repeating-conic-gradient(rgba(255,255,255,0.4) 0deg 6deg, transparent 6deg 18deg)',
          maskImage: 'radial-gradient(circle, #000 0%, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(circle, #000 0%, transparent 65%)',
        }}
      />

      {/* Confetti Particles (Trigger on evolved breakthrough) */}
      {phase === 'EVOLVED' &&
        confettiList.map((c) => (
          <span
            key={c.id}
            className="absolute pointer-events-none z-10"
            style={{
              left: `${c.left}%`,
              top: '-20px',
              backgroundColor: c.color,
              width: `${c.size}px`,
              height: `${c.size * 1.6}px`,
              borderRadius: '2px',
              animation: `confettiFall ${c.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${c.delay}s forwards`,
            }}
          />
        ))}

      {/* Center Rank Evolution Showcase */}
      <div className="relative z-20 flex flex-col items-center max-w-md mx-auto">
        {/* Kinetic Badge Container */}
        <div className="relative flex items-center justify-center w-52 h-52 sm:w-60 sm:h-60 mb-4">
          {/* Shockwave Aura Rings during Evolved Phase */}
          {phase === 'EVOLVED' && (
            <>
              <div
                className="absolute inset-0 rounded-full border-4 border-amber-400/80 animate-shockwave pointer-events-none"
                style={{ borderColor: newTier.color }}
              />
              <div
                className="absolute inset-4 rounded-full border-2 border-white/60 animate-shockwave pointer-events-none"
                style={{ animationDelay: '0.4s' }}
              />
            </>
          )}

          {/* Phase 1: Seismic Shake Pre-Evolution */}
          {phase === 'SHAKE_CHARGE' && (
            <div className="flex flex-col items-center animate-tier-shake">
              <div className="text-8xl sm:text-9xl mb-2 filter drop-shadow-2xl">
                {previousTier.icon}
              </div>
              <div
                className="px-6 py-2 rounded-2xl text-2xl sm:text-3xl font-display font-black text-white shadow-2xl border-2 border-white/30"
                style={{ backgroundColor: previousTier.color }}
              >
                {previousTier.name}
              </div>
              <div className="text-amber-400 font-mono text-xs uppercase tracking-widest font-black mt-2 animate-pulse flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ascending Power Level...</span>
              </div>
            </div>
          )}

          {/* Phase 2: Radiant Ki Glow & Morphing Badge Evolution */}
          {phase === 'EVOLVED' && (
            <div className="flex flex-col items-center animate-badge-evolve">
              <div className="text-8xl sm:text-9xl mb-2 filter drop-shadow-2xl">
                {newTier.icon}
              </div>
              <div
                className="px-8 py-3 rounded-2xl text-4xl sm:text-5xl font-display font-black text-white shadow-2xl tracking-wider border-2 border-white/50 animate-tier-glow"
                style={{
                  backgroundColor: newTier.color,
                }}
              >
                {newTier.name}
              </div>
            </div>
          )}
        </div>

        {/* Title and Transition Tagline */}
        <h2 className="font-display font-black text-3xl sm:text-4xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-amber-200 uppercase drop-shadow-md">
          {phase === 'SHAKE_CHARGE' ? 'POWER AWAKENING...' : 'RANK UP ACHIEVED!'}
        </h2>

        <div className="text-lg sm:text-xl text-slate-300 mt-2 font-medium flex items-center justify-center gap-3">
          <span className="opacity-75">{previousTier.name}</span>
          <span className="text-amber-400 font-bold">➔</span>
          <span
            className="font-bold underline underline-offset-4 decoration-amber-400 text-white"
            style={{ color: phase === 'EVOLVED' ? newTier.color : '#ffffff' }}
          >
            {newTier.name} ({newTier.minPoints.toLocaleString()} PTS)
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
          {newTier.tagline} · Advanced combat division unlocked in the Tenkaichi Circuit.
        </p>

        {/* Action Controls: Replay Transition or Dismiss */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEffectCounter((c) => c + 1);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Evolution</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 transition-transform active:scale-95"
          >
            Continue to Arena
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-3 tracking-wider uppercase font-medium">
          Tap outside or press continue to proceed
        </p>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
