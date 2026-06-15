import cors from 'cors';
import express from 'express';
import { initDb } from './db.js';
import { songsRouter } from './routes/songs.js';

const app = express();
const port = Number(process.env.PORT ?? 5181);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/songs', songsRouter);

async function main() {
  await initDb();
  app.listen(port, '0.0.0.0', () => {
    console.log(`API listening on http://0.0.0.0:${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
