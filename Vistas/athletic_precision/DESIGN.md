---
name: Athletic Precision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-score:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-score-mobile:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  stat-mono:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: 0.02em
  label-lg:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Outfit
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1rem
  margin-lg: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system embodies the focus, momentum, and technical mastery of professional ten-pin bowling. It bridges the gap between high-stakes sports analytics and accessible skill development. Designed primarily for mobile athletes in intense, low-light alley environments as well as sunny practice sessions, the visual identity pairs the disciplined calm of midnight cobalt with the kinetic flash of strike amber.

The aesthetic blends **Modern Athletic Digital** with **Refined Dark Mode Architecture**:
- **Tone:** Authoritative, energetic, metric-driven, encouraging.
- **Visual Rhythm:** Precision geometry, dark high-contrast surfaces, luminous telemetry gauges, and bold statistical typography.
- **Physicality:** Tactile buttons that react with immediate snap, glowing state feedback mimicking alley sweep lights and synthetic pin deck clarity.

## Colors
The system is built upon a high-contrast dark palette tailored for handheld operation during live play. Deep slate backgrounds prevent eye fatigue under overhead alley LEDs while making scores, ball paths, and pin indicators stand out instantly.

### Palette Architecture
- **Primary (Electric Cobalt `#2563EB`, Deep `#1E40AF`, Bright `#3B82F6`):** Governs structural interactions, primary actions, telemetry graphs, and lane position indicators.
- **Secondary (Laser Amber `#F59E0B`, Flame Orange `#F97316`):** Reserved for peak accomplishments—strikes (`X`), active turn focus, streak multipliers, and master badges.
- **Tertiary & Semantic Signals:**
  - **Success (`#10B981`):** Cleared spares (`/`), drill completions, velocity gains, on-target stats.
  - **Critical / Danger (`#EF4444`):** Splits, gutter balls (`-`), foul line violations, drop-offs in rev rate.
- **Dark Neutral Stack:**
  - `Canvas / Surface 0`: `#0F172A` (True base canvas)
  - `Card / Surface 1`: `#1E293B` (Elevated modules, score cards)
  - `Highlight / Surface 2`: `#334155` (Sub-cards, split-frame boxes, inactive pins)
  - `Borders / Dividers`: `#334155` default, `#475569` active/focused
- **Text & Content Contrast:**
  - `Text Primary`: `#FFFFFF` (Score digits, high-level headers)
  - `Text Secondary`: `#E2E8F0` (Labels, subheadings, coach audio transcripts)
  - `Text Muted`: `#94A3B8` (RPM notation, axis tilt markers, timestamps)

## Typography
The system utilizes **Outfit** for headlines, display metrics, frame counters, and badges. Its geometric, athletic cuts project confidence and modern technical authority. For body copy, coach interaction notes, and long-form instructional drills, **Plus Jakarta Sans** provides humanist readability with open apertures.

### Numeric & Stat Rules
- All numeric displays across the scoreboard, average calculators, ball speed (mph/kmh), and RPM counters must enable OpenType tabular numbers (`tnum`) to eliminate layout jitter during frame-by-frame updates.
- Display score typography employs dense letter spacing (`-0.03em`) to mimic physical digital score displays without feeling retro.
- Sub-labels and metric descriptions leverage uppercase tracking (`letter-spacing: 0.04em` to `0.06em`) for rapid scanability during practice sessions.

## Layout & Spacing
A fluid 4-column layout model anchors mobile viewports, transitioning to an 8-column layout on tablet devices used by coaches during lane-side reviews.

### Spacing Principles
- **Base Grid:** Strictly based on an 8pt architectural rhythm, with a 4pt half-step reserved for granular frame boxes, badge padding, and pin setup matrices.
- **Safe Margins:** A consistent 16px (`1rem`) lateral canvas padding accommodates thumb sweep areas and prevents accidental taps while handling equipment.
- **Scoreboard Horizontality:** The 10-frame score module is designed with horizontal scroll-snap on standard mobile viewports, defaulting to showing the active 4-frame range alongside a pinned cumulative total summary card.
- **Thumb Zone First:** Critical action buttons (Score Input, Ball Tracking Toggle, Quick Shot Mark) are locked within the bottom 35% of the mobile viewport.

## Elevation & Depth
Depth is realized through distinct tonal stacking, low-contrast structural outlines, and selective luminescence rather than muddy drop shadows.

### Surface Tiers
- **Tier 0 (Pitch / Background):** `#0F172A` — Base background plane.
- **Tier 1 (Resting Cards & Navigation):** `#1E293B` bounded by a 1px solid stroke of `#334155`.
- **Tier 2 (Interactive Modules & Pin Decks):** `#334155` bounded by a 1px solid stroke of `#475569`.
- **Tier 3 (Modals & Overlays):** `#1E293B` elevated with backdrop blur (`backdrop-filter: blur(16px); background: rgba(30, 41, 59, 0.85)`).

