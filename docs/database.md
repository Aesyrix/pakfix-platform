# Database

PostgreSQL 14+. 20 migrations, roughly 95 tables.

```bash
cd backend
php artisan migrate --seed          # build it
php artisan migrate:fresh --seed    # rebuild from scratch
```

---

## Conventions

These hold across every table.

| Convention | Why |
|---|---|
| Integer minor units for money (`*_minor`) | A float must never hold an amount. Rs 4,500 is `450000`. |
| Public UUID alongside the primary key | Sequential ids stay internal; nobody can walk `/bookings/1`, `/bookings/2` and count the business. |
| Human reference on customer-facing records | `PF-2026-000125`. Quoted on the phone, printed on invoices. Restarts each year, allocated under a row lock. |
| `is_active` rather than deletion | Reference data is retired, not removed, so history keeps resolving. |
| Soft deletes on anything a person authored | Properties, bookings, reviews, messages. |
| Append-only history | `booking_status_history`, `transactions`, `audit_logs` have no `updated_at` and nothing updates them. |
| Snapshot, do not join, for the past | A booking copies its address. A property can be renamed; the job record must still say where the technician went. |
| Timestamps on everything | Except the append-only tables, which carry `created_at` alone. |

---

## Table groups

### Locations — `2026_09_16_100100`

`countries`, `provinces`, `cities`, `areas`

Country → province → city → area. Every address resolves to a city and optionally an area, so
search, SEO landing pages and technician service areas share one vocabulary.

`cities.is_served` marks the cities PakFix has actually launched in. Only those get local SEO
pages — a landing page for a city with no professionals is exactly the thin content the brief
warns against.

### Users — `100200`, `100400`

`users` (extended), `user_profiles`, `customer_profiles`

One `users` table for every role. What distinguishes a customer from a technician is the role
assignment plus which profile row they own — not a separate table per kind of person, which would
force a branch through authentication, messaging and notifications.

`users.status` is `active | pending | suspended | banned`, held as a string rather than an enum
column so operations can add a state without a migration against a live table.

### Services — `100300`

`service_categories`, `services`

**Deliberate deviation from the brief.** The entity list names `service_categories` *and*
`service_subcategories`. This schema instead gives `service_categories` a self-referencing
`parent_id`. The brief also asks for "unlimited categories and subcategories", and a parent id
delivers that at any depth; a second near-identical table would cap nesting at two levels and
duplicate every query. Top-level rows (`parent_id IS NULL`) are the categories a customer sees.

`services` are the bookable items hanging off a category, such as "AC general service". A category
with no services is still bookable — the customer describes the problem and the professional
quotes.

### Companies and technicians — `100500`, `100600`

`companies`, `company_members`, `technician_profiles`, `technician_verifications`,
`technician_documents`, `technician_services`, `technician_service_areas`,
`technician_portfolio_items`

Rating and job counters are denormalised onto `technician_profiles` because the matcher reads them
for every candidate on every search. They are maintained by event listeners, never edited by hand.

`technician_documents` holds CNIC scans. Those live on a private disk and are only reachable
through a short-lived signed URL; the model hides `path` and `disk` from serialisation, and
`technician_verifications` hides `cnic`.

### Properties — `100700`

`properties`, `property_images`, `property_assets`, `property_asset_media`

Everything PakFix remembers about a home hangs off a property: its appliances, its maintenance
schedule, and every job ever done there. Assets carry brand, model, warranty expiry and a service
interval, which is what turns "my AC is broken" into a useful service call.

### AI — `100800`

`ai_sessions`, `ai_messages`, `ai_media`, `ai_diagnoses`, `ai_recommendations`

Sessions can belong to a guest: someone can diagnose a problem on the marketing site before an
account exists, identified by `guest_token`, and the session is claimed at registration.

`ai_diagnoses.converted_booking_id` is what lets the admin dashboard report an honest
AI-to-booking conversion rate rather than a guess. `raw_response` keeps the untouched provider
payload, for auditing a bad diagnosis.

### Bookings — `100900`

`bookings`, `booking_status_history`, `booking_media`, `booking_invitations`

`bookings.status` moves only through `App\Enums\BookingStatus`, and only via the state machine,
which validates the transition and appends to `booking_status_history`. That table is never
updated or pruned, so a dispute months later can still be reconstructed.

`booking_invitations` records who was offered a job and what they did about it — and is where
acceptance rate and response time come from.

### Quotes — `101000`

`quote_requests`, `quote_request_media`, `quotes`, `quote_items`, `quote_questions`

One request goes to several professionals; each replies with its own quote carrying its own money
breakdown. `quote_items.total_minor` is recomputed from quantity × unit price on every save, so a
client cannot post its own line total.

### Messaging — `101100`

`conversations`, `conversation_participants`, `messages`, `message_attachments`,
`message_reads`, `user_blocks`

Participant-based rather than two-party, so a customer, a technician and a support agent can share
one thread when a job goes wrong. Moderation hides a message (`hidden_at`) rather than deleting
it, because a dispute needs the record.

