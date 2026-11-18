# AlifBit visual assets

## Hero

The home page hero asks "Sizga nima kerak?" (headline revealed letter by letter, `Chars` in `src/components/ui.tsx`) over three slowly drifting blurred green and bronze shapes (`src/styles/hero.css`). Beside it a three.js scene (`src/three/scene.ts`) shows a laptop and a phone built in code (no model files). Their screens are canvas-drawn mockups (`src/three/screens.ts`: website, design tool, Telegram bot, CRM dashboard, AI coding, Sado) or real screenshots of the owner's own products: `public/images/works/dalolat-site.webp` (dalolat.app) and `public/images/works/sado-site.webp` (sado.alifbit.org), both captured 2026-11-18 at 1280×800, plus `public/images/dalolat/feed.webp`.

## Intro

`src/components/Intro.tsx`: on the first visit the logo pieces assemble while the mark turns in from depth (CSS 3D, `src/styles/intro.css`) and fly into the header.

## Logo

Hand-drawn vector interpretation of the user-supplied raster logo: each bracket is a two-arm folded ribbon with a bronze edge, the Alif keeps its hooked top and tapered tail. Single source: `shared/logo.ts`. `scripts/prepare-assets.mjs` emits `public/brand` variants (color, light, dark, mono, mark/favicon, apple-touch-icon, 512 px icon, social image). This is true vector path artwork, not an embedded PNG.

## Concept covers

`src/components/ProjectArt.tsx`: original SVG compositions for DALOLAT and Sado, plus a neutral logo cover (`custom`). They are shown on work detail pages; an uploaded image replaces them.

## Typography

Self-hosted variable Manrope and Inter Latin WOFF2 subsets from Fontsource. SIL Open Font License texts are bundled next to fonts in `public/fonts`. Core Uzbek Latin letters use these subsets; punctuation and characters outside a subset use the browser's system fallback as needed.
