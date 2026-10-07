---
name: Food Guess UI
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#45dfa4'
  on-secondary: '#003825'
  secondary-container: '#00bd85'
  on-secondary-container: '#00452e'
  tertiary: '#e1bfff'
  on-tertiary: '#490081'
  tertiary-container: '#ce9bff'
  on-tertiary-container: '#5e2097'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#68fcbf'
  secondary-fixed-dim: '#45dfa4'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb8ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#62259b'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  canvas-base: '#0a0a0a'
  surface-card: '#171717'
  surface-sub: '#0f0f0f'
  border-subtle: '#262626'
  border-interactive: '#404040'
  brand-amber-hover: '#fbbf24'
  badge-amber-bg: '#451a03'
  badge-amber-border: '#92400e'
  emerald-bg: '#022c22'
  emerald-text: '#34d399'
  emerald-border: '#065f46'
  rose-bg: '#4c0519'
  rose-text: '#fda4af'
  rose-border: '#9f1239'
  purple-bg: '#2e1065'
  purple-text: '#c084fc'
  purple-border: '#581c87'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: '1.15'
  display-hero-mobile:
    fontFamily: Geist
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Geist
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.25'
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.45'
  code-token:
    fontFamily: JetBrains Mono
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.25em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption-mono:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system expresses a refined, culinary dark mode combined with high-precision text telemetry. It bridges the sensory warmth of gastronomy with the tactile tension of real-time competitive party games. Rather than relying on cartoonish illustrations or saturated iconography, the interface establishes authority through disciplined negative space, subtle surface nesting, and typographic weight.

The style operates as an intentional fusion of **Dark Culinary Minimalism** and **Textual Telemetry / Terminal Elegance**:
- **Utilitarian Text-First Purity:** 100% text-driven interface without SVG icons, decorative graphics, or emojis. System status, administrative rank, game states, and actions are rendered as bracketed textual badges (e.g., `[ Trực tuyến ]`, `[ Chủ phòng ]`, `[ Đang chơi ]`).
- **Warm Cyber-Atmosphere:** Pitch-black canvas `#0a0a0a` paired with charred charcoal containers `#171717`, punctuated by glowing embers of culinary Amber (`#f59e0b`, `#fbbf24`).
- **Focus & Tactility:** Clean 1px architectural lines, monospaced game codes, dynamic bracketed state metrics, and instant legible feedback.

## Colors

The color system enforces strict semantic clarity on an ultra-deep charcoal ground. High contrast is maintained for rapid visual scanning during time-critical gameplay.

### Canvas & Structural Neutrals
- **Main Canvas (`#0a0a0a`):** The absolute background anchor for all screens.
- **Card / Container (`#171717`):** Elevated surfaces hosting interactive blocks, lobby groups, and game components.
- **Sub-surface / Inset (`#0f0f0f`):** Recessed inputs, game panels, and nested modules.
- **Default Borders (`#262626`):** Precision 1px division between surfaces.
- **Interactive Border (`#404040`):** Hover and inactive-focus indicator.

### Brand & Interactive Accent
- **Amber 500 (`#f59e0b`):** The primary interactive driver. Used for CTAs, active filters, primary buttons, and identity headers.
- **Amber 400 (`#fbbf24`):** Interactive hover states and highlighted monospaced numbers.
- **Amber Low-tint (`#451a03` background, `#92400e` border):** Active game state indicators (`[ Đang chơi ]`) and connection warnings.

### Semantic Tripartite Palette
Every status token follows a 3-part hierarchy: deep tint background + mid-tone border + bright high-contrast text.
- **Emerald (Lobby / Waiting / Online):** `#022c22` background, `#065f46` border, `#34d399` text.
- **Rose (Error / Full Room / Alert):** `#4c0519` background, `#9f1239` border, `#fda4af` text.
- **Purple (Round Reveal / Final Score):** `#2e1065` background, `#581c87` border, `#c084fc` text.

## Typography

The typographic hierarchy establishes dual rhythms: neutral clarity for descriptions via `Inter` / `Geist`, counterbalanced by tabular telemetry via `JetBrains Mono`.

