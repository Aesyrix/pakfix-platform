# PakFix API — v1

Base URL: `{APP_URL}/api/v1`

Every client uses these endpoints. Nothing meaningful happens anywhere else.

---

## The envelope

**Every** response has the same shape, so a client can decode it generically.

**Success**

```json
{
  "success": true,
  "message": "Signed in.",
  "data": { }
}
```

**Success, paginated** — pagination sits in a sibling `meta`, never inside `data`, so `data` is
always the payload itself.

```json
{
  "success": true,
  "message": "OK",
  "data": [ ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 25,
      "total": 138,
      "last_page": 6,
      "has_more": true
    }
  }
}
```

**Failure**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "phone": ["Enter a valid Pakistani mobile number, for example 0300 1234567."]
  }
}
```

`errors` is present only on a 422. A 204 carries no body at all.

### Status codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No content |
| 401 | Not authenticated, or the credential expired |
| 403 | Authenticated, but not allowed — or the account is suspended |
| 404 | No such record, or no such endpoint |
| 422 | Validation failed; read `errors` |
| 429 | Rate limited |
| 500 | Server error; the message is deliberately generic in production |

---

## Authentication

Two credentials, one set of endpoints.

### Browser (cookie session)

1. `GET {APP_URL}/sanctum/csrf-cookie` — sets `XSRF-TOKEN`.
2. Send `X-XSRF-TOKEN` on every non-GET request, with `credentials: include`.
3. `POST /auth/login` returns `token: null`; the session cookie is the credential.

### Native app (bearer token)

`POST /auth/login` from a client without a session returns a token string. Send it as
`Authorization: Bearer {token}` on every request.

---

## Endpoints

### Public — no authentication

| Method | Path | Returns |
|---|---|---|
| `GET` | `/` | API name and version |
| `GET` | `/bootstrap` | Brand, currency, enabled payment methods, feature flags, SEO defaults |
| `GET` | `/content/blocks?page=home` | Editable content blocks, keyed by block key |
| `GET` | `/content/faqs?group=` | FAQs; omit `group` for the general set |
| `GET` | `/content/testimonials` | Published testimonials |
| `GET` | `/content/pages/{slug}` | A CMS page (terms, privacy, refunds, safety) |
| `GET` | `/services/categories` | Category tree; `?flat=1` un-nests, `?popular=1` filters |
| `GET` | `/services/categories/{slug}` | One category with subcategories, services and FAQs |
| `GET` | `/services?category={slug}` | Bookable services, paginated |
| `GET` | `/locations/provinces` | Provinces with their cities |
| `GET` | `/locations/cities?served=1` | Cities; `served=1` limits to launched cities |
| `GET` | `/locations/cities/{slug}` | One city with its areas |
| `GET` | `/locations/cities/{slug}/areas?q=` | Areas within a city, searchable |

These are cached server-side and safe for a crawler to hit.

### Authentication

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/auth/register` | — | Throttled 10/min |
| `POST` | `/auth/login` | — | Throttled 10/min, plus 5 failures per identifier+IP |
| `POST` | `/auth/forgot-password` | — | Always succeeds, so it cannot confirm who has an account |
| `POST` | `/auth/reset-password` | — | Revokes every existing session |
| `GET` | `/auth/verify-email/{id}/{hash}` | signed | Redirects to the frontend |
| `GET` | `/auth/me` | yes | The current user |
| `GET` | `/auth/verification-status` | yes | Email and phone verification flags |
| `POST` | `/auth/verify-email/resend` | yes | Throttled 6/min |
| `POST` | `/auth/logout` | yes | Ends this session or revokes this token |
| `POST` | `/auth/logout-all` | yes | Revokes every token |
| `GET` | `/auth/devices` | yes | Signed-in devices |
| `DELETE` | `/auth/devices/{tokenId}` | yes | Sign one device out |

---

## `POST /auth/register`

