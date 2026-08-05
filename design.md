---
version: "alpha"
name: "Minimalismo Confiável Financeiro"
description: "Professional and trustworthy minimalist landing page for a financial consulting firm. Ideal for landing pages, modern websites. AI-ready template."
colors:
  primary: "#FFFFFF"
  secondary: "#001F3F"
  tertiary: "#F0F2F5"
  neutral: "#C0C0C0"
  surface: "#2ECC40"
  accent: "#FFD700"
typography:
  h1:
    fontFamily: Georgia
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: Georgia
    fontSize: 1rem
    fontWeight: 400
rounded:
  sm: 4px
  md: 8px
  lg: 12px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Professional and trustworthy minimalist landing page for a financial consulting firm. Ideal for landing pages, modern websites. AI-ready template. The navy suit didn't become finance's uniform by accident. Since the 1950s, private banks and consultancies have understood something fundamental: restraint communicates competence. When you're asking someone to trust you with their life savings, visual noise is the enemy. Every unnecessary gradient, every decorative flourish whispers "I'm trying too hard."

Swiss banks perfected this first. UBS, Credit Suisse, Julius Baer — their visual identities stripped everything back to typography, whitespace, and one or two muted colors. Navy blue and white became the default palette not because designers lacked imagination, but because those colors tested as trustworthy across every culture they operated in. The restraint was the message.

McKinsey took the same logic into consulting. Their decks are famously sparse — Helvetica, minimal color, aggressive hierarchy. The absence of decoration signals that the thinking is what matters. This tradition persists because it works. When money is on the line, people don't want creativity. They want clarity.

- Density: 3/10 — Airy
- Variance: 2/10 — Structured
- Motion: 4/10 — Subtle

- **Style:** Professional, Trustworthy, Minimalist
- **Keywords:** finance, consulting, investment, professional, trustworthy, minimalist, clean, secure, data-driven, reliable
- **Era:** 2026+ Finanças Inteligentes
- **Light/Dark:** ✓ Full / ✗ No

## Colors

- **Branco** (#FFFFFF) — Light surface, card backgrounds
- **Azul Marinho** (#001F3F) — Accent highlight, links and focus states
- **Cinza Claro** (#F0F2F5) — Secondary text, borders, muted elements
- **Prata** (#C0C0C0) — Supporting palette color
- **Verde Escuro** (#2ECC40) — Deep contrast surface
- **Dourado** (#FFD700) — Premium accent, decorative highlights
- **Borgonha** (#800020) — Extended palette, decorative use
- **Preto** (#000000) — Deep contrast surface


## Typography

- **Display / Hero:** Georgia — Weight 700, tight tracking, used for headline impact
- **Body:** Georgia — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Georgia — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Layouts limpos e estruturados, tipografia serifada para títulos e sans-serif para corpo, gráficos de dados minimalistas, micro-interações de foco em dados, transições suaves e profissionais, foco na credibilidade e segurança.

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 4px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Rounded (4px) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Rounded (4px) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No decorative gradients — flat color only
- No shadows heavier than 0 2px 8px rgba(0,0,0,0.08)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Layouts limpos e estruturados
- Do Tipografia serifada/sans-serif
- Do Gráficos de dados minimalistas
- Do Micro-interações de foco em dados
- Do Transições profissionais
- Do Foco na credibilidade.


## Use Case

Landing pages, Modern websites

<!-- Source: https://designmd.app/library/minimalismo-confiavel-financeiro · designmd.app -->
