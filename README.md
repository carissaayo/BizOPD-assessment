# BizOPD Order API

Scalable Express + TypeScript API for managing custom orders, production stages, and dashboard statistics.

## Stack

- **Express** — HTTP server
- **TypeScript** — type safety
- **MongoDB + Mongoose** — persistence
- **Redis** — dashboard cache (60s TTL)
- **Zod** — request and env validation

## Setup Instructions

### Prerequisites

- Node.js 18+
- Docker (recommended for MongoDB and Redis)

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Update `.env` if your MongoDB or Redis URLs differ from the defaults.

### 3. Start MongoDB and Redis

Using Docker:

```bash
docker compose up -d
```

This starts:

- MongoDB on `localhost:27017`
- Redis on `localhost:6379`

### 4. Run the API

Development (with hot reload):

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

The server runs at `http://localhost:3000` by default.

### 5. Verify

```bash
curl http://localhost:3000/health
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check (MongoDB + Redis status) |
| `POST` | `/orders` | Create a new order |
| `GET` | `/orders` | List/search orders (`?search=`, `?page=`, `?limit=`) |
| `PATCH` | `/orders/:id/stage` | Move an order to the next production stage |
| `GET` | `/dashboard` | Dashboard stats (cached) |

### Example requests

**Create order**

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "phone": "555-1234",
    "product": "Custom Mug",
    "stage": "Pending Design"
  }'
```

**Search orders**

```bash
curl "http://localhost:3000/orders?search=john"
```

**Update stage**

```bash
curl -X PATCH http://localhost:3000/orders/<order-id>/stage \
  -H "Content-Type: application/json" \
  -d '{ "newStage": "Awaiting Approval" }'
```

**Dashboard**

```bash
curl http://localhost:3000/dashboard
```

## Assumptions Made

- **Stage workflow** — Orders follow a fixed linear pipeline: Pending Design → Awaiting Approval → Printing → Framing → Packaging → Ready for Pickup → Delivered. Orders cannot skip stages, move backwards, or change after delivery.
- **New orders** — All new orders start at `"Pending Design"`.
- **Order IDs** — MongoDB ObjectIds are exposed as `id` in API responses.
- **Search** — `GET /orders?search=` performs a case-insensitive partial match on `customerName` and `phone`. Without a search term, all orders are returned (paginated).
- **Pagination** — Default page size is 20; maximum is 100.
- **`inProduction`** — Calculated as `totalOrders - delivered` (any order not in the Delivered stage).
- **No authentication** — The API is open; auth was out of scope for this assessment.
- **Single-tenant** — One business, one database; no multi-tenant isolation.
- **Redis is optional at runtime** — If Redis is unavailable, the dashboard still works by querying MongoDB directly (slower, but functional).

## Caching Approach

The `/dashboard` endpoint uses a **cache-aside** pattern with Redis.

**How it works**

1. On `GET /dashboard`, the service checks Redis for key `dashboard:stats`.
2. **Cache hit** — Stats are returned immediately from Redis.
3. **Cache miss** — Stats are computed from MongoDB (`totalOrders`, `delivered`, then `inProduction = totalOrders - delivered`), stored in Redis with a **60-second TTL** (`EX 60`), and returned.
4. **Cache invalidation** — Creating an order or updating a stage deletes the cache key so the next dashboard request gets fresh data.

**Why this approach**

- Dashboard stats are read-heavy and expensive to compute on every request (two `countDocuments` calls).
- A 60-second TTL balances freshness with performance.
- Invalidation on writes keeps stats accurate after mutations without waiting for TTL expiry.
- If Redis fails, the API degrades gracefully and still returns correct stats from MongoDB.

## Scalability Question

**Assume this application now manages 2 million orders and the `/dashboard` endpoint takes 7 seconds to load. Without changing the API response, what improvements would you make to improve performance and scalability?**

At 2 million orders, `/dashboard` is slow because it recalculates stats from the database instead of reading precomputed values. The API response can stay the same.

**Improvements:**

1. **Use incremental counters** — Update `totalOrders`, `delivered`, and `inProduction` when orders are created or stages change, instead of counting millions of records on each request.
2. **Cache stats in Redis** — Serve dashboard data from Redis so most requests avoid MongoDB.
3. **Update cache on writes** — On order create/update, adjust counters in Redis instead of deleting the cache and forcing a full recount.
4. **Pre-warm the cache** — Refresh stats in the background before the cache expires so users rarely wait for a slow recompute.
5. **Use one database query** — If full recounts are still needed sometimes, use a single aggregation instead of multiple `countDocuments` calls.
6. **Scale infrastructure** — Use MongoDB read replicas for dashboard reads, Redis HA, connection pooling, and horizontal scaling of the API behind a load balancer.
7. **Improve search scalability** — Add text indexes for `customerName` and `phone`, and use pagination so `/orders?search=` stays fast at large scale.

**Summary:** Keep the same response, but stop counting 2M orders on every request. Maintain stats incrementally at write time and serve them from cache.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | `development`, `production`, `test` | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/bizopd` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `CORS_ORIGIN` | Allowed CORS origin(s) | `*` |
| `TRUST_PROXY` | Trust reverse proxy headers | `false` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `BODY_LIMIT` | Max request body size | `10kb` |

## Project Structure

```
src/
├── server.ts              # Entry point, graceful shutdown
├── app.ts                 # Express app, middleware, routes
├── config/                # Env and security config
├── core/
│   ├── cache/             # Redis client
│   ├── constants/         # Stage definitions
│   ├── db/                # MongoDB connection, query builder
│   ├── errors/            # Error types and MongoDB error mapping
│   ├── handlers/          # Controller, response, try/catch helpers
│   └── middleware/        # Validation, security, error handling
├── models/                # Mongoose schemas
├── repositories/          # Data access layer
├── services/              # Business logic
├── controllers/         # HTTP handlers
├── routes/                # Route definitions
└── validation/            # Zod schemas
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled production build |
| `npm run typecheck` | Type-check without emitting |