### Athletic Glow & Shadows
- **Strike Flame Glow:** `box-shadow: 0 0 20px -2px rgba(245, 158, 11, 0.35);` applied to consecutive strike badges and active frame markers.
- **Electric Focus Glow:** `box-shadow: 0 0 16px -2px rgba(37, 99, 235, 0.4);` reserved for current input buttons and primary action CTAs.
- **Ambient Shadow (Resting Card):** `box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.5);`

## Shapes
The structural design features softened geometric forms that balance industrial durability with digital agility.

- **Primary Cards & Containers:** Default to `1rem` (16px / `rounded-2xl`) boundary curves, lending an athletic, ergonomic feel.
- **Score Frame Cells:** Set to `0.5rem` (8px / `rounded-md`) to maintain maximum internal real estate for split-box digits.
- **Badges & Roll Pills:** Fully rounded pill shapes (`9999px`) to visually separate continuous status tags from structural metric panels.
- **Pin Indicators:** Perfectly circular nodes (`w-7 h-7 rounded-full`) arranged in a triangular matrix for direct pin fall tracking.

## Components

### 1. Traditional Scoreboard Frames
- **Container:** Horizontal flex-strip with subtle inner dividers (`1px solid #334155`).
- **Frame Anatomy (Frames 1-9):**
  - Header: Small label (e.g., "F1", "F2") in `label-sm`, color `#94A3B8`.
  - Top Split Cells: 
    - Roll 1: Left cell (blank or score digit).
    - Roll 2: Top-right recessed box (`#0F172A`, `rounded-sm`) displaying second shot score, spare (`/`), or empty if Roll 1 was a strike (`X`).
  - Bottom Row: Frame running cumulative total in bold `stat-mono` (`#FFFFFF`).
- **10th Frame Extended Box:**
  - Contains three distinct roll sub-boxes with immediate conditional unlocking for strike/spare bonus balls.
- **Active Frame Indicator:** Frame outer border transitions to `#F59E0B` with an energetic amber top accent pip (`h-1 bg-amber-500 rounded-full`).

### 2. Buttons
- **Primary CTA:** Background `#2563EB`, text `#FFFFFF`, font `label-lg`, height `52px`, `rounded-2xl`, with Electric Focus Glow on hover/active.
- **Secondary Action:** Transparent background with `1.5px solid #334155`, text `#E2E8F0`, transitioning to border `#475569` on press.
- **Score Dial Keys (Quick Keypad):** Tactile squares (`h-14 w-full bg-slate-800 active:bg-blue-600 rounded-xl`) with numbers 0-9, `X`, and `/`.

### 3. Chips & Filter Tags
- **Filter Chips:** Height `36px`, pill-shaped, background `#1E293B`, border `1px solid #334155`, text `#94A3B8`.
- **Active State:** Background `rgba(37, 99, 235, 0.15)`, border `1.5px solid #3B82F6`, text `#FFFFFF`.
- **Achievement Chips:** Gold foil treatment with background `rgba(245, 158, 11, 0.12)`, border `1px solid rgba(245, 158, 11, 0.3)`, text `#F59E0B`.

### 4. Progress Rings & Pin Fall Matrix
- **Circular Telemetry:** SVG rings with stroke background `#334155` and dynamic progress stroke `#2563EB` (Daily Goal) or `#F59E0B` (Clean Game Percentage). Centered text contains tabular metric + micro unit label.
- **Pin Fall Deck (Interactive):** 10-pin triangle layout. Standing pins `#FFFFFF` with Slate-900 border; knocked-down pins fade to `#334155` with opacity 0.4. Single-tap toggles pin state with 15ms haptic snap.

### 5. Cards & Data Lists
- **Stat Metric Cards:** Background `#1E293B`, border `1px solid #334155`, padding `1rem`, `rounded-2xl`. Features a trend indicator (arrow icon + percentage in `#10B981` or `#EF4444`).
- **Drill Exercise List:** List items separated by `12px` vertical margin; leading icon indicates drill type (Accuracy, Speed, Release), trailing component displays a completion check or XP badge.

### 6. Inputs & Search Fields
- **Search & Filter Bars:** Height `48px`, background `#0F172A`, border `1px solid #334155`, text `#FFFFFF`, placeholder `#94A3B8`, `rounded-xl`.
- **Focus State:** Border `#2563EB`, outer glow `0 0 0 3px rgba(37, 99, 235, 0.25)`.

### 7. Bottom Navigation Bar
- **Architecture:** Fixed bottom dock (`h-18`), background `rgba(15, 23, 42, 0.92)` with `backdrop-filter: blur(20px)`, top border `1px solid #334155`.
- **Items (5):** `Inicio` (Dashboard), `Aprender` (Library), `Partida` (Center Highlighted Play Action), `Entrenar` (Drills), `Coach` (AI/Trainer Chat).
- **Center Action Button (`Partida`):** Floating elevated circular button (`w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-full border-4 border-slate-900 shadow-lg -mt-5`), triggering instant game setup.
- **Active Navigation States:** Amber indicator dot (`w-1.5 h-1.5 bg-amber-500 rounded-full mt-1`) under active cobalt icon.