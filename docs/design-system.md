# PakFix.pk Design System Documentation

## Overview
The **PakFix Design System** provides a standardized, high-conversion visual identity and component architecture for PakFix.pk — Pakistan's premium AI-powered home repair and maintenance marketplace.

---

## 1. Theme Tokens

All colours, fonts, radii and shadows live in `frontend/src/app/globals.css` under `@theme`.
**Components never use raw hex values or Tailwind's stock palettes (`gray-*`, `green-*`, ...)** —
only the token classes below. Changing a token restyles the whole site.

### Colour
| Token | Value | Use |
|---|---|---|
| `brand-600` | `#0A7A48` | Primary action, links, brand text (5.4:1 on white) |
| `brand-700` | `#066A3E` | Hover / pressed |
| `brand-50` / `brand-100` | `#F2FAF5` / `#E4F4EA` | Tints, soft badges |
| `brand-on-dark` | `#4ADE80` | Green text on dark bands and the footer |
| `accent-600` | `#2F5BEA` | AI features, informational |
| `ink-900` | `#131915` | Headings (`text-foreground`) |
| `ink-600` | `#455049` | Body text |
| `ink-500` | `#5E6A63` | Muted text (5.7:1 on white) |
| `line` | `#E2E6E1` | Borders and dividers (`border-line`) |
| `surface` / `surface-muted` | `#FFFFFF` / `#F6F8F5` | Cards / alternating sections |
| `warn-*`, `danger-*` | amber / red scales | Status |

Neutrals carry a faint green tint so greys sit comfortably next to the brand.

## 2. Typography, Radius & Elevation

- **Body:** Inter (`font-sans`). **Headings:** Plus Jakarta Sans (`font-display`, applied to `h1`–`h4` automatically, tight tracking, balanced wrapping). Both are loaded with `next/font` in `app/layout.tsx`.
- **Radius:** controls `12px` (`rounded-xl`), cards `20px` (`rounded-2xl`), large sections `28px` (`rounded-3xl`), pills `rounded-full`. Tailwind's steps are pinned to these values.
- **Shadows:** one ink-tinted family — `shadow-xs`, `shadow-card`, `shadow-lifted`, `shadow-floating`, plus `shadow-brand` for the primary button hover. Tailwind's `shadow-md`…`shadow-2xl` are re-tinted to match.

---

### Shared classes (`globals.css`, `@layer components`)
- `eyebrow` — the small pill label above every section heading.
- `section-title` — the one size and weight for section headings (use with a colour, e.g. `text-ink-900`).
- `text-gradient-brand` / `text-gradient-on-dark` — emerald gradient for the emphasised half of a headline.
- `bg-premium-dark` + `bg-grid-dark` — the deep emerald background used by the hero, the final call to action and, in solid `ink-950`, the footer.

---

### Colour themes
Three themes share the same tokens, switched by `data-theme` on `<html>`:

| Theme | Brand | Accent | Feel |
|---|---|---|---|
| Emerald (default) | `#0A7A48` green | blue | Fresh, trustworthy |
| Midnight | `#213F8F` navy | gold | Formal, premium |
| Clay | `#B0432A` terracotta | teal | Warm, friendly |

- Values live in `globals.css` (`[data-theme='midnight']`, `[data-theme='clay']`); the list in `src/lib/theme.ts`.
- The `ThemeSwitcher` sits in the top bar, footer, phone menu, sign-in pages, dashboard sidebar and admin header. The choice is saved in the browser and applied before first paint.
- `?theme=midnight` on any URL previews and remembers a theme — handy for sharing a look.
- Safety and "OK" states use `safe-*`, which stays green in every theme. Use it, not `brand-*`, for anything meaning "safe".
- **Each theme has its own style, not just colours:** Midnight uses Fraunces serif headings and crisp 8–12px corners; Clay uses Nunito rounded headings, soft 16–34px corners and pill buttons (`--radius-button`). Emerald keeps Plus Jakarta Sans.
- Solid fills behind white text use `bg-brand-solid` / `bg-accent-solid` (+ `-hover`), never `bg-brand-600`, and cards use `bg-surface`, never `bg-white` — that is what lets dark mode work.

### Dark mode
- `data-mode="dark"` on `<html>`, combinable with any theme (`?mode=dark` previews it). Toggle: the sun/moon button in the header, top bar, footer, sign-in pages and dashboards, or Light/Dark in the theme menu.
- Derived, not hand-written: neutrals mirror the theme's ink scale, tints are mixed from its 500 shade, text shades come from the light end. Light values are kept as `--lt-*` aliases for this.
- Bands that are dark in both modes (`bg-premium-dark`, `bg-ink-800/900/950`, or `.keep-tone`) keep their light-mode tokens, so the hero, footer and dark cards look the same in both modes.
- To add a theme: add a `[data-theme='x']` block with the full brand / accent / ink scales (check contrast), then add an entry to `THEMES`.

---

## 3. Core UI Components

### Buttons (`Button.tsx`)
- Minimum height: `44px` (Touch target compliant).
- Variants: `primary` (PakFix Green), `accent` (Tech Blue), `secondary` (Outline border), `ghost`, `danger`.
- Focus state: `2px` `brand-600` outline with offset; inputs show a soft `brand-600/15` ring.

### Verified Badge (`Badge.tsx`)
- Custom `<VerifiedBadge />` component with `ShieldCheck` icon, gradient tint (`brand-50` to `accent-50`), and tooltip.

### Interactive Hero Visual (`HeroProductVisual.tsx`)
- Layered visual preview card displaying live photo upload, AI confidence %, safety audit rating, PKR cost range, and verified pro assignment.

---

## 4. Dashboards & Portal Navigation
- **Customer Dashboard**: Bookings (Vertical Tracking Timeline), Quotes (Side-by-side comparison), Properties (Asset management), Maintenance (Seasonal scheduler).
- **Technician Dashboard**: Availability toggle (Online/Offline), active job execution checklist, distance-based job queue, earnings statistics.
- **Admin Command Center**: Gross volume metrics, CNIC verification queue, emergency hazard logs, transaction table.
