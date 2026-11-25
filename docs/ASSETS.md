# AlifBit visual assets

## Hero

The home page hero asks "Sizga nima kerak?" (headline revealed letter by letter, `Chars` in `src/components/ui.tsx`) over three slowly drifting blurred green and bronze shapes (`src/styles/hero.css`). Beside it a three.js scene (`src/three/scene.ts`) shows a laptop and a phone built in code (no model files). Their screens are canvas-drawn mockups (`src/three/screens.ts`: website, design tool, Telegram bot, CRM dashboard, AI coding, Sado) or real screenshots of the owner's own products: `public/images/works/dalolat-site.webp` (dalolat.app, captured 2026-11-18 at 1280×800) and `public/images/dalolat/feed.webp`. Works without their own mockup (solution samples) use the drawn screen of their service direction.

## Intro

`src/components/Intro.tsx`: on the first visit the brackets and the Alif assemble while the mark turns in from depth (CSS 3D, `src/styles/intro.css`), the wordmark is revealed left to right, and both fly into the header.

## Logo

The 3D-rendered AlifBit logo with its background removed; the logo pixels themselves are unchanged. Source: `assets/brand` holds a color and a silver variant, each split into four layers on the full logo canvas (left bracket, Alif, right bracket, wordmark), plus `brand.json` with the mark and wordmark boxes. `scripts/prepare-assets.mjs` emits `public/brand`: the three mark layers in two sizes (stacked by `BrandMark` so the intro can assemble them), the wordmark, a single-image mark, `logo.png` (schema.org), `favicon-32.png`, `apple-touch-icon.png`, 192 and 512 px icons, `social.png`, and `public/favicon.ico`. The silver variant is padded to the color variant's aspect ratio so the theme can swap them in place. Light theme shows the color variant; dark theme and green surfaces show silver.

## Concept covers

`src/components/ProjectArt.tsx`: original SVG compositions for DALOLAT and Sado, plus a neutral logo cover (`custom`). They are shown on work detail pages; an uploaded image replaces them.

## Typography

Self-hosted variable Manrope and Inter Latin WOFF2 subsets from Fontsource. SIL Open Font License texts are bundled next to fonts in `public/fonts`. Core Uzbek Latin letters use these subsets; punctuation and characters outside a subset use the browser's system fallback as needed.
