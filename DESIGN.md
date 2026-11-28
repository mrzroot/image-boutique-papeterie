# DESIGN.md — Image Boutique | La Boutique Papeterie

> Design Read: independent European-inspired fine stationery storefront and bespoke print atelier (`Image Boutique · La Boutique Papeterie`) for paper collectors, architects, and studios, in an archival print-house editorial language, dial `ENERGY 2 / RHYTHM 3 / MOTION 1`.

## Dials & Intent
- **ENERGY 2 (Balanced)**: Confident editorial typography paired with calm gallery framing rather than loud gradients or neon effects.
- **RHYTHM 3 (Varied)**: Sections shift deliberately between full-bleed split hero, hairline numbered manifesto, clean square favorites, borderless category strip, interactive desk lookbook, structured product gallery with sidebar filter, editorial heritage split, and print atelier gateway.
- **MOTION 1 (Calm)**: Micro-transitions on hover/focus only. The hero never autoplays (manual prev/next), content is never hidden waiting for a scroll-reveal, no marquees or pulsing loops (`prefers-reduced-motion` honored globally). Section headings have no kicker label above them.

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
- **Typefaces**: `Estedad` is the Persian UI/body face; `Inter` (Latin subset) is the English/LTR body face; `Amiri` is the display face for section titles, product-page titles, the wordmark and eyebrow notes. All are self-hosted woff2 in `public/fonts`, declared in `index.html`. Display titles are any `h1/h2/h3` sized `text-2xl` or larger.
- **Weights**: body 400, UI 500–600, `font-bold` is remapped to 620; Amiri titles 700. No spaced-caps kicker labels.
- **WCAG AA & Keyboard (R-25, R-32, R-39)**: Minimum `4.5:1` contrast across both Light and Obsidian themes, native `<button>`/`<a href>` semantics, explicit `cursor: pointer`, visible `2px` brass `:focus-visible` ring on all focusable elements, and `Escape` dismissal for modals and drawers.

## Components
- `ProductCard` is the only product tile (bestsellers, new arrivals, catalog, related): image (object-contain), badge, wishlist, quick view, swatches, title linking to the product page, price, one quiet add-to-bag.
- `StorefrontSections`: `SectionHead`, `CategoryIndex`, `ProductRail`, `GalleryMosaic` (CMS `socialGallery`), `AtelierIntro`, `TrustSection` (only facts from the CMS: value strip, shipping threshold, contact).
- Routes: `#/` (curated home), `#/shop` (full catalog with filters), `#/product/:id`, `#/services`, `#/admin`. The admin entry in the header only shows in a browser holding an unpublished draft; the footer link is the owner's way in.
- Controls in `src/index.css`: `.btn-primary` (crimson, one per view), `.btn-quiet` (outlined ink), `.btn-on-dark`, `.icon-btn`, `.icon-chip`, `.swatch`, `.variant-pill`, `.qty-stepper`.
- Contrast: small brass text uses `--accent-gold-ink`; dark theme lifts pine/crimson text colours to AA.

## Product imagery & 3D policy
- The real photo is the reference. Never replace a product photo with a generated one; never present invented geometry as the product.
- `ProductMedia` modes: Original photo (default), 3D presentation (the real photo on a board at its true aspect, rotation clamped so no invented sides show), Accurate 360° only when `model3dUrl` (GLB/GLTF) or at least 8 ordered `spinImages` exist. three.js is lazy-loaded.
- The services 3D preview shows the customer's own configured job and uploaded artwork; it is not a product claim.

## Honesty rules
- There is no backend. Orders are stored on the device and sent to the shop by email or SMS; newsletter sign-up opens an email; gift-card codes are issued by the shop after confirmation. Copy must say so.
