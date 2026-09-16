# Architecture

## The shape of the system

PakFix is one backend and several front ends. Laravel holds every rule; everything else is a view
onto it.

```
                         ┌───────────────────────────┐
                         │      PakFix API           │
                         │      Laravel 12           │
                         │                           │
                         │  Controllers (Api\V1)     │
                         │  Form Requests            │
                         │  Policies                 │
                         │  Services  ← the rules    │
                         │  Events / Listeners       │
                         │  Jobs (queued)            │
                         │  Notifications            │
                         │  Eloquent models          │
                         └─────┬───────────────┬─────┘
                               │               │
                     ┌─────────┘               └─────────┐
                     │                                   │
              ┌──────┴──────┐                    ┌───────┴──────┐
              │ PostgreSQL  │                    │    Redis     │
              │  the truth  │                    │ cache/queue  │
              └─────────────┘                    └──────────────┘
                               ▲
              ┌────────────────┼────────────────┐
              │                │                │
        ┌─────┴─────┐   ┌──────┴──────┐  ┌──────┴──────┐
        │  Next.js  │   │ Android app │  │   iOS app   │
        │ (today)   │   │  (later)    │  │   (later)   │
        └───────────┘   └─────────────┘  └─────────────┘
```

### Why the backend is not the frontend

The brief is explicit that native apps follow. If any rule lived only in Next.js — how commission
is split, when a booking may move to `completed`, whether a technician may see an address — then
shipping Android would mean either rewriting that rule or building a second backend. Both are how
platforms end up with two subtly different answers to the same question.

So: **Next.js never computes anything that matters.** It renders, it validates for the user's
benefit, and it asks the API for everything else.

---

## Request paths

There are two, and they are deliberately different.

### The public site — server-rendered

```
Browser → Next.js server component → API (cached, no auth) → HTML
```

Marketing pages, service pages, city pages and the blog are rendered on the server so crawlers
get complete HTML. These calls use `next: { revalidate }`, so the API is hit once per window
rather than once per visitor. If the API is briefly unreachable, `safeFetch` degrades the page to
fewer sections instead of a 500 — a visitor should never see a stack trace because the catalogue
endpoint hiccuped.

### The app — client-rendered, authenticated

```
Browser → React client component → TanStack Query → API (cookie session) → JSON
```

Everything behind a login is fetched in the browser with the user's own credential. Nothing
authenticated is server-rendered, so a cached page can never leak one customer's data to another.

---

## Authentication

| Client | Credential | Why |
|---|---|---|
| Next.js website | Sanctum cookie session | httpOnly; unreadable from JavaScript, so XSS cannot steal it |
| Android / iOS | Sanctum bearer token | No cookie jar; tokens are revocable per device |

Both hit the same controllers. `AuthController::establishSession()` decides which to issue based
on whether the request arrived with a session, and regenerates the session id on sign-in to
prevent session fixation.

`EnsureUserIsActive` re-checks account status on **every** authenticated request, not only at
sign-in, so suspending an account takes effect immediately rather than whenever a token expires.

---

## Authorisation

Three layers, in order:

1. **Route middleware** — `auth:sanctum`, `active`, `role:`, `permission:`.
2. **Policies** — per-record decisions ("is this *your* booking?").
3. **Form Requests** — what a given role may even submit.

The super admin is granted everything through a `Gate::before` rule rather than by holding every
permission row, so a permission added next month cannot accidentally exclude the one account that
exists to fix things.

The frontend's `can()` helper is a **render hint only**. Bypassing it in the browser reveals a
button that the API then refuses.

---

## Where business rules live

Controllers stay thin. Anything with a rule in it goes to a service:

