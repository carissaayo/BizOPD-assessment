# BizOPD Order API

Scalable Express + TypeScript API for managing custom orders, production stages, and dashboard statistics.

## Stack

- **Express** — HTTP server
- **TypeScript** — type safety
- **MongoDB + Mongoose** — persistence
- **Redis** — dashboard cache (60s TTL)
- **Zod** — request and env validation

## Getting Started

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MongoDB and Redis (local or via Docker).

4. Run in development:

   ```bash
   npm run dev
   ```

5. Build for production:

   ```bash
   npm run build
   npm start
   ```

## Environment Variables

| Variable      | Description                          | Default                              |
|---------------|--------------------------------------|--------------------------------------|
| `NODE_ENV`    | `development`, `production`, `test`  | `development`                        |
| `PORT`        | Server port                          | `3000`                               |
| `MONGODB_URI` | MongoDB connection string            | `mongodb://localhost:27017/bizopd`   |
| `REDIS_URL`   | Redis connection string              | `redis://localhost:6379`             |
| `CORS_ORIGIN` | Allowed CORS origin(s)               | `*`                                  |

## Project Structure

```
src/
├── config/         # Typed env loader
├── db/             # MongoDB connection
├── cache/          # Redis client
├── constants/      # Stage definitions
├── models/         # Mongoose schemas
├── validation/     # Zod schemas
├── middleware/     # Validation, security, errors
├── errors/         # AppError types
├── repositories/   # Data access layer
├── services/       # Business logic
├── controllers/    # HTTP handlers
└── routes/         # Route definitions
```
