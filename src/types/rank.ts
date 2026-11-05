export type TierId = 'Z' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface TierDefinition {
  id: TierId;
  minPoints: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  icon: string;
  name: string;
  tagline: string;
}

export const TIERS: TierDefinition[] = [
  { id: 'Z', minPoints: 3500, color: '#e11d48', badgeBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40', badgeBorder: 'border-rose-500', icon: '🌌', name: 'Z-Rank', tagline: 'Godly Ki Realm' },
  { id: 'SS', minPoints: 3000, color: '#f97316', badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40', badgeBorder: 'border-orange-500', icon: '🔥', name: 'Super Saiyan', tagline: 'Ultra Elite' },
  { id: 'S', minPoints: 2400, color: '#d4a017', badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', badgeBorder: 'border-amber-500', icon: '👑', name: 'S-Rank', tagline: 'Master Martial Artist' },
  { id: 'A', minPoints: 1900, color: '#22a35a', badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', badgeBorder: 'border-emerald-500', icon: '💎', name: 'A-Rank', tagline: 'Veteran Contender' },
  { id: 'B', minPoints: 1500, color: '#0ea5e9', badgeBg: 'bg-sky-500/20 text-sky-400 border-sky-500/40', badgeBorder: 'border-sky-500', icon: '⚔️', name: 'B-Rank', tagline: 'Competitive Division' },
  { id: 'C', minPoints: 1200, color: '#6366f1', badgeBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40', badgeBorder: 'border-indigo-500', icon: '🛡️', name: 'C-Rank', tagline: 'Adept Fighter' },
  { id: 'D', minPoints: 800, color: '#8b5cf6', badgeBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40', badgeBorder: 'border-purple-500', icon: '🔰', name: 'D-Rank', tagline: 'Novice Challenger' },
  { id: 'E', minPoints: 0, color: '#7d8399', badgeBg: 'bg-slate-500/20 text-slate-400 border-slate-500/40', badgeBorder: 'border-slate-500', icon: '🌱', name: 'E-Rank', tagline: 'Training Grounds' },
];

export interface FighterCharacter {
  id: string;
  name: string;
  title: string;
  avatarEmoji: string;
  specialMove: string;
  style: string;
}

export const CHARACTERS: FighterCharacter[] = [
  { id: 'goku_blue', name: 'Goku (Super Saiyan Blue)', title: 'Earth’s Protector', avatarEmoji: '⚡', specialMove: 'God Kamehameha', style: 'All-Round Ki' },
  { id: 'vegeta_god', name: 'Vegeta (SSGSS Evolved)', title: 'Prince of All Saiyans', avatarEmoji: '💥', specialMove: 'Final Explosion', style: 'Aggressive Rush' },
  { id: 'gohan_beast', name: 'Gohan (Beast)', title: 'Awakened Savior', avatarEmoji: '🔴', specialMove: 'Special Beam Cannon', style: 'High Damage Burst' },
  { id: 'trunks_sword', name: 'Future Trunks', title: 'Warrior of Hope', avatarEmoji: '🗡️', specialMove: 'Sword of Hope', style: 'Weapon & Speed' },
  { id: 'piccolo_orange', name: 'Piccolo (Orange)', title: 'Namekian Elder', avatarEmoji: '🟠', specialMove: 'Great Namek Smash', style: 'Super Armor Heavy' },
  { id: 'broly_super', name: 'Broly (Full Power LSSJ)', title: 'Unbound Wrath', avatarEmoji: '🟢', specialMove: 'Gigantic Roar', style: 'Rampaging Brawler' },
  { id: 'frieza_golden', name: 'Golden Frieza', title: 'Emperor of the Universe', avatarEmoji: '✨', specialMove: 'Death Beam Barrage', style: 'Zoning & Speed' },
  { id: 'vegito_blue', name: 'Vegito (SSGSS)', title: 'Supreme Fusion', avatarEmoji: '🌀', specialMove: 'Final Kamehameha', style: 'Speed & Combos' },
  { id: 'gogeta_ss4', name: 'Gogeta (Super Saiyan 4)', title: 'Ultimate Primate', avatarEmoji: '🦁', specialMove: 'Big Bang Kamehameha x100', style: 'Devastating Impact' },
  { id: 'jiren', name: 'Jiren (Full Power)', title: 'Pride of Universe 11', avatarEmoji: '🛡️', specialMove: 'Overheat Magnetron', style: 'Counter & Armor' },
  { id: 'beerus', name: 'Beerus', title: 'God of Destruction', avatarEmoji: '🌌', specialMove: 'Sphere of Destruction', style: 'Hakai Neutralizer' },
  { id: 'cell_perfect', name: 'Perfect Cell', title: 'Ultimate Lifeform', avatarEmoji: '🧪', specialMove: 'Solar Kamehameha', style: 'Balanced Precision' },
];

export interface PlayerProfile {
  name: string;
  points: number;
  matches: number;
  wins: number;
  losses: number;
  streak: number;
  highestStreak: number;
  characterId: string;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  opponentName: string;
  opponentRank: number;
  opponentTier: TierId;
  opponentCharacterId: string;
  result: 'VICTORY' | 'DEFEAT';
  pointsChange: number;
  finalPoints: number;
  streak: number;
  mode: 'QUICK' | 'ARENA';
  roundScores?: string;
}

export interface LeaderboardRowData {
  rank: number;
  name: string;
  points: number;
  tier: TierDefinition;
  character: FighterCharacter;
  streak: number;
  matches: number;
  isUser: boolean;
  rankDelta?: number;
}
