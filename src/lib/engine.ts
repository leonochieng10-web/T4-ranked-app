import { TIERS, TierDefinition, CHARACTERS, FighterCharacter, PlayerProfile, LeaderboardRowData } from '../types/rank';

export const N = 60000;
export const START_POINTS = 1000;
export const LOSS_PREVENTION_THRESHOLD = 1500;
export const MAX_MATCHES_PER_SEASON = 150;
export const WEEK_MS = 604800000;
export const EPOCH_MS = Date.UTC(2024, 0, 1);

const FIRST_NAMES = [
  "Liam", "Emma", "Noah", "Olivia", "Ethan", "Ava", "Lucas", "Mia", "Mason", "Sofia",
  "Aiden", "Zoe", "Kai", "Luna", "Leo", "Maya", "Ryan", "Nina", "Omar", "Aisha",
  "Diego", "Yuki", "Ivan", "Priya", "Jin", "Chloe", "Ahmed", "Elena", "Tariq", "Hana"
];

const LAST_NAMES = [
  "Kim", "Silva", "Khan", "Lee", "Cruz", "Novak", "Ali", "Chen", "Reyes", "Moore",
  "Tanaka", "Patel", "Costa", "Ivanov", "Smith", "Okafor", "Singh", "Muller", "Park", "Diaz"
];

function rnd(s: number): number {
  s = Math.imul(s ^ (s >>> 15), 2246822507);
  s = Math.imul(s ^ (s >>> 13), 3266489909);
  return ((s ^ (s >>> 16)) >>> 0) / 4294967296;
}

