# AlifBit visual assets

## Hero

Built-in Imagegen was used. Final source: `public/images/idea-sculpture.png`. Optimized production asset: `public/images/idea-sculpture.webp` (1400 px, quality 85). The original generated PNG is retained in source for future non-destructive optimization; exclude it from deployment assets if desired after preserving the source elsewhere.

Prompt:

> Use case: stylized-concept. Asset type: premium AlifBit technology and knowledge brand website hero artwork, a raster studio still life, NOT a website screenshot. Wide landscape 1536x1024 composition. Create a beautifully art-directed photoreal CGI sculpture: two substantial matte muted forest green (#466B50) angled bracket-like architectural forms, a slender upright warm ivory monolith, a small brushed champagne bronze sphere suspended between them, one fine brushed bronze circular orbit ring. The arrangement suggests an idea becoming a digital product, balanced asymmetric composition in an elegant architect's gallery. Seamless warm ivory (#F9F8F5) cyclorama, tactile ceramic surfaces with fine texture, broad diffused afternoon daylight from upper left, soft realistic contact shadows on ivory ground, restrained bronze highlights, calm refined editorial product photography. Sculptural objects centrally framed, full composition visible, generous margins, camera slightly above tabletop, no dramatic perspective. Avoid neon, glowing gradients, glassmorphism, busy background, text, letters, logos, watermarks, people, UI panels. The materials, lighting and composition should look commissioned by a top architecture magazine.

## Logo

Hand-drawn SVG interpretation of the user-supplied raster reference. The green folded bracket motif and central golden Alif silhouette are preserved in simplified form. This is true vector path artwork, not an embedded PNG. `src/components/Brand.tsx` is the animated inline version. `scripts/prepare-assets.mjs` emits standalone mark and stacked wordmark variants.

## Concept covers

`src/components/ProjectArt.tsx`: original CSS/HTML compositions for DALOLAT, voice-to-text, Academy, Library, Films and Render. They do not represent screenshots of released products. Project detail pages label these as visual concepts.

## Typography

Self-hosted variable Manrope and Inter Latin WOFF2 subsets from Fontsource. SIL Open Font License texts are bundled next to fonts in `public/fonts`. Core Uzbek Latin letters use these subsets; punctuation and characters outside a subset use the browser's system fallback as needed.
