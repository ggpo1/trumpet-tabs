import { isSilentNote, resolveNoteFrequency } from './notePitch';
import type { TabNote } from '../types';

class TrumpetPlayer {
  private context: AudioContext | null = null;
  private activeOscillators: OscillatorNode[] = [];

  private async getContext(): Promise<AudioContext> {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    return this.context;
  }

  stopAll(): void {
    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    }
    this.activeOscillators = [];
  }

  async playNote(note: TabNote, durationSec: number): Promise<void> {
    if (isSilentNote(note) || durationSec <= 0) return;

    const ctx = await this.getContext();
    const now = ctx.currentTime;
    const frequency = resolveNoteFrequency(note);

    const master = ctx.createGain();
    master.connect(ctx.destination);

    const attack = 0.03;
    const release = Math.min(0.12, durationSec * 0.25);
    const sustainEnd = Math.max(attack, durationSec - release);

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.35, now + attack);
    master.gain.setValueAtTime(0.28, now + sustainEnd);
    master.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    const harmonics: Array<{ ratio: number; gain: number }> = [
      { ratio: 1, gain: 1 },
      { ratio: 2, gain: 0.45 },
      { ratio: 3, gain: 0.22 },
      { ratio: 4, gain: 0.1 },
      { ratio: 5, gain: 0.05 },
    ];

    for (const { ratio, gain } of harmonics) {
      const osc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      osc.type = ratio === 1 ? 'triangle' : 'sine';
      osc.frequency.value = frequency * ratio;
      harmonicGain.gain.value = gain * 0.12;
      osc.connect(harmonicGain);
      harmonicGain.connect(master);
      osc.start(now);
      osc.stop(now + durationSec + 0.05);
      this.activeOscillators.push(osc);
    }

    window.setTimeout(() => {
      this.activeOscillators = [];
    }, durationSec * 1000 + 100);
  }

  async previewNote(note: TabNote): Promise<void> {
    await this.playNote(note, 0.45);
  }
}

export const trumpetPlayer = new TrumpetPlayer();
