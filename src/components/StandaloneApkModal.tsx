import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  ExternalLink,
  Copy,
  Check,
  X,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { sound } from '../lib/audio';

interface StandaloneApkModalProps {
  onClose: () => void;
}

export const StandaloneApkModal: React.FC<StandaloneApkModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, platform, promptInstall } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [manifestCopied, setManifestCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'instant' | 'apk' | 'cli'>('instant');

  // Detect current origin or fallback to European Cloud Run staging URL
  const currentUrl = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-pre-nmmuykfskawrbqsdz2wefr-273024103151.europe-west2.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`;

  const manifestJsonString = JSON.stringify(
    {
      name: 'Tenkaichi 4 Ranked',
      short_name: 'T4 Ranked',
      description: 'Real-time competitive ranked ladder, matchmaking simulator, and 60,000-player tournament tracking engine with weekly seasons for Tenkaichi 4 / Sparking! ZERO.',
      id: '/',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: '#090d16',
      background_color: '#090d16',
      lang: 'en',
      dir: 'ltr',
      categories: ['games', 'entertainment', 'sports'],
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any',
        },
      ],
      screenshots: [
        {
          src: '/assets/aistudio/Screenshot_20260619-222427_09a6b0a2.jpg',
          sizes: '1080x2400',
          type: 'image/jpeg',
          form_factor: 'narrow',
          label: 'Tenkaichi 4 Ranked Matchmaking & Leaderboard',
        },
      ],
      prefer_related_applications: false,
    },
    null,
    2
  );

  const handleCopyManifest = () => {
    sound.playClick();
    navigator.clipboard.writeText(manifestJsonString);
    setManifestCopied(true);
    setTimeout(() => setManifestCopied(false), 2000);
  };

  const handleCopyUrl = () => {
    sound.playClick();
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstallClick = async () => {
    sound.playClick();
    if (isInstallable) {
      await promptInstall();
    } else {
      // Show guide
      setActiveTab('instant');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black tracking-wide text-white uppercase drop-shadow-sm flex items-center gap-2">
                Standalone App & APK
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 font-bold tracking-normal">
                  Android & Web
                </span>
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                Install directly on your phone or generate a standalone .APK package
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('instant');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'instant'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1-Tap Phone Install</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('apk');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'apk'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download .APK (PWABuilder)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('cli');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'cli'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Developer CLI / TWA</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* TAB 1: 1-Tap Phone Install (PWA Standalone) */}
          {activeTab === 'instant' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-300">
                  <strong className="text-amber-300 block text-sm mb-1 font-display">
                    Native Standalone Experience
                  </strong>
                  Installing the app places a dedicated <span className="text-white font-semibold">T4 Ranked icon</span> on your Android home screen and app drawer. It launches with full screen viewport, zero browser URL bar, offline persistence, and instant hardware-accelerated audio!
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Already Running in Standalone Mode!</div>
                    <div className="text-xs text-emerald-400/80">
                      The application is installed and running natively without browser chrome.
                    </div>
                  </div>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 text-slate-950 font-display font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Install Standalone App Now</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    How to install on Android in 5 seconds:
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <li>
                      Open this app in <span className="text-white font-semibold">Google Chrome</span> on your Android phone.
                    </li>
                    <li>
                      Tap the <span className="text-amber-400 font-semibold">three vertical dots (⋮)</span> in the top-right corner.
                    </li>
                    <li>
                      Select <span className="text-emerald-400 font-semibold">&ldquo;Install app&rdquo;</span> or <span className="text-emerald-400 font-semibold">&ldquo;Add to Home screen&rdquo;</span>.
                    </li>
                    <li>
                      Confirm <span className="text-white font-semibold">&ldquo;Install&rdquo;</span> — the standalone Tenkaichi 4 app icon appears on your home screen!
                    </li>
                  </ol>
                </div>
              )}

              {/* Share & Copy Link */}
              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  App URL to open on your Android device:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-600 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Download .APK via PWABuilder */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-300">
                  <strong className="text-amber-300 block text-sm mb-1 font-display">
                    Why does PWABuilder say &ldquo;Name / description missing&rdquo;?
                  </strong>
                  PWABuilder is an automated scanner. Because your dev environment is private to your Google account, PWABuilder gets redirected to Google&apos;s login check instead of your app.
                </div>
              </div>

              {/* Solution 1: Paste Manifest Directly */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    Quickest Fix: Copy &amp; Paste Manifest into PWABuilder
                  </span>
                  <button
                    onClick={handleCopyManifest}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    {manifestCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{manifestCopied ? 'Copied Manifest JSON!' : 'Copy Manifest JSON'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300">
                  In PWABuilder, click <strong className="text-white">&ldquo;Edit Manifest&rdquo;</strong> (or <strong className="text-white">&ldquo;Enter Manifest&rdquo;</strong>), paste this JSON, and click Save. PWABuilder will instantly recognize the app name, icons, and description!
                </p>
                <div className="max-h-36 overflow-y-auto p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                  <pre className="whitespace-pre-wrap">{manifestJsonString}</pre>
                </div>
              </div>

              {/* Solution 2: Click Share in AI Studio */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-slate-200 uppercase tracking-wider">
                  Alternative: Deploy Publicly via AI Studio &ldquo;Share&rdquo;
                </div>
                <p>
                  In the top-right toolbar of Google AI Studio, click the <strong className="text-amber-400">&ldquo;Share&rdquo;</strong> button. This publishes the app so external tools like PWABuilder can scan it without authentication.
                </p>
              </div>

              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-display font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
              >
                <span>Open PWABuilder</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* TAB 3: Developer CLI / Bubblewrap */}
          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed">
                Want to build the APK directly using Google&apos;s official <strong>Bubblewrap (TWA) CLI</strong> on your terminal? Run these commands:
              </div>

              <div className="relative bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto space-y-2">
                <div className="text-slate-500"># 1. Install Google Bubblewrap CLI</div>
                <div className="text-emerald-400">npm install -g @bubblewrap/cli</div>
                <div className="text-slate-500"># 2. Initialize Android Project from App Manifest</div>
                <div className="text-amber-300">bubblewrap init --manifest=&quot;{currentUrl}/manifest.webmanifest&quot;</div>
                <div className="text-slate-500"># 3. Build signed APK for Android</div>
                <div className="text-indigo-400">bubblewrap build</div>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Outputs <code>app-release-signed.apk</code> ready to install with <code>adb install</code> or direct file transfer.</span>
              </div>
            </div>
          )}

          {/* Standalone Features Overview */}
          <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
              <div className="text-[11px] uppercase font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Full Screen
              </div>
              <div className="text-xs text-slate-400">
                Zero address bar or browser controls for total immersion.
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
              <div className="text-[11px] uppercase font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Offline Save
              </div>
              <div className="text-xs text-slate-400">
                Player stats, streaks, fighter roster & match history saved locally.
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
              <div className="text-[11px] uppercase font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Audio Synths
              </div>
              <div className="text-xs text-slate-400">
                Hardware-accelerated sound effects, BGM and ki clash impacts.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Package: com.tenkaichi4.ranked
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