function mb(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function nameAt(i: number): string {
  const h = Math.floor(rnd(i * 3 + 1) * 1e9);
  const f = FIRST_NAMES[h % FIRST_NAMES.length];
  const l = LAST_NAMES[(h >> 6) % LAST_NAMES.length];
  const n = (h >> 11) % 100;
  const s = (h >> 18) % 5;
  return s === 0 ? f + l + n : s === 1 ? 'x' + f + 'x' : s === 2 ? f.toLowerCase() + '.' + l.toLowerCase() : s === 3 ? f + '_' + l[0] + n : f + ' ' + l;
}

export function characterAt(i: number): FighterCharacter {
  const charIdx = (Math.floor(rnd(i * 11 + 7) * 1e6) + i) % CHARACTERS.length;
  return CHARACTERS[charIdx];
}

export function tierForPoints(p: number): TierDefinition {
  for (const t of TIERS) {
    if (p >= t.minPoints) return t;
  }
  return TIERS[TIERS.length - 1];
}

class RankedEngine {
  public pts = new Int32Array(N);
  public st = new Int16Array(N);
  public mc = new Uint16Array(N);
  public wp = new Float32Array(N);
  public act = new Float32Array(N);
  public gr = new Float32Array(N);
  public hot = new Uint8Array(N);
  public keys = new Int32Array(N);

  public season = 0;
  public sStart = 0;
  public sEnd = 0;
  public shift = 0;
  public nextLiveAt = Date.now() + 180000;

  constructor() {
    this.initArchetypes();
    this.startSeason();
  }

  private initArchetypes() {
    for (let i = 0; i < N; i++) {
      const u = rnd(i * 7 + 13);
      const r2 = rnd(i * 5 + 3);
      if (u < 0.03) {
        this.wp[i] = 0.78 + 0.1 * r2;
        this.act[i] = 0.85;
        this.hot[i] = 1;
      } else if (u < 0.18) {
        this.wp[i] = 0.58 + 0.1 * r2;
        this.act[i] = 0.55 + 0.2 * r2;
      } else if (u < 0.6) {
        this.wp[i] = 0.46 + 0.08 * r2;
        this.act[i] = 0.25 + 0.25 * r2;
        if (rnd(i + 99) < 0.3) this.gr[i] = 0.002;
      } else {
        this.wp[i] = 0.28 + 0.1 * r2;
        this.act[i] = 0.05 + 0.12 * r2;
        if (rnd(i + 51) < 0.35) this.gr[i] = 0.01;
      }
    }
  }

  public now(): number {
    return Date.now() + this.shift;
  }

  public playOne(i: number, rng: () => number) {
    const m = this.mc[i];
    const w = Math.min(0.95, this.wp[i] + Math.min(0.2, this.gr[i] * Math.max(0, m - 8)) + (this.hot[i] ? Math.min(0.12, 0.03 * this.st[i]) : 0));
    const d = 22 + ((rng() * 9) | 0);
    if (rng() < w) {
      this.pts[i] += d;
      this.st[i]++;
    } else {
      this.st[i] = 0;
      if (this.pts[i] >= LOSS_PREVENTION_THRESHOLD) {
        this.pts[i] = Math.max(0, this.pts[i] - d);
      }
    }
    this.mc[i] = m + 1;
  }

  public resort() {
    for (let i = 0; i < N; i++) {
      this.keys[i] = this.pts[i] * 65536 + (65535 - i);
    }
    this.keys.sort();
    this.keys.reverse();
  }

  public rankFor(p: number): number {
    let lo = 0;
    let hi = N;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if ((this.keys[m] >> 16) >= p) lo = m + 1;
      else hi = m;
    }
    return lo + 1;
  }

  public startSeason() {
    this.season = Math.floor((this.now() - EPOCH_MS) / WEEK_MS);
    this.sStart = EPOCH_MS + this.season * WEEK_MS;
    this.sEnd = this.sStart + WEEK_MS;
    this.pts.fill(START_POINTS);
    this.st.fill(0);
    this.mc.fill(0);

    const f = (this.now() - this.sStart) / WEEK_MS;
    const rng = mb(this.season * 7919 + 1);
    for (let i = 0; i < N; i++) {
      const n = Math.floor(this.act[i] * MAX_MATCHES_PER_SEASON * f * (0.6 + 0.8 * rng()));
      for (let k = 0; k < n; k++) {
        this.playOne(i, rng);
      }
    }
    this.resort();
    this.scheduleNextLive();
  }

  public scheduleNextLive() {
    this.nextLiveAt = Date.now() + 180000 + Math.random() * 60000;
  }

  public simulateLiveStep() {
    for (let i = 0; i < N; i++) {
      if (Math.random() < this.act[i] * 0.15 && this.mc[i] < MAX_MATCHES_PER_SEASON * this.act[i] * 1.3 + 5) {
        this.playOne(i, Math.random);
      }
    }
    this.resort();
    this.scheduleNextLive();
  }

  public getHottestStreaks(topN: number = 3): Array<{ id: number; name: string; character: FighterCharacter; streak: number; matches: number; points: number; tier: TierDefinition }> {
    const top: number[] = [];
    for (let i = 0; i < topN; i++) top.push(-1);

    for (let i = 0; i < N; i++) {
      const s = this.st[i];
      if (s <= 0) continue;
      for (let k = 0; k < topN; k++) {
        if (top[k] < 0 || s > this.st[top[k]]) {
          for (let j = topN - 1; j > k; j--) {
            top[j] = top[j - 1];
          }
          top[k] = i;
          break;
        }
      }
    }

    return top
      .filter((id) => id >= 0 && this.st[id] > 0)
      .map((id) => ({
        id,
        name: nameAt(id),
        character: characterAt(id),
        streak: this.st[id],
        matches: this.mc[id],
        points: this.pts[id],
        tier: tierForPoints(this.pts[id]),
      }));
  }

  public getTierCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const t of TIERS) counts[t.id] = 0;

    for (let i = 0; i < N; i++) {
      const p = this.pts[i];
      let k = 0;
      while (k < TIERS.length - 1 && p < TIERS[k].minPoints) k++;
      counts[TIERS[k].id]++;
    }
    return counts;
  }

  public getRowAtRank(rank: number, userRank: number, user: PlayerProfile, userRankDelta: number = 0): LeaderboardRowData {
    const isMe = rank === userRank;
    if (isMe) {
      const char = CHARACTERS.find((c) => c.id === user.characterId) || CHARACTERS[0];
      return {
        rank,
        name: user.name || 'You',
        points: user.points,
        tier: tierForPoints(user.points),
        character: char,
        streak: user.streak,
        matches: user.matches,
        isUser: true,
        rankDelta: userRankDelta,
      };
    }

    const arrayIdx = rank > userRank ? rank - 2 : rank - 1;
    const clamped = Math.max(0, Math.min(N - 1, arrayIdx));
    const k = this.keys[clamped];
    const id = 65535 - (k & 65535);
    const pts = k >> 16;
    const s = this.st[id];
    const m = this.mc[id];

    return {
      rank,
      name: nameAt(id),
      points: pts,
      tier: tierForPoints(pts),
      character: characterAt(id),
      streak: s,
      matches: m,
      isUser: false,
    };
  }

  public searchRanks(query: string, userRank: number, user: PlayerProfile, limit: number = 100): number[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    if (/^#?\d+$/.test(trimmed)) {
      const r = Math.min(N + 1, Math.max(1, parseInt(trimmed.replace('#', ''), 10)));
      return [r];
    }

    const results: number[] = [];
    const userName = (user.name || 'You').toLowerCase();
    if (userName.includes(trimmed)) {
      results.push(userRank);
    }

    for (let k = 1; k <= N + 1 && results.length < limit; k++) {
      if (k === userRank) continue;
      const arrayIdx = k > userRank ? k - 2 : k - 1;
      if (arrayIdx < 0 || arrayIdx >= N) continue;
      const key = this.keys[arrayIdx];
      const id = 65535 - (key & 65535);
      const name = nameAt(id);
      if (name.toLowerCase().includes(trimmed)) {
        results.push(k);
      }
    }
    return results;
  }

  public findOpponentNearPoints(points: number): { name: string; rank: number; points: number; tier: TierDefinition; character: FighterCharacter; streak: number; winRate: number } {
    const targetRank = this.rankFor(points);
    const deltaRange = Math.floor(Math.random() * 30) - 15;
    const opponentRank = Math.max(1, Math.min(N, targetRank + deltaRange));
    const arrayIdx = Math.max(0, Math.min(N - 1, opponentRank - 1));
    const key = this.keys[arrayIdx];
    const id = 65535 - (key & 65535);
    const oppPts = key >> 16;

    return {
      name: nameAt(id),
      rank: opponentRank,
      points: oppPts,
      tier: tierForPoints(oppPts),
      character: characterAt(id),
      streak: this.st[id],
      winRate: Math.round((this.wp[id] || 0.5) * 100),
    };
  }

  public testFastForwardToReset() {
    this.shift += this.sEnd - this.now() - 4000;
  }
}

export const rankedEngine = new RankedEngine();
