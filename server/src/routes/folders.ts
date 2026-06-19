import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { pool, rowToFolder } from '../db.js';
import type { SongFolder, SongFolderRow } from '../types.js';

export const foldersRouter = Router();

function parseFolderBody(body: unknown, id?: string): SongFolder | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Partial<SongFolder>;
  if (typeof data.name !== 'string' || !data.name.trim()) return null;

  return {
    id: id ?? (typeof data.id === 'string' ? data.id : randomUUID()),
    name: data.name.trim(),
    updatedAt: new Date().toISOString(),
  };
}

foldersRouter.get('/', async (_req, res) => {
  const result = await pool.query<SongFolderRow>(
    'SELECT id, name, created_at, updated_at FROM song_folders ORDER BY name ASC',
  );
  res.json(result.rows.map(rowToFolder));
});

foldersRouter.post('/', async (req, res) => {
  const folder = parseFolderBody(req.body);
  if (!folder) {
    res.status(400).json({ error: 'Неверное тело запроса' });
    return;
  }

  const result = await pool.query<SongFolderRow>(
    `INSERT INTO song_folders (id, name, updated_at)
     VALUES ($1, $2, NOW())
     RETURNING id, name, created_at, updated_at`,
    [folder.id, folder.name],
  );

  res.status(201).json(rowToFolder(result.rows[0]));
});

foldersRouter.put('/:id', async (req, res) => {
  const folder = parseFolderBody(req.body, req.params.id);
  if (!folder) {
    res.status(400).json({ error: 'Неверное тело запроса' });
    return;
  }

  const result = await pool.query<SongFolderRow>(
    `UPDATE song_folders
     SET name = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, created_at, updated_at`,
    [folder.id, folder.name],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Папка не найдена' });
    return;
  }

  res.json(rowToFolder(result.rows[0]));
});

foldersRouter.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE songs SET folder_id = NULL WHERE folder_id = $1', [req.params.id]);
    const result = await client.query('DELETE FROM song_folders WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Папка не найдена' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});
