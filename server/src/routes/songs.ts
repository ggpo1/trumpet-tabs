import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { pool, rowToSong } from '../db.js';
import type { Song, SongRow, TabNote } from '../types.js';

export const songsRouter = Router();

function isTabNote(value: unknown): value is TabNote {
  if (!value || typeof value !== 'object') return false;
  const note = value as TabNote;
  return (
    typeof note.id === 'string' &&
    typeof note.label === 'string' &&
    Array.isArray(note.valves) &&
    note.valves.length === 3 &&
    typeof note.duration === 'string' &&
    typeof note.lyric === 'string'
  );
}

function parseSongBody(body: unknown, id?: string): Song | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Partial<Song>;
  if (typeof data.title !== 'string' || !Array.isArray(data.notes)) return null;
  if (!data.notes.every(isTabNote)) return null;

  return {
    id: id ?? (typeof data.id === 'string' ? data.id : randomUUID()),
    title: data.title,
    artist: typeof data.artist === 'string' ? data.artist : '',
    tempo: typeof data.tempo === 'number' && data.tempo > 0 ? data.tempo : 100,
    notes: data.notes,
    updatedAt: new Date().toISOString(),
  };
}

songsRouter.get('/', async (_req, res) => {
  const result = await pool.query<SongRow>(
    'SELECT id, title, artist, tempo, notes, created_at, updated_at FROM songs ORDER BY updated_at DESC',
  );
  res.json(result.rows.map(rowToSong));
});

songsRouter.get('/:id', async (req, res) => {
  const result = await pool.query<SongRow>(
    'SELECT id, title, artist, tempo, notes, created_at, updated_at FROM songs WHERE id = $1',
    [req.params.id],
  );
  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Песня не найдена' });
    return;
  }
  res.json(rowToSong(result.rows[0]));
});

songsRouter.post('/', async (req, res) => {
  const song = parseSongBody(req.body);
  if (!song) {
    res.status(400).json({ error: 'Неверное тело запроса' });
    return;
  }

  const result = await pool.query<SongRow>(
    `INSERT INTO songs (id, title, artist, tempo, notes, updated_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
     RETURNING id, title, artist, tempo, notes, created_at, updated_at`,
    [song.id, song.title, song.artist, song.tempo, JSON.stringify(song.notes)],
  );

  res.status(201).json(rowToSong(result.rows[0]));
});

songsRouter.put('/:id', async (req, res) => {
  const song = parseSongBody(req.body, req.params.id);
  if (!song) {
    res.status(400).json({ error: 'Неверное тело запроса' });
    return;
  }

  const result = await pool.query<SongRow>(
    `UPDATE songs
     SET title = $2, artist = $3, tempo = $4, notes = $5::jsonb, updated_at = NOW()
     WHERE id = $1
     RETURNING id, title, artist, tempo, notes, created_at, updated_at`,
    [song.id, song.title, song.artist, song.tempo, JSON.stringify(song.notes)],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Песня не найдена' });
    return;
  }

  res.json(rowToSong(result.rows[0]));
});

songsRouter.delete('/:id', async (req, res) => {
  const result = await pool.query('DELETE FROM songs WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Песня не найдена' });
    return;
  }
  res.status(204).send();
});