```json
{
  "name": "Ayesha Siddiqui",
  "email": "ayesha@example.com",
  "phone": "03001234567",
  "password": "secret123",
  "password_confirmation": "secret123",
  "role": "customer",
  "city_id": 1,
  "referral_code": "PAKFIX-RAUF25",
  "accepts_terms": true
}
```

| Field | Rules |
|---|---|
| `name` | required, 2–120 characters |
| `email` | required, valid, unique |
| `phone` | required, unique. `03xxxxxxxxx`, `923xxxxxxxxx` or `+923xxxxxxxxx`; normalised to `+92…` |
| `password` | required, confirmed, min 8, at least one letter and one number |
| `role` | required; one of `customer`, `technician`, `company`, `property_manager` |
| `city_id` | optional, must exist |
| `referral_code` | optional, must exist |
| `accepts_terms` | must be accepted |

Staff roles cannot be requested here. They are granted by an admin.

**201**

```json
{
  "success": true,
  "message": "Welcome to PakFix. Your account is ready.",
  "data": {
    "user": { "id": "9b1c…", "name": "Ayesha Siddiqui", "roles": ["customer"], "home_path": "/dashboard" },
    "token": null
  }
}
```

Technicians and companies are created with `status: "pending"`. They can sign in and complete
onboarding, but they are not listed publicly and cannot be booked until an admin verifies them.

---

## `POST /auth/login`

```json
{ "login": "ayesha@example.com", "password": "secret123", "device_name": "Pixel 8" }
```

`login` accepts an email address or a phone number in either format.

A wrong password and an unknown account return **the same** 422 message, so the endpoint cannot be
used to enumerate users. A suspended account returns 403 with the reason.

---

## The user object

```json
{
  "id": "9b1c7e2a-…",
  "name": "Ayesha Siddiqui",
  "avatar_url": null,
  "locale": "en",
  "roles": ["customer"],
  "primary_role": "customer",
  "city": { "id": 1, "name": "Lahore", "slug": "lahore", "is_served": true },
  "profile": { "first_name": "Ayesha", "last_name": "Siddiqui", "bio": null },
  "created_at": "2026-09-16T08:12:44+05:00",

  "email": "ayesha@example.com",
  "phone": "+923001234567",
  "email_verified": true,
  "phone_verified": true,
  "status": "active",
  "referral_code": "PAKFIX-AYESHA42",
  "onboarding_completed": true,
  "permissions": ["bookings.create", "..."],
  "home_path": "/dashboard"
}
```

`id` is a UUID; the database id is never exposed. The fields below the blank line appear **only**
when the requester is that user or a staff member, so an endpoint that happens to embed a user
cannot leak one customer's phone number to another.

---

## Money

Every amount is an **integer in minor units**. `"total_minor": 450000` is Rs 4,500. Where the
backend is better placed to format than the client, a `*_display` string comes with it:

```json
{ "typical_price": { "min_minor": 200000, "max_minor": 2500000, "display": "Rs 2,000 - Rs 25,000" } }
```

No endpoint accepts a total from a client. Totals, discounts and commission are calculated
server-side, always.

---

## Rate limits

| Endpoints | Limit |
|---|---|
| `register`, `login`, `forgot-password`, `reset-password` | 10 per minute per IP |
| Login failures | 5 per identifier + IP, then locked for 60 seconds |
| `verify-email/resend` | 6 per minute |
| Everything else | Laravel's default API throttle |

A 429 returns the standard failure envelope.

---

## Coming in later phases

These are designed and their tables exist; the routes land with their phase.

```
/properties            /properties/{uuid}/assets      /ai/sessions
/ai/diagnose           /technicians                   /technicians/{slug}
/bookings              /bookings/{uuid}/status        /quotes
/conversations         /messages                      /payments
/reviews               /maintenance                   /notifications
```

See [mobile-api.md](mobile-api.md) for the client contract.
