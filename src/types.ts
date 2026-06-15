export type Valves = [boolean, boolean, boolean];

export type NoteDuration = 'eighth' | 'quarter' | 'half' | 'whole';

export interface TabNote {
  id: string;
  label: string;
  valves: Valves;
  duration: NoteDuration;
  lyric: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  tempo: number;
  notes: TabNote[];
  updatedAt: string;
}

export const DURATION_LABELS: Record<NoteDuration, string> = {
  eighth: '1/8',
  quarter: '1/4',
  half: '1/2',
  whole: '1',
};

export const EMPTY_VALVES: Valves = [false, false, false];

export function valvesToString(valves: Valves): string {
  if (!valves[0] && !valves[1] && !valves[2]) return '○';
  const pressed = valves
    .map((v, i) => (v ? String(i + 1) : ''))
    .filter(Boolean)
    .join('+');
  return pressed || '○';
}

export function createNote(partial?: Partial<TabNote>): TabNote {
  return {
    id: crypto.randomUUID(),
    label: '',
    valves: [...EMPTY_VALVES],
    duration: 'quarter',
    lyric: '',
    ...partial,
  };
}

export function createSong(partial?: Partial<Song>): Song {
  return {
    id: crypto.randomUUID(),
    title: 'Новая песня',
    artist: '',
    tempo: 100,
    notes: [],
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

/** Стандартная аппликатура Bb-трубы (первая октава) — подсказка при вводе ноты */
export const FINGERING_HINTS: Record<string, Valves> = {
  'до': [false, false, false],
  'c': [false, false, false],
  'ре': [true, false, false],
  'd': [true, false, false],
  'ми': [true, true, false],
  'e': [true, true, false],
  'фа': [true, false, false],
  'f': [true, false, false],
  'соль': [false, false, false],
  'g': [false, false, false],
  'ля': [true, true, false],
  'a': [true, true, false],
  'си': [false, true, false],
  'b': [false, true, false],
};

export function guessValvesFromLabel(label: string): Valves | null {
  const key = label.trim().toLowerCase().replace(/[0-9]/g, '');
  return FINGERING_HINTS[key] ?? null;
}
