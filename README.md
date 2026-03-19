# 🎓 Staffup LMS — Backend API

> Internal Learning Management System for Staffup — built with Node.js, TypeScript, Express.js, Prisma & PostgreSQL.

## ⚡ Tech Stack

| Category         | Technology                                |
| ---------------- | ----------------------------------------- |
| Runtime          | Node.js 20+ with TypeScript (strict mode) |
| Framework        | Express.js v5                             |
| Database         | PostgreSQL 16                             |
| ORM              | Prisma v7                                 |
| Auth             | JWT + Argon2 password hashing             |
| Validation       | Zod                                       |
| Security         | Helmet, CORS, RBAC                        |
| Logging          | Winston + Morgan                          |
| Containerization | Docker + Docker Compose                   |
| Package Manager  | pnpm                                      |

## 📂 Project Structure

```
src/
├── config/          # Database, JWT, env, logger configuration
├── controllers/     # HTTP request/response handlers
├── interfaces/      # TypeScript types and interfaces
├── middlewares/      # Auth, RBAC, validation, error handling
├── routes/v1/       # API route definitions (versioned)
├── schemas/         # Zod validation schemas
├── services/        # Core business logic
├── utils/           # Helper functions (AppError, catchAsync, apiResponse)
├── app.ts           # Express application setup
└── server.ts        # Entry point
prisma/
├── schema.prisma    # Database models
└── migrations/      # Database migrations
```

**Architecture:** Controller → Service → Prisma (Layered Architecture)

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://docker.com/products/docker-desktop) (running)
- [Node.js 20+](https://nodejs.org)
- [pnpm](https://pnpm.io) — `npm install -g pnpm`

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/<your-org>/staffup-lms-backend.git
cd staffup-lms-backend

# 2. Create environment file
cp .env.example .env

# 3. Install dependencies
pnpm install

# 4. Start Docker containers (API + PostgreSQL)
docker compose up --build

# 5. Run database migrations (new terminal)
docker compose exec api pnpm prisma:migrate

# 6. Verify — open in browser
curl http://localhost:3000/api/v1/health
```

## 🧹 Code Quality

> 💡 Dự án sử dụng **Husky + lint-staged** — mỗi commit sẽ tự động chạy ESLint + Prettier trên các file thay đổi.

## 🐳 Docker Commands

```bash
docker compose up --build     # Build & start all services
docker compose up -d          # Start in background
docker compose down           # Stop all services
docker compose logs -f api    # View API logs
docker compose exec api sh    # Shell into API container
```

## 🗄️ Database Commands

```bash
docker compose exec api pnpm prisma:migrate   # Create & run migrations
docker compose exec api pnpm prisma:generate  # Regenerate Prisma Client
docker compose exec api pnpm prisma:studio    # Open database GUI
```

## 🔑 Environment Variables

| Variable            | Description                  | Default       |
| ------------------- | ---------------------------- | ------------- |
| `NODE_ENV`          | Environment                  | `development` |
| `PORT`              | Server port                  | `3000`        |
| `DATABASE_URL`      | PostgreSQL connection string | —             |
| `POSTGRES_USER`     | DB username (Docker)         | `admin`       |
| `POSTGRES_PASSWORD` | DB password (Docker)         | —             |
| `POSTGRES_DB`       | DB name (Docker)             | `staffup_lms` |
| `JWT_SECRET`        | Token signing secret         | —             |
| `JWT_EXPIRES_IN`    | Token expiration             | `7d`          |
| `CORS_ORIGIN`       | Allowed CORS origin          | `*`           |
