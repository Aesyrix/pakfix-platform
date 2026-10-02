# PakFix.pk Design System Documentation

## Overview
The **PakFix Design System** provides a standardized, high-conversion visual identity and component architecture for PakFix.pk — Pakistan's premium AI-powered home repair and maintenance marketplace.

---

## 1. Brand Color System

### Primary Brand Palette (Trust, Craftsmanship & Safety)
- **Primary Green (`--color-brand-500`)**: `#16A34A`
- **Primary Dark (`--color-brand-700`)**: `#15803D`
- **Primary Light Tint (`--color-brand-50`)**: `#DCFCE7`

### AI & Tech Accent Palette (Smart Features & AI Assistant)
- **Accent Blue (`--color-accent-600`)**: `#2563EB`
- **Accent Blue Light (`--color-accent-100`)**: `#DBEAFE`

### Slate Neutral Palette (Light Mode)
- **Background**: `#F8FAFC`
- **Surface (Cards)**: `#FFFFFF`
- **Surface Muted**: `#F1F5F9`
- **Border**: `#E2E8F0`
- **Text Primary**: `#0F172A`
- **Text Secondary**: `#475569`
- **Text Muted**: `#64748B`

### Dark Mode Neutral Palette
- **Background**: `#020617`
- **Surface (Cards)**: `#111827`
- **Surface Muted**: `#0F172A`
- **Border**: `#1E293B`
- **Text Primary**: `#F8FAFC`
- **Text Secondary**: `#CBD5E1`

---

## 2. Typography & Radius Tokens

### Font Stack
- **Sans Serif**: `Inter`, `Plus Jakarta Sans`, sans-serif.

### Radius Scale
- **Small Control (`--radius-sm`)**: `8px` (`0.5rem`)
- **Control Input/Button (`--radius-control`)**: `12px` (`0.75rem`)
- **Cards (`--radius-card`)**: `16px` (`1rem`)
- **Hero & Large Panels (`--radius-hero`)**: `24px` (`1.5rem`)
- **Pills / Badges (`--radius-pill`)**: `9999px`

---

## 3. Core UI Components

### Buttons (`Button.tsx`)
- Minimum height: `44px` (Touch target compliant).
- Variants: `primary` (PakFix Green), `accent` (Tech Blue), `secondary` (Outline border), `ghost`, `danger`.
- Focus state: `2px` green ring with outline offset.

### Verified Badge (`Badge.tsx`)
- Custom `<VerifiedBadge />` component with `ShieldCheck` icon, gradient tint (`#DCFCE7` to `#DBEAFE`), and tooltip.

### Interactive Hero Visual (`HeroProductVisual.tsx`)
- Layered visual preview card displaying live photo upload, AI confidence %, safety audit rating, PKR cost range, and verified pro assignment.

---

## 4. Dashboards & Portal Navigation
- **Customer Dashboard**: Bookings (Vertical Tracking Timeline), Quotes (Side-by-side comparison), Properties (Asset management), Maintenance (Seasonal scheduler).
- **Technician Dashboard**: Availability toggle (Online/Offline), active job execution checklist, distance-based job queue, earnings statistics.
- **Admin Command Center**: Gross volume metrics, CNIC verification queue, emergency hazard logs, transaction table.