- **Display & Section Titles:** Rendered in `Geist` with strict weights (600–700) and compact line heights to anchor the viewports without visual noise.
- **Narrative & UI Body:** Handled by `Inter` for optimal reading comfort at neutral tones (`#d4d4d4`).
- **Telemetry, Room Codes & Status Markers:** Powered by `JetBrains Mono`. Game room codes (`HA29KD`) use `code-token` styling with prominent tracking to eliminate character ambiguity. All status badges, timers, counters, and bracket indicators (`[ ... ]`) strictly use `label-mono` and `caption-mono`.

## Elevation & Depth

Visual hierarchy does not rely on diffused drop shadows or heavy blur shaders. Depth is articulated purely through surface stepping, border contrasts, and disciplined backdrop layers.

- **Surface Tiers:**
  - **Base Ground (Level 0):** `#0a0a0a` main viewport canvas.
  - **Containers & Cards (Level 1):** `#171717` bounded by a 1px solid border of `#262626`.
  - **Recessed Areas & Inputs (Level 0.5):** `#0f0f0f` with inset containment to cue editability.
  - **Floating Overlays & Sticky Bars (Level 2):** `#171717` paired with `backdrop-blur-md` and 80% opacity for floating notifications, sticky room headers, and toasts.
- **Borders over Shadows:** Depth is produced through 1px border luminance shifts: non-interactive borders rest at `#262626`, interactive hover borders lift to `#404040`, and active/focus states ignite to `#f59e0b`.

## Shapes

The interface balances functional precision with soft edge radii. 

- **Cards & Primary Panels:** Styled with `rounded-xl` (1rem) to `rounded-2xl` (1.5rem), providing a modern, contained look that softens the dark aesthetic.
- **Text Badges & Tabs:** Pill-shaped or semi-rounded containers strictly bordered by 1px solid lines.
- **Input Fields & Text Cells:** Controlled with `rounded-lg` (0.5rem) to keep data input compact and structured.
- **Empty States:** Framed with dashed borders (`border-dashed border-[#262626]`) to distinguish empty room lobbies from populated game instances.

## Components

### 100% Text-Only Rule
No SVG icons, icon fonts, or emoji graphics are permitted anywhere in the UI. All interactive cues and semantic indicators must use typography and bracketed characters:
- Dismiss: `[ X ]`
- Toggles: `[ BẬT ]` / `[ TẮT ]`
- Refresh: `[ Làm mới ]`
- Host Status: `[ Chủ phòng ]`
- Online: `[ Trực tuyến: 3 ]`

### Buttons
- **Primary CTA:** Solid Amber 500 (`#f59e0b`), inverted jet-black bold text (`#000000`), no drop shadows. On hover, transitions to Amber 400 (`#fbbf24`).
- **Secondary / Action Outlines:** Background `#171717`, border 1px `#262626`, text `#d4d4d4`. On hover, border shifts to `#404040`, text to `#ffffff`.
- **Disabled State:** Background `#171717`, border 1px `#262626`, text `#737373`, cursor `not-allowed`.

### Text-Only Status Badges
Rendered exclusively in `JetBrains Mono` with uppercase or bracketed typography:
- **Online / Waiting:** `bg-[#022c22]` `border-[#065f46]` `text-[#34d399]` -> `[ Đang chờ ]`
- **Active Game / Warning:** `bg-[#451a03]` `border-[#92400e]` `text-[#fcd34d]` -> `[ Đang chơi ]`
- **Error / Room Full:** `bg-[#4c0519]` `border-[#9f1239]` `text-[#fda4af]` -> `[ Phòng đầy ]`
- **Round Summary / Reveal:** `bg-[#2e1065]` `border-[#581c87]` `text-[#c084fc]` -> `[ Tổng kết ]`

### Input Fields
- Background `#0f0f0f`, border 1px `#262626`, text `#f5f5f5`.
- **Focus:** 1px border `#f59e0b` without diffuse glow rings.
- **Room Code Field:** Centered, all-caps, `JetBrains Mono`, tracking-widest, constrained to 6 characters.

### Cards & Game Display
- **Room Cards:** `#171717` surface, 1px `#262626` outline, interior metadata separated by 1px subtle divider lines.
- **Empty State Container:** Dashed border `#262626` with centered mono text `[ Không có dữ liệu ]`.
- **Food Canvas:** Fixed `aspect-square` framed within 1px `#262626`. Loading state uses an `animate-pulse` surface of `#171717`.