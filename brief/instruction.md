# BodeNgeplot - Web-Based Bode Plot Generator Brief

## 1. Project Overview & Objective

**BodeNgeplot** is a web-based, interactive Bode plot generator specifically designed to act as an authoritative **homework helper tool** for Linear Control Systems and Signals & Systems engineering students.

Unlike standard black-box plotting tools (e.g., standard MATLAB `bode`), **BodeNgeplot** provides full transparency into the mathematical derivation:
- **Asymptotic straight-line approximations** alongside exact frequency response curves.
- **Factorization breakdown tables** showing corner frequencies and magnitude slope contributions.
- **Gain Margin (GM) and Phase Margin (PM)** derivations with visual crossover point annotations.
- **Pole-Zero ($s$-plane) diagrams**.
- **LaTeX exportable math steps** ready to be copied into homework submissions.

---

## 2. Core Functional Requirements & Domain Logic

### 2.1 Transfer Function Input Engine
- **Polynomial Ratio Input**:
  - Numerator coefficients: $N(s) = b_m s^m + \dots + b_1 s + b_0$
  - Denominator coefficients: $D(s) = a_n s^n + \dots + a_1 s + a_0$
- **Mathematical String Input**:
  - Expression parser supporting syntax like `10*(s+2) / (s*(s^2 + 4*s + 13))` or `5 / (1 + s/10)`.
- **Zero-Pole-Gain (ZPK) Form**:
  - $H(s) = K \frac{\prod (s - z_i)}{s^k \prod (s - p_j)}$
- **Preset Homework Problems**:
  - Standard 2nd order underdamped/overdamped systems.
  - Integrator + Lag-Lead networks.
  - Non-minimum phase zero systems.
  - Resonant peak systems.

### 2.2 Bode Analysis Engine ($s = j\omega$)
- **Magnitude Response**:
  - $|H(j\omega)|_{\text{dB}} = 20 \log_{10} |H(j\omega)|$
  - Frequency range $\omega \in [10^{-2}, 10^4]$ rad/s (auto-scaling logarithmic range).
- **Phase Response**:
  - $\angle H(j\omega)$ in degrees ($[-360^\circ, +180^\circ]$ unwrap logic).
- **Asymptotic Approximation Generator**:
  - Identifies all corner frequencies $\omega_c$.
  - Constructs piecewise linear magnitude asymptotes starting from low frequency slope ($20k \text{ dB/dec}$).
  - Draws break frequencies and slope changes ($\pm 20, \pm 40 \text{ dB/dec}$).
- **Stability & Margin Analysis**:
  - **Gain Crossover Frequency ($\omega_{gc}$)**: Where $|H(j\omega_{gc})|_{\text{dB}} = 0 \text{ dB}$.
  - **Phase Margin (PM)**: $\text{PM} = 180^\circ + \angle H(j\omega_{gc})$.
  - **Phase Crossover Frequency ($\omega_{pc}$)**: Where $\angle H(j\omega_{pc}) = -180^\circ$.
  - **Gain Margin (GM)**: $\text{GM}_{\text{dB}} = -20 \log_{10} |H(j\omega_{pc})|$.
  - **System Stability Status**: Stable ($\text{GM} > 0 \text{ dB}$ and $\text{PM} > 0^\circ$), Marginally Stable, or Unstable.

### 2.3 Step-by-Step Homework Factorization Table
- Expresses $H(s)$ in standard Bode canonical form:
  $$H(s) = K_0 \cdot \frac{(s/\omega_{z1} + 1)\dots}{(s)^k (s/\omega_{p1} + 1)\dots [1 + 2\zeta (s/\omega_n) + (s/\omega_n)^2]\dots}$$
- Displays factor table with:
  1. Factor type (Constant Gain, Integrator/Differentiator, Real Pole/Zero, Complex Conjugate Pair).
  2. Corner Frequency $\omega_c$ or Natural Frequency $\omega_n$.
  3. Magnitude Slope contribution (dB/dec).
  4. Phase asymptote limits ($0^\circ, -40.5^\circ/\text{dec}, -90^\circ$).

### 2.4 S-Plane Pole-Zero Map
- Interactive 2D complex plane ($s = \sigma + j\omega$).
- Displays poles ($\times$) and zeros ($\circ$).
- Overlay damping ratio lines ($\zeta$) and natural frequency circles ($\omega_n$).

---

## 3. UI Design Architecture & Guidelines (from `design.md`)

The UI follows the **Minimalismo Confiável Financeiro** architectural system adapted for engineering precision: visual restraint, structured density, high-contrast clarity, and zero unnecessary visual noise.

### 3.1 Design Tokens
- **Palette**:
  - Navy Accent: `#001F3F`
  - Crisp Background / Cards: `#FFFFFF` / `#F0F2F5`
  - Text Primary: Off-Black `#1A1A1A` (No pure `#000000`)
  - Extended Accent / Crossover Highlight: `#FFD700` (Gold), Muted Silver `#C0C0C0`
  - Deep Surface / Header: `#001F3F` or `#0F172A`
- **Typography**:
  - **Headings / Hero**: Georgia (Serif, Weight 700) for authoritative engineering title & section headers.
  - **Body / Technical Labels**: Georgia / System Sans for body; **JetBrains Mono** for transfer functions, numerical frequency readouts, LaTeX code, and matrix values.
- **Elevation & Layout**:
  - Density: 3/10 (Airy & structured with generous whitespace).
  - Corner radius: `4px` base (`rounded.sm`).
  - Container max-width: `1280px` centered.
  - Micro-interactions: Smooth 200-300ms ease-out transitions. Focus indicators with 2px accent ring.
  - **No emojis** in UI — icon system only (Lucide Icons).
  - **No decorative gradients** — flat color surfaces with clean 1px borders.

---

## 4. Export & Utility Capabilities

1. **LaTeX Export**: One-click copy for transfer function, factor breakdown, and stability equations.
2. **Graphic Export**: SVG / High-res PNG downloading for homework document insertion.
3. **Print Mode**: Dedicated print-friendly CSS layout hiding control panels and formatting the plots & factor tables into a clean A4/Letter homework report format.
