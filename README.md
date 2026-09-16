# PakFix.pk

**Show the Problem. Get It Fixed.**

An AI-assisted home repair, maintenance and technician marketplace for Pakistan. One Laravel API
serves the public website, the customer web app, the professional dashboard, the admin panel, and
— later — the Android and iOS apps.

```
                      ┌──────────────────┐
                      │   PakFix API     │
                      │     Laravel      │
                      └────────┬─────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
          Next.js          Android App        iOS App
          (this repo)       (later)           (later)
```

---

## Status

**Phase 1 of 10 is complete.** The foundation is built and running: monorepo, database schema,
authentication, roles and permissions, the public site, and the design system.

| Phase | Scope | Status |
|---|---|---|
| 1 | Monorepo, database, auth, roles, design system | **Done** |
| 2 | Landing site, service pages, SEO, CMS | Partial — homepage and CMS wired |
| 3 | Customer dashboard, properties, assets, maintenance | Schema done, UI pending |
| 4 | AI diagnosis, images, safety classification | Schema and config done, provider pending |
| 5 | Technician marketplace, verification, service areas | Schema done, UI pending |
| 6 | Bookings, quotes, scheduling | Schema and state machine done, UI pending |
| 7 | Chat, notifications | Schema done |
| 8 | Payments, commission, invoices | Schema done |
| 9 | Admin dashboard, analytics, support, disputes | Schema done |
| 10 | PWA, API docs, testing, security audit, deployment | PWA and docs started |

See [docs/architecture.md](docs/architecture.md) for what each phase covers.

---

## Repository layout

```
pakfix-platform/
├── backend/          Laravel 12 API — the only place business logic lives
├── frontend/         Next.js 16 App Router — public site + web app
├── shared/           Constants and schemas shared across clients
├── docs/             Architecture, API, database, deployment, mobile
├── docker/           nginx, php, postgres, redis
└── docker-compose.yml
```

Laravel is the API, the authentication server, the business-logic layer and the queue processor.
It renders no product UI. Next.js renders everything a person sees and holds no business rules.

---

## Quick start with Docker

Needs Docker with Compose v2.

```bash
git clone <repository-url> pakfix-platform
cd pakfix-platform
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose up -d
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
docker compose exec api php artisan storage:link
```

- Website and web app — <http://localhost:3000>
- API — <http://localhost:8000/api/v1>

---

## Quick start without Docker

Needs PHP 8.2+ (8.3 recommended), Composer 2, Node 20+, and PostgreSQL 14+.

```bash
# API
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve                 # http://localhost:8000

# Queue worker and scheduler, in their own terminals
php artisan queue:work
php artisan schedule:work
```

```bash
# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev                       # http://localhost:3000
```

### No PostgreSQL to hand?

The whole platform runs on SQLite for local work. Set `DB_CONNECTION=sqlite` in `backend/.env`,
then `php artisan migrate:fresh --seed`. Everything works except the foreign-key constraints in
the final migration, which SQLite cannot add to an existing table — see
[docs/database.md](docs/database.md#sqlite-fallback). **PostgreSQL is the target for every real
environment.**

---

## Demo accounts

`php artisan migrate --seed` creates a working platform, not an empty one: Pakistan's provinces
and cities, 66 service categories, 18 services, settings, homepage content, verified
professionals, customers with properties and appliances, and bookings spread across the lifecycle.

All demo accounts use the password `password`.

| Role | Email |
|---|---|
| Super admin | `admin@pakfix.pk` |
| Support agent | `support@pakfix.pk` |
| Customer | `ayesha@example.com` |
| Customer | `bilal@example.com` |
| Technician | `ahmed.electrician@example.com` |
| Company owner | `company@coolcare.pk` |

Demo data is skipped in production unless `PAKFIX_SEED_DEMO=1` is set explicitly, so a deploy
cannot create sign-in-able accounts with a known password.

---

## Tests

```bash
cd backend && php artisan test
cd frontend && npx tsc --noEmit && npm run lint
```

---

## How authentication works

The same endpoints serve every client, with the credential that suits it:

- **The website** authenticates with a **Sanctum cookie session**. The credential is an httpOnly
  cookie JavaScript cannot read, so an XSS bug cannot steal a session. State-changing requests
  carry a CSRF token.
- **The mobile apps** authenticate with a **bearer token** against the same routes.

`token` in an auth response is therefore `null` for the browser and a string for a native client.

---

## Documentation

| Document | Covers |
|---|---|
| [docs/architecture.md](docs/architecture.md) | How the pieces fit, and why |
| [docs/database.md](docs/database.md) | Every table, the conventions, the deliberate deviations |
| [docs/api.md](docs/api.md) | Endpoints, envelopes, errors, auth |
| [docs/mobile-api.md](docs/mobile-api.md) | What a Flutter or React Native developer needs |
| [docs/deployment.md](docs/deployment.md) | VPS, Vercel, backups, disaster recovery |

---

## Conventions that are not negotiable

- **Money is integer minor units.** No float ever holds an amount. Totals, commission and
  discounts are calculated server-side only.
- **Sequential ids stay internal.** Public URLs and API payloads use UUIDs, and bookings carry a
  human reference such as `PF-2026-000125`.
- **A booking's history is append-only.** `booking_status_history` is never updated or pruned.
- **Authorisation is the server's job.** Roles in the frontend decide what to *render*; Laravel
  decides what is *allowed*, on every request.
- **Secrets never reach the browser.** The public bootstrap endpoint serves only settings
  explicitly marked public and non-secret.

---

## Licence

Proprietary. © PakFix.
