// Ishga tushirish: node scripts/prepare-assets.mjs
// Manba: assets/brand — 3D logo fonsiz qirqilgan (rangli va kumush). Har variantda to'rt qism
// (chap qavs, alif, o'ng qavs, yozuv) logoning to'liq tuvalida turadi; brand.json belgi va yozuv
// chegaralarini saqlaydi. Sayt uchun shu qismlardan kerakli o'lchamdagi nusxalar yasaladi.
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import sharp from "sharp";

await Promise.all(["public/brand", "public/fonts"].map((p) => mkdir(p, { recursive: true })));

const SRC = "assets/brand";
const meta = JSON.parse(await readFile(`${SRC}/brand.json`, "utf8"));
const IVORY = "#F9F8F5";
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

// Kumush variant boshqa render, nisbati biroz farq qiladi: ikkala variant bitta joyga almashib
// tushishi uchun belgi va yozuv tuvali rangli variant nisbatiga yetguncha yon tomondan kengaytiriladi.
const ratio = (b) => (b[2] - b[0]) / (b[3] - b[1]);
const MARK_RATIO = ratio(meta.rangli.mark);
const WORD_RATIO = ratio(meta.rangli.word);

/** Qism(lar)ni tuvaldan qirqib oladi; `target` nisbatga yetkazish uchun shaffof chet qo'shadi. */
async function crop(variant, parts, box, target) {
  const [w, h] = meta[variant].size;
  const layers = parts.map((p) => ({ input: `${SRC}/${variant}/${p}.png` }));
  const full = await sharp({ create: { width: w, height: h, channels: 4, background: CLEAR } })
    .composite(layers)
    .png()
    .toBuffer();
  const [x0, y0, x1, y1] = box;
  const need = Math.round((y1 - y0) * target) - (x1 - x0);
  const left = Math.max(Math.floor(need / 2), 0);
  const right = Math.max(need - left, 0);
  return sharp(full)
    .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
    .extend({ left, right, top: 0, bottom: 0, background: CLEAR })
    .png()
    .toBuffer();
}

/** Balandlik bo'yicha kichraytiradi; asl o'lchamdan kattalashtirilmaydi. */
async function fitHeight(buffer, height) {
  return sharp(buffer).resize({ height, withoutEnlargement: true }).png().toBuffer();
}

const webp = (buffer, file) =>
  sharp(buffer).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(`public/brand/${file}`);

const MARK_PARTS = { left: "chap", alif: "alif", right: "ong" };
const SIZES = { s: 160, l: 512 };
for (const variant of ["rangli", "kumush"]) {
  const suffix = variant === "kumush" ? "-silver" : "";
  for (const [part, file] of Object.entries(MARK_PARTS)) {
    const layer = await crop(variant, [file], meta[variant].mark, MARK_RATIO);
    for (const [size, height] of Object.entries(SIZES)) {
      await webp(await fitHeight(layer, height), `mark-${part}-${size}${suffix}.webp`);
    }
  }
  const word = await crop(variant, ["yozuv"], meta[variant].word, WORD_RATIO);
  await webp(await fitHeight(word, 128), `wordmark${suffix}.webp`);
}

const markFull = await crop("rangli", ["chap", "alif", "ong"], meta.rangli.mark, MARK_RATIO);
await webp(await fitHeight(markFull, 512), "mark.webp");

// schema.org uchun to'liq logo (PNG).
const [lw, lh] = meta.rangli.size;
const logoFull = await sharp({ create: { width: lw, height: lh, channels: 4, background: CLEAR } })
  .composite(["chap", "alif", "ong", "yozuv"].map((p) => ({ input: `${SRC}/rangli/${p}.png` })))
  .png()
  .toBuffer();
await sharp(logoFull).resize({ height: 512 }).png({ compressionLevel: 9 }).toFile("public/brand/logo.png");

/** Kvadrat ikonka: belgi markazda, `fill` — belgi egallaydigan ulush; fon berilmasa shaffof. */
async function icon(size, fill, background) {
  const inner = Math.round(size * fill);
  const mark = await sharp(markFull)
    .resize({ width: inner, height: inner, fit: "contain", background: CLEAR })
    .png()
    .toBuffer();
  const base = sharp({
    create: { width: size, height: size, channels: 4, background: background ?? CLEAR },
  });
  const offset = Math.round((size - inner) / 2);
  return base.composite([{ input: mark, left: offset, top: offset }]).png().toBuffer();
}

await writeFile("public/brand/apple-touch-icon.png", await icon(180, 0.8, IVORY));
await writeFile("public/brand/icon-192.png", await icon(192, 0.8, IVORY));
await writeFile("public/brand/icon-512.png", await icon(512, 0.8, IVORY));
await writeFile("public/brand/favicon-32.png", await icon(32, 1));

// favicon.ico: 16, 32 va 48 px PNG yozuvlari bitta ICO konteynerida.
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((s) => icon(s, 1)));
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((png, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(icoSizes[i], e);
  header.writeUInt8(icoSizes[i], e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(png.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += png.length;
});
await writeFile("public/favicon.ico", Buffer.concat([header, ...pngs]));

// Ijtimoiy tarmoqlar uchun rasm: chapda belgi, o'ngda yozuv va shior.
const wordFull = await crop("rangli", ["yozuv"], meta.rangli.word, WORD_RATIO);
const socialMark = await sharp(markFull).resize({ height: 340 }).png().toBuffer();
const socialWord = await sharp(wordFull).resize({ height: 104 }).png().toBuffer();
const markW = (await sharp(socialMark).metadata()).width;
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${IVORY}"/><path d="M60 570H1140" stroke="#D2DACA"/><text x="${110 + markW + 50}" y="352" font-family="Manrope,Arial,sans-serif" font-size="34" fill="#466B50">Ilmdan g‘oyaga.</text><text x="${110 + markW + 50}" y="400" font-family="Manrope,Arial,sans-serif" font-size="34" fill="#466B50">G‘oyadan amalga.</text><text x="80" y="538" font-family="Arial,sans-serif" font-size="17" letter-spacing="2" fill="#646E67">TEXNOLOGIYA. ILM. IJOD.</text><text x="1000" y="538" font-family="Arial,sans-serif" font-size="17" fill="#646E67">alifbit.org</text></svg>`;
await sharp(Buffer.from(social))
  .composite([
    { input: socialMark, left: 110, top: 110 },
    { input: socialWord, left: 110 + markW + 46, top: 182 },
  ])
  .png({ compressionLevel: 9 })
  .toFile("public/brand/social.png");

for (const name of ["manrope", "inter"]) {
  await copyFile(`node_modules/@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`, `public/fonts/${name}-latin.woff2`);
  await copyFile(`node_modules/@fontsource-variable/${name}/LICENSE`, `public/fonts/${name}-OFL.txt`);
}
console.log("Brand assets and self-hosted fonts prepared.", { markRatio: MARK_RATIO.toFixed(4), wordRatio: WORD_RATIO.toFixed(4) });