### Payments — `101200`

`payments`, `transactions`, `refunds`, `commissions`, `technician_earnings`, `payouts`,
`payout_accounts`, `invoices`

`payments` is what the customer owes and pays. `transactions` is the append-only ledger of every
movement, including gateway callbacks.

`commissions` resolves most-specific-first: technician, then company, then category, then the
platform default in `config/pakfix.php`. The rate actually applied is **frozen onto**
`technician_earnings.commission_percentage` at completion, so a later change to commission rates
cannot silently rewrite what a technician was already promised.

### Reviews — `101300`

`reviews`, `review_media`, `favorites`

A unique index on `reviews.booking_id` is what keeps a professional from being reviewed twice for
one job, and what makes the verified badge mean something. `favorites` is polymorphic, covering
saved technicians, companies and services in one table.

### Maintenance — `101400`

`maintenance_schedules`, `maintenance_tasks`, `maintenance_logs`

A schedule is the recurring rule; a task is one dated occurrence; a log is what actually happened.
Keeping the three apart means editing a schedule never rewrites history.

Recurrence is expressed in months, which covers every case the brief lists — monthly filter,
quarterly pest control, six-monthly AC service — without dragging in a cron expression parser.

### Support and disputes — `101500`

`support_tickets`, `support_messages`, `support_message_attachments`, `disputes`, `dispute_media`

A dispute is separate from a ticket on purpose: it is attached to a booking, it can move money,
and its outcome is recorded as a decision rather than a conversation.

### Growth — `101600`

`coupons`, `coupon_service_categories`, `coupon_cities`, `coupon_usages`, `referrals`, `plans`,
`subscriptions`

A referral only qualifies once the invited user completes a first booking — registration alone is
not enough. Subscriptions are not switched on at launch, but the schema exists so PakFix Plus does
not need a migration against a large live database later.

### CMS — `101700`

`blog_categories`, `blog_tags`, `blog_posts`, `blog_post_tag`, `cms_pages`, `content_blocks`,
`faqs`, `testimonials`, `banners`

`content_blocks` is what makes the homepage editable: every string on it is a row, not markup.
`cms_pages.is_system` marks legal pages that can be edited but never deleted.

### Platform — `101800`

`settings`, `audit_logs`, `notification_preferences`, `device_tokens`, `verification_codes`

`settings` rows marked `is_secret` are encrypted at rest and never leave the API. Only rows marked
`is_public` **and** not secret reach the public bootstrap endpoint, so adding a credential to the
settings table can never leak it into the browser.

`verification_codes` stores only a hash of a one-time code, so a database leak does not hand out
live codes.

### Deferred constraints — `101900`

A handful of relationships are circular across files: a booking points at a coupon, a diagnosis at
the booking it became, an earning at the payout that settled it. The columns are declared with
their tables; the constraints are added here, once every table exists.

---

## SQLite fallback

For local work without a PostgreSQL server, set `DB_CONNECTION=sqlite`. Everything migrates and
the full test suite passes.

One difference: SQLite cannot add a foreign key to an existing table without rebuilding it, so
migration `101900` is skipped there and those five columns stay plain integers. On PostgreSQL and
MySQL — every environment that matters — the constraints are created normally.

The test suite runs on in-memory SQLite by default (`phpunit.xml`).

---

## Seed data

`php artisan db:seed` produces a working platform, not an empty one.

| Seeder | Creates |
|---|---|
| `RolePermissionSeeder` | 7 roles, 53 permissions, grants synced |
| `LocationSeeder` | Pakistan, 5 provinces, 21 cities (12 served), 80 areas |
| `ServiceCategorySeeder` | 66 categories (38 top level), 18 services |
| `SettingsSeeder` | 45 settings, including empty encrypted credential slots |
| `CmsSeeder` | Homepage blocks, FAQs, testimonials, legal pages, blog categories |
| `DemoDataSeeder` | Staff, 6 verified professionals, a company, 3 customers with properties and appliances, 6 bookings across the lifecycle, reviews |

Every seeder uses `updateOrCreate`, so re-running is safe.

`DemoDataSeeder` is skipped in production unless `PAKFIX_SEED_DEMO=1` is set, so a deploy cannot
create sign-in-able accounts with a known password.

---

## Indexing

Indexes follow the queries that actually run:

- `bookings` — `(customer_id, status)`, `(technician_profile_id, status)`,
  `(city_id, status, created_at)`, `scheduled_for`
- `technician_profiles` — `(city_id, verification_status, is_available)`, `(latitude, longitude)`
- `maintenance_tasks` — `(user_id, status, due_on)`
- `property_assets` — `next_service_due_on`, for the reminder sweep

Full-text search is intentionally absent: the brief calls for Meilisearch or Elasticsearch later,
and `pg_trgm` plus `unaccent` (installed by `docker/postgres/init`) covers fuzzy matching until
then.
