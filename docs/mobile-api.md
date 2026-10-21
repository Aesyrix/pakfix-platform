# Mobile API guide

For a Flutter or React Native developer building the PakFix Android and iOS apps.

**You do not need a new backend.** Everything the apps need is already an authenticated REST
endpoint under `/api/v1`. If something you need is missing, it belongs in Laravel, not in the app.

---

## Base URL

| Environment | URL |
|---|---|
| Local | `http://10.0.2.2:8000/api/v1` (Android emulator) / `http://localhost:8000/api/v1` (iOS simulator) |
| Staging | `https://staging-api.pakfix.pk/api/v1` |
| Production | `https://api.pakfix.pk/api/v1` |

Send on every request:

```
Accept: application/json
Content-Type: application/json
Authorization: Bearer {token}        // once signed in
```

The API decides you are a native client by the absence of a session, and issues a bearer token
rather than a cookie. You never touch `/sanctum/csrf-cookie`; that is the website's path.

---

## Decode the envelope once

Every response, success or failure, has the same shape. Write one generic decoder and use it
everywhere.

```dart
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final Map<String, List<String>>? errors;
  final Pagination? pagination;
}
```

```dart
Future<T> request<T>(...) async {
  final response = await http.send(...);
  final body = jsonDecode(response.body);

  if (response.statusCode == 204) return null as T;

  if (body['success'] != true) {
    throw ApiException(
      message: body['message'] as String,
      status: response.statusCode,
      errors: parseErrors(body['errors']),
    );
  }

  return parse(body['data']);
}
```

Map status codes to behaviour:

| Code | Do this |
|---|---|
| 401 | Clear the stored token, return to sign-in |
| 403 | Show `message` — the account may be suspended; do not retry |
| 422 | Attach `errors[field][0]` to the matching form field |
| 429 | Back off; show `message` |
| 0 / 5xx | Offer a retry; these are the only failures worth retrying unchanged |

---

## Sign-in

```http
POST /auth/login
{ "login": "0300 1234567", "password": "secret123", "device_name": "Pixel 8 Pro" }
```

`login` takes an email address or a phone number, in local or international format — send whatever
the user typed and let the API normalise it.

`device_name` is what the user will see in their device list, so send something recognisable.

**Store the token in the platform keychain** — `flutter_secure_storage`, Keychain, EncryptedSharedPreferences. Never in plain preferences.

```json
{
  "success": true,
  "message": "Signed in.",
  "data": { "user": { "…": "…" }, "token": "17|abcdef…" }
}
```

Tokens do not expire on a timer. They end when the user signs out, signs out everywhere, resets
their password, or an admin suspends the account.

### Sign out

- `POST /auth/logout` — this device only.
- `POST /auth/logout-all` — every device.
- `GET /auth/devices` then `DELETE /auth/devices/{id}` — a device manager screen.

---

## Registration

