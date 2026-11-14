// Ishga tushirish: node --experimental-strip-types scripts/prepare-assets.mjs
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";
import { markSvgBody } from "../shared/logo.ts";

await Promise.all(["public/brand", "public/fonts"].map((p) => mkdir(p, { recursive: true })));

const PALETTES = {
  color: { armTop: "#557A5D", armBottom: "#2F5440", edge: "#B69A70", alif: "#C9A66B", word: "#244534", wordAccent: "#A8844C" },
  light: { armTop: "#557A5D", armBottom: "#2F5440", edge: "#B69A70", alif: "#C9A66B", word: "#244534", wordAccent: "#A8844C" },
  dark: { armTop: "#DFE7D8", armBottom: "#B9C8B2", edge: "#CCB17D", alif: "#D8BF92", word: "#EEF1E8", wordAccent: "#D8BF92" },
  mono: { armTop: "#244534", armBottom: "#244534", edge: "#244534", alif: "#244534", word: "#244534", wordAccent: "#244534" },
};
const mark = (p) => markSvgBody(p);

for (const [name, p] of Object.entries(PALETTES)) {
  const bg = name === "dark" ? `<rect width="260" height="290" fill="#244534"/>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 290"><title>AlifBit</title>${bg}<g transform="translate(30 4)">${mark(p)}</g><text x="130" y="262" text-anchor="middle" font-family="Manrope,Arial,sans-serif" font-size="50" font-weight="700" letter-spacing="-2.4" fill="${p.word}">Alif<tspan fill="${p.wordAccent}">Bit</tspan></text></svg>`;
  await writeFile(`public/brand/logo-${name}.svg`, svg);
}

const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><title>AlifBit</title>${mark(PALETTES.color)}</svg>`;
await writeFile("public/brand/mark.svg", markSvg);

// Ilova ikonkalari: ivory fon ustida belgi.
const icon = (size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F9F8F5"/><g transform="translate(22 18) scale(.78)">${mark(PALETTES.color)}</g></svg>`;
await sharp(Buffer.from(icon(180))).png().toFile("public/brand/apple-touch-icon.png");
await sharp(Buffer.from(icon(512))).png().toFile("public/brand/icon-512.png");

const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#F9F8F5"/><path d="M60 570H1140" stroke="#D2DACA"/><g transform="translate(70 104) scale(1.75)">${mark(PALETTES.color)}</g><text x="470" y="262" font-family="Manrope,Arial,sans-serif" font-size="108" font-weight="700" letter-spacing="-6" fill="#244534">Alif<tspan fill="#A8844C">Bit</tspan></text><text x="474" y="340" font-family="Arial,sans-serif" font-size="34" fill="#466B50">Ilmdan g‘oyaga.</text><text x="474" y="388" font-family="Arial,sans-serif" font-size="34" fill="#466B50">G‘oyadan amalga.</text><text x="80" y="538" font-family="Arial,sans-serif" font-size="17" letter-spacing="2" fill="#646E67">TEXNOLOGIYA. ILM. IJOD.</text><text x="1000" y="538" font-family="Arial,sans-serif" font-size="17" fill="#646E67">alifbit.org</text></svg>`;
await writeFile("public/brand/social.svg", social);
await sharp(Buffer.from(social)).png().toFile("public/brand/social.png");

for (const name of ["manrope", "inter"]) {
  await copyFile(`node_modules/@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`, `public/fonts/${name}-latin.woff2`);
  await copyFile(`node_modules/@fontsource-variable/${name}/LICENSE`, `public/fonts/${name}-OFL.txt`);
}
console.log("Brand assets and self-hosted fonts prepared.");
