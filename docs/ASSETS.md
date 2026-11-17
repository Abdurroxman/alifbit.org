# AlifBit visual assets

## Hero

The home page hero is typography only: a centered headline revealed letter by letter (`Chars` in `src/components/ui.tsx`) over three slowly drifting blurred green and bronze shapes (`src/styles/hero.css`). No raster hero image is used.

## Logo

Hand-drawn vector interpretation of the user-supplied raster logo: each bracket is a two-arm folded ribbon with a bronze edge, the Alif keeps its hooked top and tapered tail. Single source: `shared/logo.ts`. `scripts/prepare-assets.mjs` emits `public/brand` variants (color, light, dark, mono, mark/favicon, apple-touch-icon, 512 px icon, social image). This is true vector path artwork, not an embedded PNG.

## Concept covers

`src/components/ProjectArt.tsx`: original SVG compositions for DALOLAT and Sado, plus a neutral logo cover (`custom`). They are shown on work detail pages; an uploaded image replaces them.

## Typography

Self-hosted variable Manrope and Inter Latin WOFF2 subsets from Fontsource. SIL Open Font License texts are bundled next to fonts in `public/fonts`. Core Uzbek Latin letters use these subsets; punctuation and characters outside a subset use the browser's system fallback as needed.
