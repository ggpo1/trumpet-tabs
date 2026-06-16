# Trumpet Tabs

Trumpet fingering editor — mark valve combinations and build song breakdowns.

## Local Development

### 1. PostgreSQL

```bash
docker run -d --name trumpet-pg \
  -e POSTGRES_USER=trumpet \
  -e POSTGRES_PASSWORD=trumpet \
  -e POSTGRES_DB=trumpet_tabs \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. API (port 5181)

```bash
cd server
npm install
npm run dev
```

### 3. Frontend

```bash
npm install
npm run dev
```

Open http://localhost:5173 — requests to `/api` are proxied to http://localhost:5181

## Features

- **3 valves** — click to mark pressed valves (1, 2, 3, or ○ for all open)
- **Note sequence** — add notes, set durations, and attach syllables from song lyrics
- **Fingering hint** — when you type notes like "C", "D", "G", etc., standard Bb trumpet fingering is suggested
- **Playback** — visual note-by-note playback synchronized with BPM
- **Multiple songs** — saved in PostgreSQL, with JSON export/import

## API

| Method | Path | Description |
|-------|------|----------|
| GET | `/health` | Server health check |
| GET | `/api/songs` | List songs |
| GET | `/api/songs/:id` | Get a single song |
| POST | `/api/songs` | Create a song |
| PUT | `/api/songs/:id` | Update a song |
| DELETE | `/api/songs/:id` | Delete a song |

## Docker Compose

```bash
docker compose up -d --build
```

- Frontend: http://localhost:5180
- API: http://localhost:5181
- PostgreSQL: `postgres://trumpet:trumpet@localhost:5432/trumpet_tabs` (inside the Docker network, host is `postgres`)

Stop:

```bash
docker compose down
```

Database data is persisted in the `pgdata` volume.

## Frontend Build

```bash
npm run build
npm run preview
```
