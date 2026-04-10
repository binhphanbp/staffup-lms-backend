# 🎓 Staffup LMS — Backend API

> Internal Learning Management System for Staffup — built with Node.js, TypeScript, Express.js, Prisma & PostgreSQL.

## Tech Stack

| Category         | Technology                                    |
| ---------------- | --------------------------------------------- |
| Runtime          | Node.js 20+ with TypeScript (strict mode)     |
| Framework        | Express.js v5                                 |
| Database         | PostgreSQL 16                                 |
| ORM              | Prisma v7                                     |
| Auth             | JWT access tokens + rotating refresh sessions |
| Validation       | Zod                                           |
| Security         | Helmet, CORS, RBAC                            |
| Logging          | Winston + Morgan                              |
| Containerization | Docker + Docker Compose                       |
| Package Manager  | pnpm                                          |

## Project Structure

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

## Quick Start

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

## API Docs

- Scalar UI: `http://localhost:3000/api/v1/docs`
- OpenAPI JSON: `http://localhost:3000/api/v1/openapi.json`

The API reference is rendered with Scalar and reads from the local OpenAPI document served by this app.

Auth endpoints currently include `register`, `login`, `refresh`, `logout`, and `me`.
`login` and `refresh` rotate an httpOnly refresh token cookie scoped to `/api/v1/auth`.

## Code Quality

> 💡 Dự án sử dụng **Husky + lint-staged** — mỗi commit sẽ tự động chạy ESLint + Prettier trên các file thay đổi.

## Docker Commands

```bash
docker compose up --build     # Build & start all services
docker compose up -d          # Start in background
docker compose down           # Stop all services
docker compose logs -f api    # View API logs
docker compose exec api sh    # Shell into API container
```

## Database Commands

```bash
docker compose exec api pnpm prisma:migrate   # Create & run migrations
docker compose exec api pnpm prisma:generate  # Regenerate Prisma Client
docker compose exec api pnpm prisma:seed      # Seed default RBAC + first admin
docker compose exec api pnpm prisma:seed:demo # Reset DB and load large demo dataset
docker compose exec api pnpm prisma:studio    # Open database GUI
```

## Environment Variables

| Variable                        | Description                  | Default                 |
| ------------------------------- | ---------------------------- | ----------------------- |
| `NODE_ENV`                      | Environment                  | `development`           |
| `PORT`                          | Server port                  | `3000`                  |
| `DATABASE_URL`                  | PostgreSQL connection string | —                       |
| `POSTGRES_USER`                 | DB username (Docker)         | `admin`                 |
| `POSTGRES_PASSWORD`             | DB password (Docker)         | —                       |
| `POSTGRES_DB`                   | DB name (Docker)             | `staffup_lms`           |
| `JWT_SECRET`                    | Token signing secret         | —                       |
| `JWT_EXPIRES_IN`                | Token expiration             | `7d`                    |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Refresh session duration     | `30`                    |
| `REFRESH_TOKEN_COOKIE_NAME`     | Refresh cookie name          | `staffup_refresh_token` |
| `CORS_ORIGIN`                   | Allowed CORS origin          | `*`                     |
| `CLOUDINARY_CLOUD_NAME`         | Cloudinary cloud name        | —                       |
| `CLOUDINARY_API_KEY`            | Cloudinary API key           | —                       |
| `CLOUDINARY_API_SECRET`         | Cloudinary API secret        | —                       |
| `CLOUDINARY_UPLOAD_FOLDER`      | Default Cloudinary folder    | `staffup-lms`           |
| `SEED_ADMIN_DEPARTMENT_NAME`    | Seed admin department name   | `General`               |
| `SEED_ADMIN_FULL_NAME`          | Seed admin full name         | `System Administrator`  |
| `SEED_ADMIN_POSITION_TITLE`     | Seed admin title             | `Administrator`         |
| `SEED_ADMIN_EMAIL`              | Seed admin email             | `admin@staffup.local`   |
| `SEED_ADMIN_PASSWORD`           | Seed admin password          | `ChangeMe123`           |
| `SEED_DEMO`                     | Enable full demo dataset     | `false`                 |
| `SEED_DEMO_PASSWORD`            | Demo account password        | `Test1234`              |

## Default Seed Data

Running `pnpm prisma:seed` will create or update:

- System roles: `admin`, `manager`, `trainer`, `employee`
- Base RBAC permissions and role-permission mappings
- The first admin user from `SEED_ADMIN_*` environment variables

The seed script is idempotent, so it can be run multiple times without creating duplicate RBAC records.

If you need a full demo dataset for local development, run `pnpm prisma:seed:demo`.
That demo script is destructive by design: it clears the current database before loading sample departments, users, courses, roadmaps, quizzes, and progress data.
It also seeds modules, lessons, lesson resources, roadmap assignments, enrollments, certificates, quiz attempts, and risk assessments for end-to-end testing.

## Seed Conventions

The seed system is split into small modules under `prisma/seeds/`:

- `prisma/seed.js`: thin entrypoint only, do not add feature-specific seed logic here
- `prisma/seeds/core/`: idempotent system data required by the app
- `prisma/seeds/demo/`: optional local demo data for development/testing
- `prisma/seeds/shared/`: shared client setup and reusable seed data/constants

Current core seed responsibilities:

- `prisma/seeds/core/rbac.seed.js`: system roles, permissions, and role-permission mappings
- `prisma/seeds/core/departments.seed.js`: default admin department
- `prisma/seeds/core/admin.seed.js`: first admin user from `SEED_ADMIN_*`

Rules for contributors:

- Add data to `core` only if it is required system data that every environment should have
- Add data to `demo` only if it is sample data for local development or testing
- Do not use seed scripts to compensate for missing migrations; schema changes belong in Prisma migrations
- Keep `pnpm prisma:seed` safe and idempotent
- Treat `pnpm prisma:seed:demo` as destructive; use it only when resetting a local dev database is acceptable

Examples:

- New RBAC permission or system role: update `prisma/seeds/shared/rbac.data.js`
- New first-admin defaults: update `.env` / `.env.example`, not hardcoded values
- New sample courses, quizzes, or enrollments: add them under `prisma/seeds/demo/`
