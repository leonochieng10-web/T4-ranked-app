import React from 'react';
import { Volume2, VolumeX, Sun, Moon, Zap, Swords, Globe, Users, History, Trophy, Smartphone } from 'lucide-react';
import { sound } from '../lib/audio';

interface TopNavProps {
  activeTab: 'play' | 'rankings' | 'history' | 'tiers';
  setActiveTab: (tab: 'play' | 'rankings' | 'history' | 'tiers') => void;
  isDark: boolean;
  toggleTheme: () => void;
  onSimulateTick: () => void;
  onOpenApkModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleTheme,
  onSimulateTick,
  onOpenApkModal,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleSoundToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const navItems = [
    { id: 'play', label: 'Lobby & Duel', icon: Swords },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
    { id: 'history', label: 'Match History', icon: History },
    { id: 'tiers', label: 'Rank Matrix', icon: Globe },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-display font-black text-lg tracking-wider">
            T4
          </div>
          <span className="font-display font-black text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            TENKAICHI 4 <span className="text-indigo-600 dark:text-indigo-400 font-bold">RANKED</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(item.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onOpenApkModal();
            }}
            title="Install as Standalone App or Download APK"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400 transition-all shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Standalone APK</span>
            <span className="sm:hidden">APK</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onSimulateTick();
            }}
            title="Simulate background player matches immediately"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulate Step</span>
          </button>

          <button
            onClick={handleSoundToggle}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              toggleTheme();
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar below top header */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
