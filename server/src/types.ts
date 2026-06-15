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

export interface SongRow {
  id: string;
  title: string;
  artist: string;
  tempo: number;
  notes: TabNote[];
  updated_at: Date;
  created_at: Date;
}