`POST /auth/register`. See [api.md](api.md#post-authregister) for the full rule set. Two things
that catch people out:

- **Phone format.** `03xxxxxxxxx`, `923xxxxxxxxx` and `+923xxxxxxxxx` are all accepted and
  normalised to `+92…`. Do not pre-format; do not reject client-side what the API accepts.
- **Role.** Only `customer`, `technician`, `company` and `property_manager` can be chosen. Staff
  roles are granted by an admin and will 422 here.

A technician registers with `status: "pending"`: they can sign in and complete onboarding, but they
are not listed and cannot receive jobs until verified. Build the onboarding flow expecting this.

---

## Account state

Check `user.status` after sign-in and on `GET /auth/me`:

| Status | App behaviour |
|---|---|
| `active` | Normal |
| `pending` | Signed in; show the onboarding or "awaiting verification" screen |
| `suspended` / `banned` | The API returns 403 with a reason; show it and sign out |

Status is re-checked on **every** request, so an account suspended mid-session stops working on
the next call. Handle a 403 at any moment, not only at sign-in.

---

## Money

Every amount is an **integer in minor units**. Rs 4,500 is `450000`.

```dart
String formatPkr(int minor) =>
    'Rs ${NumberFormat('#,##0', 'en_PK').format(minor / 100)}';
```

Never do arithmetic on a displayed string, never send a total you calculated, and never use a
`double` for money. Totals, discounts and commission are server-side, always. Where the backend
provides a `*_display` string, prefer it — it already matches the website.

---

## Identifiers

Every public id is a **UUID string**, not an integer. Bookings, quotes, payments and support
tickets also carry a human `reference` such as `PF-2026-000125` — show that one to the user, and
use the UUID in URLs.

Locations are the exception: `city_id` and `area_id` are integers, because they are shared
reference data rather than user records.

---

## Uploads

Send `multipart/form-data`; drop the `Content-Type: application/json` header for these.

| Type | Formats | Limit |
|---|---|---|
| Image | jpg, jpeg, png, webp | 8 MB |
| Video | mp4, webm, mov | 50 MB |
| Document | pdf | 10 MB |

Compress on the device before upload — a modern phone camera produces files well over the limit,
and a customer on mobile data will thank you. Thumbnails are generated server-side; use the
`thumbnail_path` a response gives you rather than downscaling the original in the app.

Private documents (CNIC scans, invoices) are never served from a plain path. Ask the API for a
signed URL, which expires in minutes.

---

## Offline and caching

Cache aggressively, but only the right things.

| Safe to cache for a long time | Never cache |
|---|---|
| `/services/categories` | Anything under `/auth` |
| `/locations/*` | Booking status |
| `/bootstrap` | Payments, messages, notifications |

The public endpoints above are reference data that changes when an admin edits it. Hold them for a
day, refresh in the background, and let the app open instantly on a bad connection.

---

## Push notifications

Register the device after sign-in:

```http
POST /notifications/device-tokens
{ "token": "fcm-token", "platform": "android", "device_name": "Pixel 8", "app_version": "1.0.0" }
```

Delete it on sign-out. The `device_tokens` table and the notification preference matrix already
exist; the endpoint lands with Phase 7.

Notification types the apps should handle: booking received, accepted, technician assigned, on the
way, arrived, quote received, quote accepted, payment received, payment failed, maintenance
reminder, new message, review reminder, admin announcement.

---

## Job tracking

The booking timeline is built from `booking_status_history`, which is append-only — fetch it and
render it in order; never reconstruct it from the current status.

A technician updates a job with `POST /bookings/{uuid}/status`, moving through
`technician_on_way → arrived → inspection_started → repair_started → completed`. Illegal
transitions are refused by the server; the app should grey out what is not currently reachable
rather than letting the user try.

GPS tracking is designed for but not yet enabled. The columns exist on `bookings`; the endpoint
arrives with Phase 6.

---

## Requests and bids

The marketplace is inDrive-style: the customer posts a request, verified professionals within reach
send offers, and the customer accepts one, which creates the booking.

### Customer

```http
POST /requests
{
  "service_category_id": "uuid",          // from /services/categories
  "description": "Water leaking under the kitchen sink",
  "city_id": 2, "area_id": null,
  "address_line": "House 12, Street 4, Saddar", "landmark": null,
  "latitude": 33.5973, "longitude": 73.0479,   // must be inside Pakistan
  "urgency": "standard",                  // flexible | standard | urgent | emergency
  "customer_offer_minor": 250000,         // optional: the customer's own price
  "preferred_date": null, "preferred_time_slot": null
}
```

| Endpoint | Does |
|---|---|
| `GET /requests` | The customer's requests, newest first (paginated) |
| `GET /requests/{uuid}` | One request with every offer, cheapest first, each with a professional card |
| `POST /requests/{uuid}/cancel` | Cancel; waiting offers are declined |
| `POST /quotes/{uuid}/accept` | Accept an offer: returns `data.booking` (`id`, `reference`, `status`, `total`) |
| `POST /quotes/{uuid}/reject` | Decline an offer (`reason` optional) |

A request's `state` is what to show: `accepting_bids` → `choosing` → `booked`, or `cancelled` /
`expired`. Bidding closes at `expires_at` (2 hours, or 15 minutes for an emergency); the customer
can still accept an offer already received until `accept_until` (24 hours later). Poll
`GET /requests/{uuid}` every few seconds while the offers screen is open, until push lands.

### Professional

Only verified professionals get past these endpoints; a pending one receives 403 with a message to
show. A request is in reach when it is in one of the professional's trades (or a sub-trade of one)
and within their service radius, 20 km by default.

| Endpoint | Does |
|---|---|
| `GET /pro/requests` | Open requests in reach, nearest first, with `distance_km`, `my_quote`, and `meta.radius_km` |
| `GET /pro/requests/{uuid}` | One request |
| `POST /pro/requests/{uuid}/quotes` | Send an offer (below) |
| `GET /pro/quotes` | The professional's offers, newest first (`?status=sent` to filter) |
| `POST /pro/quotes/{uuid}/withdraw` | Withdraw an offer still waiting |

```http
POST /pro/requests/{uuid}/quotes
{ "visit_fee_minor": 50000, "labour_minor": 200000, "materials_minor": 150000,
  "arrival_minutes": 45, "estimated_minutes": 60, "notes": "I can replace the trap today." }
```

Send `{ "accept_offer": true }` instead of the three amounts to take the customer's price. The total
is always computed by the server. A professional never sees the exact address, the pin or who posted
a request; those reach them on the booking, once their offer is accepted. Commission is zero during
the launch period (`PAKFIX_COMMISSION_ENABLED=false`).

---

## Job tracking (bookings)

Accepting an offer creates a booking. From there:

| Who | Endpoint | Does |
|---|---|---|
| Customer | `GET /bookings`, `GET /bookings/{uuid}` | Their jobs (active first) and one job with its timeline |
| Customer | `POST /bookings/{uuid}/cancel` | Free until the professional sets off; afterwards 422 "contact support" |
| Customer | `POST /bookings/{uuid}/revised-quote/accept` | Approve a revised price; the booking takes its money |
| Customer | `POST /bookings/{uuid}/revised-quote/reject` | Decline it; the job is cancelled and only the visit fee is due |
| Customer | `POST /bookings/{uuid}/confirm` | Work done and paid in cash (marks payment paid) |
| Professional | `GET /pro/bookings`, `GET /pro/bookings/{uuid}` | Assigned jobs, with address and pin |
| Professional | `POST /pro/bookings/{uuid}/status` `{ "step": "on_way" }` | Next step: `on_way`, `arrived`, `inspecting`, `working`, `completed` |
| Professional | `POST /pro/bookings/{uuid}/revised-quote` | While inspecting: `labour_minor`, `materials_minor`, `notes` (visit fee is kept) |
| Professional | `POST /pro/bookings/{uuid}/cancel` | Until arrival, with a `reason`; counts against the professional |

| Customer | `POST /bookings/{uuid}/review` | After confirming: `rating` 1–5 (required), optional `comment`, `would_recommend`, and `quality_rating`, `professionalism_rating`, `communication_rating`, `value_rating`, `timeliness_rating` |
| Professional | `POST /pro/bookings/{uuid}/review-response` | One public reply to the customer's review (`response`) |

A confirmed, unreviewed booking offers the customer the `review` action; the booking's `review` field holds
the review and any reply. The professional's `rating_average`/`rating_count` are recomputed from published
reviews.

Every booking carries `actions`: what the viewer may do right now (for example `["on_way", "cancel"]`
or `["accept_quote", "reject_quote"]`). Offer exactly those and grey out the rest; the server
refuses anything else. `timeline` is the append-only status history, oldest first, and
`pending_quote` is a revised price waiting for the customer. Phone numbers are never included.

```
accepted → (scheduled) → technician_on_way → arrived → inspection_started → repair_started → completed → customer_confirmed
inspection_started → quote_created → quote_accepted → repair_started
                                   ↘ cancelled (visit fee only)
```

---

## Professional verification

A technician registers as `pending` and cannot see jobs until a person at PakFix verifies them.

| Endpoint | Does |
|---|---|
| `GET /pro/profile` | Profile, `verification.status`, `rejection_reason`, and a `checklist` (`profile_complete`, `missing_documents`, `can_submit`) |
| `PUT /pro/profile` | `category_ids` (UUIDs, 1–10), `city_id` (served city), optional `latitude`/`longitude` (defaults to the city centre), `service_radius_km` (5–50, default 20), `years_experience`, `business_name`, `bio`, `offers_emergency_service` |
| `POST /pro/verification/documents` | Multipart `type` (`cnic_front`, `cnic_back`, `photo`, `certificate`) + `file` (JPG/PNG/WebP up to 8 MB; a certificate may be a PDF). A new upload replaces the old one of that type |
| `POST /pro/verification/submit` | `{ "cnic": "35202-1234567-1" }` once the profile and the three required photos are in |

Statuses: `not_submitted` → `pending` → `verified`, or `rejected` with a reason, after which the
professional fixes and resubmits. Uploads are locked while `pending`. Documents are stored privately
and are only ever shown to reviewers in the admin panel (`/admin/verifications`); the CNIC number is
never returned to the app.

---

## Endpoints available today

```
GET    /                                API version
GET    /bootstrap                       Brand, currency, payment methods, feature flags
GET    /content/blocks                  Editable content
GET    /content/faqs
GET    /content/testimonials
GET    /content/pages/{slug}
GET    /services/categories             Category tree
GET    /services/categories/{slug}
GET    /services
GET    /locations/provinces
GET    /locations/cities
GET    /locations/cities/{slug}
GET    /locations/cities/{slug}/areas
POST   /auth/register
POST   /auth/login
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
GET    /auth/verification-status
POST   /auth/verify-email/resend
POST   /auth/logout
POST   /auth/logout-all
GET    /auth/devices
DELETE /auth/devices/{tokenId}
```

## Endpoints coming with their phase

```
/properties  /properties/{uuid}/assets  /maintenance
/ai/sessions  /ai/diagnose
/technicians  /technicians/{slug}
/bookings  /bookings/{uuid}/status  /quotes
/conversations  /messages
/payments  /reviews  /notifications
```

Their tables, enums and business rules already exist — see [database.md](database.md). Build the
app against the contract in this document and the endpoints will match when they land.

## Booking chat

Chat between a booking's customer and its professional. Same routes for both sides; anyone else gets 404.
Open from assignment until 7 days after the customer confirms the job; a cancelled job is read-only.
Phone numbers (10+ digits) and email addresses in a message are replaced with `[number hidden]` / `[email hidden]`.

| Method | Path | Notes |
|---|---|---|
| GET | `/conversations` | One row per booking: `booking_id`, `reference`, `status`, `category`, `role`, `with {name, avatar_url}`, `last_message {preview, has_photo, mine, created_at}`, `unread_count`, `can_send`. `meta.unread_total`. |
| GET | `/conversations/unread` | `{ unread_total }` for the tab badge. |
| GET | `/bookings/{uuid}/messages?after=<id>\|before=<id>` | Oldest first (latest 50, or newer than `after` for polling, or older than `before`). Marks the other side's messages read. `meta.chat {role, with, can_send, closes_at, status}`. |
| POST | `/bookings/{uuid}/messages` | Multipart `body` (≤2000) and/or `photo` (jpg/png/webp/heic ≤8 MB). Throttled 40/min. |
| GET | `/bookings/{uuid}/messages/{id}/photo` | The photo, participants only. Message JSON gives it as `photo.path` (relative to `/api/v1/`). |

Message: `{ id, body, mine, from: customer|technician, photo: {path, mime}|null, read: bool|null (own messages only), created_at }`.
