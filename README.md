# PakFix.pk

**Show the Problem. Get It Fixed.**

An AI-assisted home repair, maintenance and technician marketplace for Pakistan. One Laravel API
serves the public website, the customer web app, the admin panel, and — later — the Android and
iOS apps.

---

## One command

Everything runs through PHP. From the repository root:

```bash
php pakfix start
```

That installs dependencies, creates `.env`, migrates and seeds the database, builds the website and
serves the whole platform at **http://127.0.0.1:8000** — website, API and admin on one port, with
no Node process running.

| Command | What it does |
|---|---|
| `php pakfix start` | Set up if needed, build the website, run everything |
| `php pakfix setup` | First-time setup only |
| `php pakfix build` | Rebuild the website into `backend/public` |
| `php pakfix deploy` | Production release: dependencies, migrations, build, caches, worker restart |
| `php pakfix package` | Zip a ready-to-upload release for PHP-only hosting |
| `php pakfix admin` | Create an admin account |
| `php pakfix test` | Run the backend test suite |

Node is needed **only to build** the website, not to serve it. Build on your machine, run
`php pakfix package`, upload the zip, and the server needs nothing but PHP and a database.

---

## How the website is served

The Next.js app is compiled to static HTML and installed into Laravel's `public/` folder.
`App\Http\Controllers\FrontendController` maps clean URLs onto those files, so Apache, nginx or
`php pakfix start` all serve the same site the same way.

Pages whose content lives in the database — an article, a professional's profile, a service, a
local page — are re-checked against the database on every request:

- **Published after the last build?** Served from a pre-built shell page, with the real title,
  description and canonical URL written into the HTML by PHP, so search engines see the right
  metadata without a rebuild.
- **Unpublished or suspended since the build?** The built file is ignored and the page 404s
  immediately, rather than lingering until the next deploy.
- **Database unreachable?** Pages that were built are still served. A database blip costs the
  dynamic pages, not the whole site.

---

## Status

**Phases 1 and 2 are complete.**

| Phase | Scope | Status |
|---|---|---|
| 1 | Monorepo, database, auth, roles, design system | **Done** |
| 2 | Public website, services, local SEO, blog, CMS and admin | **Done** |
| 3 | Customer dashboard: properties, assets, maintenance | Schema done, UI pending |
| 4 | AI diagnosis: images, safety classification, providers | Schema, config and safety triage done |
| 5 | Technician marketplace: onboarding, verification | Schema and public directory done |
| 6 | Bookings, quotes, scheduling | Schema and state machine done |
| 7 | Chat, notifications | Schema done |
| 8 | Payments, commission, invoices | Schema done |
| 9 | Admin operations: analytics, support, disputes | Content admin done; operations pending |
| 10 | PWA, API docs, testing, security audit, deployment | PWA, docs and deployment done |

---

## Pages

**Public** — all server-rendered at build time and indexed.

```
/                         Homepage
/services                 Every service
/services/<service>       Service page: problems, prices, coverage, professionals, FAQs
/<city>                   City page, e.g. /lahore
/<trade>/<city>           Local SEO page, e.g. /plumber/lahore
/find-a-technician        Directory, filterable by city, service and emergency cover
/professionals/<slug>     A professional's public profile and reviews
/ai                       Describe a problem: safety screening and service matching
/search                   Site search
/blog, /blog/<slug>       Guides, with category pages
/how-it-works  /pricing  /about  /contact  /faq  /safety
/become-a-technician  /for-service-companies  /for-property-managers  /home-maintenance
/terms-of-service  /privacy-policy  /refund-policy  /pages/<slug>
```

**Accounts** — `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`

**Customer app** — `/dashboard` and its sections

**Admin** — `/admin` overview, plus homepage sections, FAQs, testimonials, pages, guides,
services, the contact inbox and settings. Every screen reads and writes live data, and every
change is audited and live immediately.

A local page only exists where verified professionals actually cover that service in that city, so
the site never generates a page promising work nobody can do.

---

## Repository layout

```
pakfix-platform/
├── pakfix            The launcher: php pakfix <command>
├── backend/          Laravel 12 API, and the server that hosts the built website
├── frontend/         Next.js 16 App Router — compiled to static files at build time
├── shared/           Domain vocabulary shared by every client
├── docs/             Architecture, API, database, deployment, mobile
└── docker/           nginx, php, postgres, redis
```

---

## Setting up by hand

Needs PHP 8.2+ (8.3 recommended), Composer, Node 20+, and PostgreSQL 14+ (SQLite works locally).

```bash
cd backend
cp .env.example .env
composer install
php artisan pakfix:install     # key, migrations, seed data, storage link, website build
php artisan pakfix:serve       # http://127.0.0.1:8000
```

`pakfix:install` falls back to a local SQLite file if it cannot reach the configured database, so a
machine without PostgreSQL still gets a working platform.

### Working on the frontend

For hot reload while editing the website:

```bash
cd backend && php artisan serve      # API on :8000
cd frontend && npm run dev           # website on :3000
```

Rebuild into Laravel with `php pakfix build` when you are done.

---

## Demo accounts

Seeding creates a working platform: Pakistan's provinces and cities, 66 service categories,
editable homepage content, five guides, verified professionals, customers with properties, and
bookings across the lifecycle. All demo accounts use the password `password`.

| Role | Email |
|---|---|
| Super admin | `admin@pakfix.pk` |
| Support agent | `support@pakfix.pk` |
| Customer | `ayesha@example.com` |
| Technician | `ahmed.electrician@example.com` |
| Company owner | `company@coolcare.pk` |

Demo accounts are never created in production unless `PAKFIX_SEED_DEMO=1` is set. Create the first
real admin with `php pakfix admin`.

---

## Tests

```bash
php pakfix test                                  # 71 backend tests
cd frontend && npx tsc --noEmit && npm run lint
```

---

## How authentication works

The same endpoints serve every client, with the credential that suits it:

- **The website** uses a **Sanctum cookie session** — an httpOnly cookie JavaScript cannot read, so
  an XSS bug cannot steal a session. State-changing requests carry a CSRF token.
- **The mobile apps** use a **bearer token** against the same routes.

`token` in an auth response is therefore `null` for the browser and a string for a native client.

---

## Documentation

| Document | Covers |
|---|---|
| [docs/architecture.md](docs/architecture.md) | How the pieces fit, and why |
| [docs/database.md](docs/database.md) | Every table, the conventions, the deliberate deviations |
| [docs/api.md](docs/api.md) | Endpoints, envelopes, errors, auth |
| [docs/mobile-api.md](docs/mobile-api.md) | What a Flutter or React Native developer needs |
| [docs/deployment.md](docs/deployment.md) | VPS, shared hosting, backups, disaster recovery |

---

## Conventions that are not negotiable

- **Money is integer minor units.** No float ever holds an amount. Totals, commission and discounts
  are calculated server-side only.
- **Sequential ids stay internal.** Public URLs and API payloads use UUIDs; bookings carry a human
  reference such as `PF-2026-000125`.
- **A booking's history is append-only.** `booking_status_history` is never updated or pruned.
- **Authorisation is the server's job.** Roles in the frontend decide what to *render*; Laravel
  decides what is *allowed*, on every request.
- **Secrets never reach the browser.** The public bootstrap endpoint serves only settings
  explicitly marked public and non-secret.
- **Dangerous problems are never talked through.** Gas leaks, sparking sockets, exposed wiring,
  structural movement and flooding are classified as emergencies before anything else happens, and
  the response is safety guidance and a professional — never repair steps.

---

## Licence

Proprietary. © PakFix.
