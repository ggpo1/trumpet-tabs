import type { TabNote, Valves } from '../types';

const RU_TO_SEMITONE: Record<string, number> = {
  до: 0,
  ре: 2,
  ми: 4,
  фа: 5,
  соль: 7,
  ля: 9,
  си: 11,
};

const EN_TO_SEMITONE: Record<string, number> = {
  c: 0,
  d: 2,
  e: 4,
  f: 5,
  g: 7,
  a: 9,
  b: 11,
};

/** Аппликатура → нота в нотной записи для Bb-трубы (средний регистр) */
const VALVES_TO_WRITTEN_MIDI: Record<string, number> = {
  'false,false,false': 60, // C
  'true,false,false': 62, // D / F
  'true,true,false': 64, // E / A
  'false,true,false': 71, // B
  'true,true,true': 67, // G
  'false,false,true': 65, // F
  'true,false,true': 65, // F
  'false,true,true': 61, // C# / Db
};

/** Bb-труба звучит на большую секунду ниже записанной ноты */
function writtenMidiToHz(midi: number): number {
  const concertMidi = midi - 2;
  return 440 * 2 ** ((concertMidi - 69) / 12);
}

function valvesKey(valves: Valves): string {
  return valves.map(String).join(',');
}

function parseLabel(label: string): number | null {
  const trimmed = label.trim().toLowerCase();
  if (!trimmed) return null;

  const ruMatch = trimmed.match(/^(до|ре|ми|фа|соль|ля|си)([#b♯♭]?)(\d)?/);
  if (ruMatch) {
    let semitone = RU_TO_SEMITONE[ruMatch[1]];
    const acc = ruMatch[2];
    if (acc === '#' || acc === '♯') semitone += 1;
    if (acc === 'b' || acc === '♭') semitone -= 1;
    const octave = ruMatch[3] ? Number(ruMatch[3]) : 4;
    const midi = (octave + 1) * 12 + semitone;
    return writtenMidiToHz(midi);
  }

  const enMatch = trimmed.match(/^([a-g])([#b♯♭]?)(\d)?/);
  if (enMatch) {
    let semitone = EN_TO_SEMITONE[enMatch[1]];
    const acc = enMatch[2];
    if (acc === '#' || acc === '♯') semitone += 1;
    if (acc === 'b' || acc === '♭') semitone -= 1;
    const octave = enMatch[3] ? Number(enMatch[3]) : 4;
    const midi = (octave + 1) * 12 + semitone;
    return writtenMidiToHz(midi);
  }

  return null;
}

export function resolveNoteFrequency(note: TabNote): number {
  const fromLabel = parseLabel(note.label);
  if (fromLabel) return fromLabel;

  const midi = VALVES_TO_WRITTEN_MIDI[valvesKey(note.valves)] ?? 60;
  return writtenMidiToHz(midi);
}

export function isSilentNote(note: TabNote): boolean {
  return !note.label.trim() && note.valves.every((v) => !v);
}
