/**
 * Web Audio API synthesizer for Tenkaichi 4 Ranked
 * Generates custom retro-modern sound effects and dynamic matchmaking music
 * without any external audio asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private musicMasterGain: GainNode | null = null;
  private musicStep: number = 0;

  constructor() {
    try {
      const stored = localStorage.getItem('t4r_sound_muted');
      if (stored !== null) {
        this.isMuted = stored === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('t4r_sound_muted', String(this.isMuted));
    } catch {}

    if (this.isMuted) {
      if (this.musicMasterGain && this.ctx) {
        this.musicMasterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else {
      if (this.musicMasterGain && this.ctx) {
        this.musicMasterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      }
      this.playClick();
    }
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playWin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major chord arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startT = t + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.12, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startT);
      osc.stop(startT + 0.3);
    });
  }

  public playLoss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.35);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  public playRankUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Grand triumphant fanfare
    const chord = [330, 440, 554.37, 659.25, 880, 1108.73];
    chord.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startT = t + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.14, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startT);
      osc.stop(startT + 0.85);
    });
  }

  public playScouter() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startT = t + i * 0.05;

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200 + i * 200, startT);

      gain.gain.setValueAtTime(0.04, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + 0.045);
    }
  }

  public playChallengerAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Dramatic 2-tone alarm/encounter chime
    [660, 880, 1100].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startT = t + idx * 0.12;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.15, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startT);
      osc.stop(startT + 0.25);
    });
  }

  /**
   * Signature Anime Ki Blast sound effect
   * Sweeping resonant high-energy beam discharge
   */
  public playKiBlast() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.26);

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(6, t);
    filter.frequency.setValueAtTime(3800, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.26);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.29);
  }

  /**
   * Heavy Martial Arts Energy Clash impact sound effect
   * Sub-bass punch + metallic contact transient + air shockwave burst
   */
  public playClash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Low Sub Thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.22);
    subGain.gain.setValueAtTime(0.25, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.25);

    // 2. High Metallic Impact Clash
    const clashOsc = this.ctx.createOscillator();
    const clashGain = this.ctx.createGain();
    clashOsc.type = 'triangle';
    clashOsc.frequency.setValueAtTime(820, t);
    clashOsc.frequency.exponentialRampToValueAtTime(160, t + 0.16);
    clashGain.gain.setValueAtTime(0.16, t);
    clashGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    clashOsc.connect(clashGain);
    clashGain.connect(this.ctx.destination);
    clashOsc.start(t);
    clashOsc.stop(t + 0.19);
  }

  /**
   * Audio feedback sequence for recording a match victory:
   * Explosive Ki Blast discharge followed by triumphant fanfare arpeggio
   */
  public playVictorySequence() {
    this.playKiBlast();
    setTimeout(() => {
      this.playWin();
    }, 150);
  }

  /**
   * Audio feedback sequence for recording a match defeat:
   * Heavy martial arts Clash impact followed by the defeat tone
   */
  public playDefeatSequence(isSafe: boolean = false) {
    this.playClash();
    setTimeout(() => {
      this.playLoss();
    }, 150);
  }

  /**
   * Dynamic Electronic Matchmaking Soundtrack (128 BPM)
   * Clock-driven synthesizer with bassline, synth arpeggios, and rhythmic beats.
   */
  public startMatchmakingMusic() {
    this.initContext();
    if (!this.ctx) return;
    if (this.musicPlaying) return;

    this.musicPlaying = true;
    this.musicStep = 0;

    // Master gain for music
    this.musicMasterGain = this.ctx.createGain();
    this.musicMasterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    this.musicMasterGain.connect(this.ctx.destination);

    const stepMs = 120; // ~125 BPM 16th notes
    const bassNotes = [82.41, 82.41, 98.0, 110.0, 82.41, 82.41, 123.47, 110.0]; // E2, G2, A2, B2
    const arpNotes = [329.63, 392.0, 493.88, 587.33, 659.25, 493.88, 392.0, 329.63]; // E4 minor arpeggio

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicMasterGain || !this.musicPlaying) return;
      const t = this.ctx.currentTime;
      const step = this.musicStep % 16;

      // 1. Bassline on 8th notes
      if (step % 2 === 0) {
        const bassFreq = bassNotes[(step / 2) % bassNotes.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, t);
        filter.frequency.exponentialRampToValueAtTime(150, t + 0.15);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicMasterGain);

        osc.start(t);
        osc.stop(t + 0.2);
      }

      // 2. Lead Arp Note
      const arpFreq = arpNotes[step % arpNotes.length];
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = 'triangle';
      leadOsc.frequency.setValueAtTime(arpFreq, t);

      leadGain.gain.setValueAtTime(0.07, t);
      leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicMasterGain);

      leadOsc.start(t);
      leadOsc.stop(t + 0.11);

      // 3. Crisp Hi-hat on every 4th step
      if (step % 4 === 2) {
        const noiseGain = this.ctx.createGain();
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(3500 + Math.random() * 800, t);

        noiseGain.gain.setValueAtTime(0.03, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

        osc.connect(noiseGain);
        noiseGain.connect(this.musicMasterGain);

        osc.start(t);
        osc.stop(t + 0.045);
      }

      this.musicStep++;
    }, stepMs);
  }

  public stopMatchmakingMusic() {
    if (!this.musicPlaying) return;
    this.musicPlaying = false;

    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }

    if (this.musicMasterGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.musicMasterGain.gain.linearRampToValueAtTime(0.001, t + 0.2);
      setTimeout(() => {
        try {
          this.musicMasterGain?.disconnect();
          this.musicMasterGain = null;
        } catch {}
      }, 250);
    }
  }

  public isMusicActive(): boolean {
    return this.musicPlaying;
  }
}

export const sound = new SoundEngine();
