# DESIGN.md — Image Boutique | La Boutique Papeterie

> Design Read: independent European-inspired fine stationery storefront and bespoke print atelier (`Image Boutique · La Boutique Papeterie`) for paper collectors, architects, and studios, in an archival print-house editorial language, dial `ENERGY 2 / RHYTHM 3 / MOTION 1`.

## Dials & Intent
- **ENERGY 2 (Balanced)**: Confident editorial typography paired with calm gallery framing rather than loud gradients or neon effects.
- **RHYTHM 3 (Varied)**: Sections shift deliberately between full-bleed split hero, hairline numbered manifesto, clean square favorites, borderless category strip, interactive desk lookbook, structured product gallery with sidebar filter, editorial heritage split, and print atelier gateway.
- **MOTION 1 (Calm)**: Micro-transitions on hover/focus and slide switcher with an explicit Play/Pause control (`prefers-reduced-motion` honored globally); zero endless background marquee or pulsing loops.

## Palette (R-29 Compliant)
- **Core Ground (Light)**: Archival Ivory `#F7F3EB` (`--bg-page`), Warm Paper Surface `#FFFFFF` (`--bg-surface`), Soft Linen `#EFEAE0` (`--bg-soft`).
- **Core Ground (Obsidian Dark)**: Obsidian Carbon `#0D0E0D`, Deep Slate Surface `#151716`, Soft Charcoal `#1B1E1D`.
- **Core Brand Pine**: Botanical Pine `#183E30` (`--accent-pine`) / `#123126` (`--accent-deep`).
- **Core Metallic Brass**: Antique Brass `#A68243` (`--accent-gold`) / Light Gold Highlight `#D6B36A`.
- **Single Primary Accent**: Wax Crimson `#AE3322` (`--accent-crimson`), reserved for key purchase CTAs and status alerts.

## Radius, Elevation & Glass Discipline
- **Radius Scale (R-11)**:
  - `rounded-[4px]`: Section containers, cards, media frames, drawers, modals (`rounded-[6px]` for dialog shells).
  - `rounded-[3px]`: Buttons, inputs, dropdowns, toggles, segmented controls.
  - `rounded-full`: Strictly reserved for physical color swatches and small numeric counters.
- **Shadows (R-12)**: Cards sit flat with `1px` crisp borders; elevated shadow (`shadow-2xl` / `shadow-lg`) is reserved exclusively for true floating overlays (modals, order drawer, category dropdown, toast notification).
- **Glass (R-10)**: Subtle backdrop blur strictly on the sticky `<header>` navigation bar only.

## Typography & Accessibility
- **Typefaces (R-06)**: `Vazirmatn` / `Estedad` for Persian UI clarity, `Amiri` editorial serif for display headings and signature scripts, `Inter` for SKUs and English UI, with `tabular-nums` on all prices and technical print specs.
- **WCAG AA & Keyboard (R-25, R-32, R-39)**: Minimum `4.5:1` contrast across both Light and Obsidian themes, native `<button>`/`<a href>` semantics, explicit `cursor: pointer`, visible `2px` brass `:focus-visible` ring on all focusable elements, and `Escape` dismissal for modals and drawers.
