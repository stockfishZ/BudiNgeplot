# BodeNgeplot - Implementation TODO & Task Checklist

## Architecture & Design Guidelines Check
- [x] **Design Token System**: Enforced `design.md` specs (Navy `#001F3F`, Gold `#D4AF37`, Off-White `#FFFFFF`/`#F0F2F5`, Georgia Serif headings, JetBrains Mono math values, 4px rounded corners).
- [x] **Visual Restraint**: No pure black (`#000000`), no decorative gradients, no emojis in UI (used Lucide SVG icons), clear 1px borders.
- [x] **Airy Structured Layout**: Max-width 1280px grid, responsive split-screen (Control panel left/top, interactive plots right/bottom).

---

## Phase 1: Core Mathematical Engine & Domain Logic
- [x] **Transfer Function Parser**:
  - [x] Implemented polynomial coefficient parser (`num` & `den` arrays).
  - [x] Implemented string expression parser (e.g. `10*(s+2)/(s*(s^2 + 4*s + 13))`) using `mathjs`.
  - [x] Implemented Durand-Kerner polynomial root solver for complex poles & zeros.
- [x] **Bode Evaluator ($s = j\omega$)**:
  - [x] Calculated $|H(j\omega)|_{\text{dB}} = 20 \log_{10} |H(j\omega)|$.
  - [x] Calculated phase $\angle H(j\omega)$ with unwrap logic for proper quadrants.
  - [x] Generated frequency vector $\omega \in [10^{-2}, 10^4]$ rad/s (logarithmic spacing).
- [x] **Asymptotic Bode Approximation Engine**:
  - [x] Extracted corner frequencies $\omega_c$ from real poles/zeros and natural frequencies $\omega_n$ from quadratic pairs.
  - [x] Constructed piecewise linear asymptotic magnitude line starting from low-frequency slope $20k \text{ dB/dec}$.
  - [x] Calculated asymptotic phase lines ($0^\circ$, break region $\omega_c/10$ to $10\omega_c$, final asymptote).
- [x] **Stability & Crossover Margin Engine**:
  - [x] Evaluated $\omega_{gc}$ (gain crossover where $|H(j\omega)| = 0\text{ dB}$) via root finding / interpolation.
  - [x] Computed Phase Margin $\text{PM} = 180^\circ + \angle H(j\omega_{gc})$.
  - [x] Evaluated $\omega_{pc}$ (phase crossover where $\angle H(j\omega) = -180^\circ$).
  - [x] Computed Gain Margin $\text{GM}_{\text{dB}} = -20 \log_{10} |H(j\omega_{pc})|$.
  - [x] Classified system stability (Stable / Unstable / Marginally Stable).

---

## Phase 2: User Interface & Component Development
- [x] **Layout & Header**:
  - [x] Minimalist top navigation bar with Navy background (`#001F3F`), Georgia serif title, and mode toggles (Interactive App / Homework Report Mode).
- [x] **Input & Controls Panel**:
  - [x] Polynomial Coefficient Inputs ($N(s)$ and $D(s)$).
  - [x] Expression String Input with real-time preview of $H(s)$.
  - [x] **Zero-Pole-Gain (ZPK) Input Form**: Direct input for Gain $K$, Zeros list, and Poles list.
  - [x] Homework Presets Dropdown (2nd order underdamped, lag-lead, integrator system, non-minimum phase, ZPK).
  - [x] Frequency Range Slider ($\omega_{\min}$ to $\omega_{\max}$).
  - [x] Curve Toggles: Exact Curve, Asymptotic Lines, GM/PM Margin Annotations, Grid Lines.
- [x] **Interactive Plot Canvas (Bode & S-Plane)**:
  - [x] **Magnitude Chart**: Dual trace (Exact line + Asymptotic dashed line), 0 dB reference line, $\omega_{gc}$ vertical line, GM drop annotation.
  - [x] **Phase Chart**: Dual trace, $-180^\circ$ reference line, $\omega_{pc}$ vertical line, PM arrow annotation.
  - [x] **S-Plane Pole-Zero Map**: Interactive 2D plot with poles ($\times$), zeros ($\circ$), $\zeta$ lines, and $\omega_n$ circles.
- [x] **Step-by-Step Homework Factorization Card**:
  - [x] Canonical Bode Form rendering: $K_0 \frac{\prod (1 + s/\omega_z)}{s^k \prod (1 + s/\omega_p)}$.
  - [x] Factorization Table: Factor, Corner Frequency $\omega_c$, Slope Contribution (dB/dec), Phase asymptotes.
  - [x] Derivation steps for $\text{GM}$ and $\text{PM}$ with explicit numerical substitutions.

---

## Phase 3: Export & Homework Helpers
- [x] **LaTeX Exporter Modal/Button**: Copy ready-to-paste LaTeX code for $H(s)$, factor breakdown, and stability summary.
- [x] **PNG/SVG Export**: High-res SVG rendering for homework document insertion.
- [x] **Print / Homework Sheet PDF Layout**: CSS `@media print` rules formatting the page into a clean homework submission document.

---

## Phase 4: Testing & Verification
- [x] Verified against standard textbook homework problems (Ogata, Nise, Dorf & Bishop).
- [x] Verified non-minimum phase zero behavior (positive zero in right half plane).
- [x] Verified underdamped 2nd order resonant peak behavior ($\zeta < 0.707$).
- [x] Verified clean production build using Vite and TypeScript.
