import { mkdir, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";
await Promise.all(
  ["public/brand", "public/fonts"].map((p) => mkdir(p, { recursive: true })),
);
const paths = `<path d="M73 54H55Q50 54 46 58L14 90Q4 100 14 112L46 146Q50 150 56 150H74L29 105Q25 101 30 97Z" fill="GREEN" stroke="GOLD" stroke-width="1.2"/><path d="M127 54H145Q150 54 154 58L186 90Q196 100 186 112L154 146Q150 150 144 150H126L171 105Q175 101 170 97Z" fill="GREEN" stroke="GOLD" stroke-width="1.2"/><path d="M119 5C114 24 84 24 77 49C86 42 94 37 94 49V140C94 161 90 175 82 188C101 175 115 159 116 137Z" fill="GOLD"/>`;
const mark = (green, gold) =>
  paths.replaceAll("GREEN", green).replaceAll("GOLD", gold);
for (const [name, green, gold] of [
  ["color", "#466B50", "#B69A70"],
  ["light", "#466B50", "#B69A70"],
  ["dark", "#E3EADB", "#CCB17D"],
  ["mono", "#244534", "#244534"],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 290"><title>AlifBit</title><g transform="translate(30 5)">${mark(green, gold)}</g><text x="130" y="252" text-anchor="middle" font-family="Arial,sans-serif" font-size="47" font-weight="700" letter-spacing="-2" fill="${green}">Alif<tspan fill="${gold}">Bit</tspan></text></svg>`;
  await writeFile(`public/brand/logo-${name}.svg`, svg);
}
await writeFile(
  "public/brand/mark.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><title>AlifBit</title>${mark("#466B50", "#B69A70")}</svg>`,
);
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#F9F8F5"/><path d="M60 570H1140" stroke="#D2DACA"/><g transform="translate(80 110) scale(1.3)">${mark("#466B50", "#B69A70")}</g><text x="445" y="245" font-family="Arial,sans-serif" font-size="104" font-weight="700" letter-spacing="-7" fill="#244534">Alif<tspan fill="#B69A70">Bit</tspan></text><text x="450" y="330" font-family="Arial,sans-serif" font-size="33" fill="#466B50">Ilmdan g‘oyaga.</text><text x="450" y="377" font-family="Arial,sans-serif" font-size="33" fill="#466B50">G‘oyadan amalga.</text><text x="80" y="538" font-family="Arial,sans-serif" font-size="17" fill="#677069">TEXNOLOGIYA. ILM. IJOD.</text><text x="990" y="538" font-family="Arial,sans-serif" font-size="17" fill="#677069">alifbit.org</text></svg>`;
await writeFile("public/brand/social.svg", social);
await sharp(Buffer.from(social)).png().toFile("public/brand/social.png");
await sharp("public/images/idea-sculpture.png")
  .resize({ width: 1400, withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile("public/images/idea-sculpture.webp");
for (const name of ["manrope", "inter"]) {
  await copyFile(
    `node_modules/@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`,
    `public/fonts/${name}-latin.woff2`,
  );
  await copyFile(
    `node_modules/@fontsource-variable/${name}/LICENSE`,
    `public/fonts/${name}-OFL.txt`,
  );
}
console.log("Brand assets, optimized hero and self-hosted fonts prepared.");