| Service | Owns |
|---|---|
| `Auth\RegistrationService` | Creating an account: user, profile, role, referral link, in one transaction |
| `Booking\BookingStateMachine` | Which status transitions are legal, and appending history |
| `Matching\TechnicianMatcher` | Ranking professionals by distance, rating, completion, response |
| `Payment\CommissionCalculator` | The split, resolved most-specific-first |
| `Ai\AiManager` | Choosing a provider and enforcing safety classification |
| `Settings\SettingsRepository` | Admin-editable settings, cached, falling back to config |

A rule that exists in a controller is a rule the mobile app will not get.

---

## The AI layer

No vendor SDK is referenced outside one directory. `AiProviderInterface` is implemented by
`OpenAiProvider`, `GeminiProvider` and `AnthropicProvider`; `AiManager` resolves the active one
from the `settings` table, falling back to `config/ai.php`. An admin can switch providers from the
dashboard without a deploy.

**Safety is not the model's decision to make.** Every diagnosis carries a `safety_level`, and at
`emergency` the assistant is forbidden from returning repair steps at all — it returns evacuation
guidance and a route to a professional. That rule is enforced in `AiManager`, server-side, where
a prompt injection cannot reach it.

---

## Events and queues

Anything that can make a request slow is queued: e-mail and notifications, AI provider calls,
image processing and thumbnails, PDF invoices, report generation.

Denormalised counters — a technician's rating average, completed job count, acceptance rate — are
maintained by listeners rather than recalculated on read, because the matcher reads them for every
candidate on every search.

---

## Data conventions

These hold everywhere and are enforced by review, not by hope.

- **Money is integer minor units.** `total_minor`, `commission_minor`. No float ever holds an
  amount, and no total is ever accepted from a client.
- **Public identifiers are UUIDs.** The auto-increment id stays internal, where it keeps joins
  fast. Nobody can walk `/bookings/1`, `/bookings/2` and count the business.
- **History is append-only.** `booking_status_history`, `transactions` and `audit_logs` have no
  `updated_at` and nothing updates them.
- **Addresses are snapshotted onto a booking.** A property can be renamed or deleted; the job
  record must still say where the technician actually went.
- **Documents are private.** CNIC scans live on a private disk and are only ever reachable through
  a short-lived signed URL.

---

## Frontend structure

```
src/
├── app/
│   ├── (marketing)/     Public, server-rendered, indexed
│   ├── (auth)/          Sign-in and sign-up, noindex
│   └── dashboard/       Customer app, client-rendered, guarded
├── components/
│   ├── ui/              The design system. No business logic.
│   ├── layout/          Shells, navigation
│   ├── marketing/       Public-site sections
│   ├── auth/            Forms and guards
│   └── providers/       Query client, toasts, session restore
├── lib/api/             The only place fetch is called
├── stores/              Zustand — auth only
└── hooks/
```

`lib/api/client.ts` is the single door to the backend. Nothing else calls `fetch`, so the
envelope is unwrapped once, validation errors arrive in a usable shape, and CSRF is handled in
exactly one place.

---

## Design system

Defined once in `globals.css` as CSS custom properties, consumed as Tailwind tokens. No component
hardcodes a colour.

One rule earned the hard way: **a fixed light token must never sit under theme-dependent text.**
`bg-brand-50` is light in both themes, so light text on it disappears in dark mode. Brand-tinted
surfaces use the theme-aware `--brand-wash`, or a solid fill with an explicit text colour.

---

## What Phase 1 delivered

- Monorepo, Docker stack, environment templates
- 20 migrations, ~95 tables, covering every entity in the brief
- 39 Eloquent models with relationships, scopes and casts
- 15 domain enums, including the booking state machine's transition rules
- 7 roles, 53 permissions, seeded and synced
- Sanctum auth: register, login by email or phone, verification, reset, device management
- Public API: bootstrap, content blocks, FAQs, testimonials, CMS pages, catalogue, locations
- Seeders producing a genuinely usable platform on first run
- 25 passing feature tests
- Next.js app: design system, homepage rendered from the CMS, auth pages, dashboard shell with
  mobile bottom navigation, PWA manifest, sitemap, robots
