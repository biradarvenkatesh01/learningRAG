/**
 * PIXEL STUDY BUDDY - Cozy 8-Bit Chiptune / Lo-Fi BGM Synthesizer
 * Pure Web Audio API procedural music engine.
 * Zero external audio files, 0 MB download, seamless looping, zero CORS issues.
 */

const NOTES = {
  // Bass Octave 2
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  // Mid/Chords Octave 3 & 4
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  // Lead Octave 5 & 6
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51
};

// 84 BPM Lo-Fi Study Groove
const BPM = 84;
const BEAT_DURATION = 60 / BPM; // ~0.714s
const STEP_DURATION = BEAT_DURATION / 4; // 16th note ~0.178s
const TOTAL_STEPS = 128; // 8 bars of 16 steps = 128 steps (~22.8s loop)

// 8-Bar Chord Progression: Fmaj7 -> G6 -> Em7 -> Am7 -> Dm7 -> G7 -> Cmaj7 -> Cmaj7
const CHORD_STEPS = [
  // Bar 1: Fmaj7 (F3, A3, C4, E4)
  { step: 0, notes: [NOTES.F3, NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.F2 },
  { step: 8, notes: [NOTES.A3, NOTES.C4, NOTES.E4], bass: NOTES.C3 },
  // Bar 2: G6 (G3, B3, D4, E4)
  { step: 16, notes: [NOTES.G3, NOTES.B3, NOTES.D4, NOTES.E4], bass: NOTES.G2 },
  { step: 24, notes: [NOTES.B3, NOTES.D4, NOTES.G4], bass: NOTES.D3 },
  // Bar 3: Em7 (E3, G3, B3, D4)
  { step: 32, notes: [NOTES.E3, NOTES.G3, NOTES.B3, NOTES.D4], bass: NOTES.E2 },
  { step: 40, notes: [NOTES.G3, NOTES.B3, NOTES.E4], bass: NOTES.B2 },
  // Bar 4: Am7 (A3, C4, E4, G4)
  { step: 48, notes: [NOTES.A3, NOTES.C4, NOTES.E4, NOTES.G4], bass: NOTES.A2 },
  { step: 56, notes: [NOTES.C4, NOTES.E4, NOTES.A4], bass: NOTES.E3 },
  // Bar 5: Dm7 (D3, F3, A3, C4)
  { step: 64, notes: [NOTES.D3, NOTES.F3, NOTES.A3, NOTES.C4], bass: NOTES.D2 },
  { step: 72, notes: [NOTES.F3, NOTES.A3, NOTES.D4], bass: NOTES.A2 },
  // Bar 6: G7 (G3, B3, D4, F4)
  { step: 80, notes: [NOTES.G3, NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.G2 },
  { step: 88, notes: [NOTES.B3, NOTES.D4, NOTES.F4], bass: NOTES.D3 },
  // Bar 7: Cmaj7 (C3, E3, G3, B3)
  { step: 96, notes: [NOTES.C3, NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.C2 },
  { step: 104, notes: [NOTES.E3, NOTES.G3, NOTES.C4], bass: NOTES.G2 },
  // Bar 8: Cmaj7 variation
  { step: 112, notes: [NOTES.C3, NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.C2 },
  { step: 120, notes: [NOTES.E3, NOTES.G3, NOTES.B3], bass: NOTES.B2 },
];

// Lead Melody (Step, Frequency, Duration in steps)
const MELODY_NOTES = [
  // Phrase 1 (Bars 1-2)
  { step: 0, freq: NOTES.E5, dur: 3 },
  { step: 4, freq: NOTES.G5, dur: 3 },
  { step: 8, freq: NOTES.C6, dur: 4 },
  { step: 14, freq: NOTES.B5, dur: 2 },
  { step: 16, freq: NOTES.G5, dur: 6 },
  { step: 24, freq: NOTES.D5, dur: 4 },
  { step: 28, freq: NOTES.E5, dur: 3 },

  // Phrase 2 (Bars 3-4)
  { step: 32, freq: NOTES.B4, dur: 3 },
  { step: 36, freq: NOTES.D5, dur: 3 },
  { step: 40, freq: NOTES.G5, dur: 4 },
  { step: 46, freq: NOTES.E5, dur: 2 },
  { step: 48, freq: NOTES.A5, dur: 6 },
  { step: 56, freq: NOTES.G5, dur: 4 },
  { step: 60, freq: NOTES.E5, dur: 3 },

  // Phrase 3 (Bars 5-6)
  { step: 64, freq: NOTES.F5, dur: 3 },
  { step: 68, freq: NOTES.A5, dur: 3 },
  { step: 72, freq: NOTES.C6, dur: 4 },
  { step: 78, freq: NOTES.D6, dur: 2 },
  { step: 80, freq: NOTES.B5, dur: 6 },
  { step: 88, freq: NOTES.G5, dur: 4 },
  { step: 92, freq: NOTES.A5, dur: 3 },

  // Phrase 4 (Bars 7-8)
  { step: 96, freq: NOTES.E5, dur: 4 },
  { step: 102, freq: NOTES.G5, dur: 2 },
  { step: 104, freq: NOTES.C6, dur: 6 },
  { step: 112, freq: NOTES.B5, dur: 3 },
  { step: 116, freq: NOTES.G5, dur: 3 },
  { step: 120, freq: NOTES.C5, dur: 7 },
];

class BgmSynthEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.filter = null;
    this.noiseBuffer = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentStep = 0;
    this.nextNoteTime = 0;
    this.timerId = null;
    this.volume = 0.18; // Sweet, gentle background volume
    this.unlocked = false;

    // Load user mute preference from storage
    try {
      const saved = localStorage.getItem('pixel_study_bgm_muted');
      if (saved === 'true') {
        this.isMuted = true;
      }
    } catch {
      this.isMuted = false;
    }
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

    // Warm Low-Pass Filter (removes harsh digital treble, gives cozy GBA/Game Boy vibe)
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    // Subtle stereo panner / master chain
    this.masterGain.connect(this.filter);
    this.filter.connect(this.ctx.destination);

    // Generate 1-second white noise buffer for retro percussion (hi-hat & brush snare)
    const bufferSize = this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  unlock() {
    if (this.unlocked) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.unlocked = true;
        if (!this.isPlaying && !this.isMuted) {
          this.start();
        }
      });
    } else {
      this.unlocked = true;
      if (!this.isPlaying && !this.isMuted) {
        this.start();
      }
    }
  }

  start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.currentStep = 0;

    // High precision lookahead scheduling (checks every 25ms, schedules ahead by 100ms)
    this.timerId = setInterval(() => {
      this.scheduleLoop();
    }, 25);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = false;
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('pixel_study_bgm_muted', this.isMuted ? 'true' : 'false');
    } catch {
      // LocalStorage access failure fallback
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      if (this.isMuted) {
        this.masterGain.gain.linearRampToValueAtTime(0, now + 0.1);
      } else {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        if (!this.isPlaying) {
          this.start();
        }
        this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.1);
      }
    }

    return this.isMuted;
  }

  scheduleLoop() {
    if (!this.ctx) return;
    // Schedule all notes up to 0.12s ahead
    while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.nextNoteTime += STEP_DURATION;
      this.currentStep = (this.currentStep + 1) % TOTAL_STEPS;
    }
  }

  scheduleStep(step, time) {
    if (!this.ctx) return;

    // 1. Chords & Bass Trigger
    const chord = CHORD_STEPS.find((c) => c.step === step);
    if (chord) {
      // Play Bass Note (warm triangle wave)
      this.playBass(chord.bass, time, STEP_DURATION * 6);

      // Play Arpeggiated Chords (filtered pulse/square wave)
      chord.notes.forEach((freq, idx) => {
        const noteTime = time + idx * (STEP_DURATION * 0.5);
        this.playChordTone(freq, noteTime, STEP_DURATION * 3);
      });
    }

    // 2. Lead Melody Note
    const melody = MELODY_NOTES.find((m) => m.step === step);
    if (melody) {
      this.playLead(melody.freq, time, melody.dur * STEP_DURATION);
    }

    // 3. Subtle Rhythm (Retro Hi-hat & Snare)
    // Hi-hat on every 8th note (step % 2 === 0)
    if (step % 2 === 0) {
      this.playHiHat(time);
    }
    // Snare brush on beats 2 and 4 (step % 16 === 4 or 12)
    if (step % 16 === 4 || step % 16 === 12) {
      this.playSnare(time);
    }
  }

  // --- Instrument Synthesizers ---

  playBass(freq, time, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.35, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  playChordTone(freq, time, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine'; // Soft, warm electronic chime
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  playLead(freq, time, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Square wave gives that iconic authentic Nintendo / Game Boy lead
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    // Gentle retro vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(4.5, time); // 4.5Hz warm vibrato
    lfoGain.gain.setValueAtTime(2.5, time);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.02);
    gain.gain.setValueAtTime(0.16, time + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(time);
    osc.start(time);

    lfo.stop(time + dur);
    osc.stop(time + dur);
  }

  playHiHat(time) {
    if (!this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.025, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  playSnare(time) {
    if (!this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.Q.setValueAtTime(1.2, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.1);
  }
}

// Global Singleton BGM instance
export const bgmEngine = new BgmSynthEngine();
