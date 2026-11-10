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
The palette is **Teal + Coral**: deep ocean teal for actions and brand, warm coral for highlights.

| Token | Value | Use |
|---|---|---|
| `brand-600` / `brand-solid` | `#0B7A84` | Primary action, links, brand text (5.1:1 on white) |
| `brand-700` | `#086870` | Hover / pressed |
| `brand-50` / `brand-100` | `#EFFAFA` / `#DDF3F3` | Tints, soft badges |
| `brand-500` | `#14A3AB` | Glows and large text only (too light for small text on white) |
| `brand-on-dark` | `#5EEAD4` | Aqua text on dark bands and the footer |
| `accent-500` | `#FF6B4A` | Coral fills, stars, glows (not for small text: 2.8:1 on white) |
| `accent-600` / `accent-solid` | `#C2410C` | Coral text and buttons (5.2:1 on white) |
| `ink-900` | `#121A1C` | Headings (`text-foreground`) |
| `ink-600` | `#3F4D51` | Body text |
| `ink-500` | `#56656A` | Muted text (6.1:1 on white) |
| `line` | `#DFE6E7` | Borders and dividers (`border-line`) |
| `surface` / `surface-muted` | `#FFFFFF` / `#F5F8F8` | Cards / alternating sections |
| `safe-*` | green | "Low risk" and other safety states; stays green on purpose |
| `warn-*`, `danger-*` | amber / red scales | Status |

Neutrals carry a faint cool teal tint so greys sit comfortably next to the brand.
`bg-brand-solid` is drawn as a gradient into a deeper teal (so white text only gains contrast).

## 2. Typography, Radius & Elevation

- **Body:** Inter (`font-sans`). **Headings:** Plus Jakarta Sans (`font-display`, applied to `h1`–`h4` automatically, tight tracking, balanced wrapping). Both are loaded with `next/font` in `app/layout.tsx`.
- **Radius:** controls `12px` (`rounded-xl`), cards `20px` (`rounded-2xl`), large sections `28px` (`rounded-3xl`), pills `rounded-full`. Tailwind's steps are pinned to these values.
- **Shadows:** one ink-tinted family — `shadow-xs`, `shadow-card`, `shadow-lifted`, `shadow-floating`, plus `shadow-brand` for the primary button hover. Tailwind's `shadow-md`…`shadow-2xl` are re-tinted to match.

---

### Shared classes (`globals.css`, `@layer components`)
- `eyebrow` — the small pill label above every section heading.
- `section-title` — the one size and weight for section headings (use with a colour, e.g. `text-ink-900`).
- `text-gradient-brand` / `text-gradient-on-dark` — teal-to-coral gradient for the emphasised half of a headline.
- `bg-premium-dark` + `bg-grid-dark` — the deep teal background, lit by aqua and coral glows, used by the hero, dark call-to-action panels and the footer.

---

### Solid fills and surfaces
- Solid fills behind white text use `bg-brand-solid` / `bg-accent-solid` (+ `-hover`), never `bg-brand-600`; cards use `bg-surface`, never `bg-white`. That is what lets dark mode work.
- Safety and "OK" states use `safe-*`.

### Dark mode
- `data-mode="dark"` on `<html>` (`?mode=dark` previews it). Toggle: the sun/moon button in the header, top bar, footer, sign-in pages and dashboards. Saved in the browser and applied before first paint (`src/lib/theme.ts`).
- Derived, not hand-written: neutrals mirror the ink scale, tints are mixed from the 500 shade, text shades come from the light end. Light values are kept as `--lt-*` aliases for this.
- Bands that are dark in both modes (`bg-premium-dark`, `bg-ink-800/900/950`, or `.keep-tone`) keep their light-mode tokens, so the hero, footer and dark cards look the same in both modes.
- Long-form text (articles, CMS and legal pages) uses `.rich-text`; light call-to-action panels use `.bg-brand-glow`.

---

## 3. Core UI Components

### Buttons (`Button.tsx`)
- Minimum height: `44px` (Touch target compliant).
- Variants: `primary` (Teal), `accent` (Coral), `secondary` (Outline border), `ghost`, `danger`.
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
