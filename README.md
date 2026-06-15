# Trumpet Tabs

Редактор аппликатуры для трубы — отмечайте клапаны и собирайте разборы песен.

## Локальная разработка

### 1. PostgreSQL

```bash
docker run -d --name trumpet-pg \
  -e POSTGRES_USER=trumpet \
  -e POSTGRES_PASSWORD=trumpet \
  -e POSTGRES_DB=trumpet_tabs \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. API (порт 5181)

```bash
cd server
npm install
npm run dev
```

### 3. Фронтенд

```bash
npm install
npm run dev
```

Откройте http://localhost:5173 — запросы к `/api` проксируются на http://localhost:5181

## Возможности

- **3 клапана** — кликайте, чтобы отметить зажатые клапаны (1, 2, 3 или ○ — все открыты)
- **Последовательность нот** — добавляйте ноты, указывайте длительность и слоги из текста песни
- **Подсказка аппликатуры** — при вводе «до», «ре», «G» и т.д. подставляется стандартная аппликатура Bb-трубы
- **Проигрывание** — визуальный проход по нотам с учётом BPM
- **Несколько песен** — сохранение в PostgreSQL, экспорт/импорт JSON

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/health` | Проверка сервера |
| GET | `/api/songs` | Список песен |
| GET | `/api/songs/:id` | Одна песня |
| POST | `/api/songs` | Создать песню |
| PUT | `/api/songs/:id` | Обновить песню |
| DELETE | `/api/songs/:id` | Удалить песню |

## Docker Compose

```bash
docker compose up -d --build
```

- Фронтенд: http://localhost:5180
- API: http://localhost:5181
- PostgreSQL: `postgres://trumpet:trumpet@localhost:5432/trumpet_tabs` (внутри сети — хост `postgres`)

Остановка:

```bash
docker compose down
```

Данные БД сохраняются в volume `pgdata`.

## Сборка фронтенда

```bash
npm run build
npm run preview
```
