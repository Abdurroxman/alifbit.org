# AlifBit visual assets

## Hero

The hero is a live SVG composition (`src/components/HeroScene.tsx`) built from the logo parts: two folded green brackets with depth, the golden Alif, a bronze orbit with a sphere passing behind and in front, and floating bits. No raster hero image is used.

## Logo

Hand-drawn vector interpretation of the user-supplied raster logo: each bracket is a two-arm folded ribbon with a bronze edge, the Alif keeps its hooked top and tapered tail. Single source: `shared/logo.ts`. `scripts/prepare-assets.mjs` emits `public/brand` variants (color, light, dark, mono, mark/favicon, apple-touch-icon, 512 px icon, social image). This is true vector path artwork, not an embedded PNG.

## Concept covers

`src/components/ProjectArt.tsx`: original SVG compositions (with a wireframe variant for the Render comparison) for DALOLAT, voice-to-text, Academy, Library, Films and Render. They do not represent screenshots of released products. Project detail pages label these as visual concepts.

## Typography

Self-hosted variable Manrope and Inter Latin WOFF2 subsets from Fontsource. SIL Open Font License texts are bundled next to fonts in `public/fonts`. Core Uzbek Latin letters use these subsets; punctuation and characters outside a subset use the browser's system fallback as needed.
