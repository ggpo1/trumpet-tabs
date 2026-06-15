import pg from 'pg';
import type { Song, SongRow } from './types.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgres://trumpet:trumpet@localhost:5432/trumpet_tabs',
});

export function rowToSong(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    tempo: row.tempo,
    notes: row.notes,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function initDb(): Promise<void> {
  const retries = Number(process.env.DB_CONNECT_RETRIES ?? 30);
  const delayMs = Number(process.env.DB_CONNECT_DELAY_MS ?? 1000);

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const client = await pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS songs (
          id UUID PRIMARY KEY,
          title TEXT NOT NULL DEFAULT 'Новая песня',
          artist TEXT NOT NULL DEFAULT '',
          tempo INTEGER NOT NULL DEFAULT 100,
          notes JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS songs_updated_at_idx ON songs (updated_at DESC);
      `);
      client.release();
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
