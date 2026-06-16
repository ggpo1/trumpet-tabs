import type { TabNote } from '../types';

const DURATION_BEATS: Record<TabNote['duration'], number> = {
  eighth: 0.5,
  quarter: 1,
  half: 2,
  whole: 4,
};

export function durationMs(duration: TabNote['duration'], tempo: number): number {
  const beat = 60000 / tempo;
  return beat * DURATION_BEATS[duration];
}
