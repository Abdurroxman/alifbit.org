// Kontent tarjimalaridan migratsiya yasaydi.
//
//   node --experimental-strip-types scripts/build-i18n-migration.mjs <manba papka> [chiqish.sql]
//
// <manba papka> — jonli D1 dan olingan JSON (wrangler d1 execute ... --json --command "SELECT * FROM services" va h.k.):
// services.json, projects.json, courses.json. Tarjimalar — db/translations/ (services.json, courses.json, categories.json,
// projects/<slug>.json). Har tarjima fayli manba obyekt tuzilmasini takrorlaydi: { ru: {...}, en: {...}, <ro'yxat>: [...] }.
//
// Migratsiya faqat `i18n` kalitlarini yozadi — o'zbekcha matnga tegmaydi. Har tarjima maydoni yonida asl matn xeshi
// (`$h`) saqlanadi: jonli bazada matn keyinroq o'zgargan bo'lsa, eski tarjima saytda ko'rsatilmaydi.
// Ro'yxatlar uzunligi WHERE shartida tekshiriladi: tuzilma o'zgargan yozuv yangilanmaydi.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SHAPES, TRANSLATED, textHash } from "../shared/i18n.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TR = join(ROOT, "db", "translations");

function rows(dir, table) {
  const file = join(dir, `${table}.json`);
  if (!existsSync(file)) return [];
  const data = JSON.parse(readFileSync(file, "utf8"));
  return (Array.isArray(data) ? data[0].results : data.results).map((r) => ({ slug: r.slug, data: JSON.parse(r.data) }));
}

const isStr = (v) => typeof v === "string";

/**
 * Manba obyektiga tarjimani biriktiradi. Qaytaradi: [[json yo'l, qiymat]], ro'yxat uzunligi shartlari, xatolar, ogohlantirishlar.
 */
function attach(src, shape, tr, path, out) {
  const known = new Set([...TRANSLATED, ...Object.keys(shape.children ?? {}), ...Object.keys(shape.lists ?? {})]);
  for (const key of Object.keys(tr)) if (!known.has(key)) out.errors.push(`${path}: noma'lum kalit «${key}»`);
  const i18n = {};
  const childTr = {};
  const listTr = {};
  for (const lang of TRANSLATED) {
    const overlay = tr[lang];
    if (!overlay) continue;
    const own = {};
    const hashes = {};
    for (const [key, value] of Object.entries(overlay)) {
      if (shape.fields.includes(key)) {
        const source = src[key];
        if (source === undefined || source === "") {
          out.errors.push(`${path}.${lang}.${key}: manbada bu maydon bo'sh`);
          continue;
        }
        if (isStr(source) && (!isStr(value) || !value.trim())) out.errors.push(`${path}.${lang}.${key}: matn bo'lishi kerak`);
        if (Array.isArray(source)) {
          if (!Array.isArray(value) || value.length !== source.length)
            out.errors.push(`${path}.${lang}.${key}: ro'yxat uzunligi ${Array.isArray(value) ? value.length : "?"} ≠ manba ${source.length}`);
          else if (value.some((v) => !isStr(v) || !v.trim())) out.errors.push(`${path}.${lang}.${key}: bo'sh element`);
        }
        own[key] = value;
        hashes[key] = textHash(source);
      } else if (shape.media?.includes(key)) {
        if (!/^\/media\/public\/[a-f0-9-]+\.(png|jpg|webp)$/.test(value)) out.errors.push(`${path}.${lang}.${key}: rasm manzili noto'g'ri`);
        own[key] = value;
      } else if (shape.children?.[key]) {
        (childTr[key] ??= {})[lang] = value;
      } else if (shape.lists?.[key] && shape.lists[key].fields.length === 1 && Array.isArray(value)) {
        // Bitta matnli elementlar ro'yxati (demo tugmalari) til ichida qisqa yoziladi: "buttons": ["…", "…"].
        const items = Array.isArray(src[key]) ? src[key] : [];
        if (value.length !== items.length) out.errors.push(`${path}.${lang}.${key}: ${value.length} ≠ manba ${items.length}`);
        const field = shape.lists[key].fields[0];
        listTr[key] ??= items.map(() => ({}));
        value.forEach((v, i) => {
          if (listTr[key][i]) listTr[key][i][lang] = { [field]: v };
        });
      } else out.errors.push(`${path}.${lang}.${key}: tarjima qilinmaydigan maydon`);
    }
    if (Object.keys(own).length) i18n[lang] = Object.keys(hashes).length ? { ...own, $h: hashes } : own;
  }
  // Tarjimasi tushib qolgan matn maydonlari — ogohlantirish.
  for (const lang of TRANSLATED)
    for (const field of shape.fields) {
      const source = src[field];
      const empty = source === undefined || source === "" || (Array.isArray(source) && source.length === 0);
      if (!empty && (isStr(source) || Array.isArray(source)) && !(i18n[lang] && field in i18n[lang]) && !(field === "price" || field === "term"))
        out.warnings.push(`${path}.${lang}.${field}: tarjima yo'q`);
    }
  if (Object.keys(i18n).length) out.sets.push([`${path}.i18n`, i18n]);
  for (const [key, child] of Object.entries(shape.children ?? {})) {
    const t = { ...(tr[key] ?? {}) };
    for (const [lang, v] of Object.entries(childTr[key] ?? {})) t[lang] = { ...(t[lang] ?? {}), ...v };
    if (!Object.keys(t).length) {
      if (src[key]) out.warnings.push(`${path}.${key}: tarjima yo'q`);
      continue;
    }
    if (!src[key]) out.errors.push(`${path}.${key}: manbada yo'q`);
    else attach(src[key], child, t, `${path}.${key}`, out);
  }
  for (const [key, item] of Object.entries(shape.lists ?? {})) {
    const items = Array.isArray(src[key]) ? src[key] : [];
    const top = tr[key];
    const fromLang = listTr[key];
    if (!top && !fromLang) {
      if (items.length) out.warnings.push(`${path}.${key}: tarjima yo'q`);
      continue;
    }
    if (top && (!Array.isArray(top) || top.length !== items.length))
      out.errors.push(`${path}.${key}: ${Array.isArray(top) ? top.length : "?"} element ≠ manba ${items.length}`);
    out.guards.push([`${path}.${key}`, items.length]);
    items.forEach((it, i) => {
      const t = { ...((top && top[i]) ?? {}) };
      if (fromLang?.[i]) for (const [lang, v] of Object.entries(fromLang[i])) t[lang] = { ...(t[lang] ?? {}), ...v };
      if (Object.keys(t).length) attach(it, item, t, `${path}.${key}[${i}]`, out);
    });
  }
}

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

function statement(table, slug, out) {
  const pairs = out.sets.map(([p, v]) => `${q(p)}, json(${q(JSON.stringify(v))})`).join(",\n  ");
  const guards = out.guards.map(([p, n]) => `json_array_length(data, ${q(p)}) = ${n}`);
  return `UPDATE ${table} SET data = json_set(data,\n  ${pairs})\nWHERE slug = ${q(slug)}${guards.length ? `\n  AND ${guards.join("\n  AND ")}` : ""};`;
}

export function build(sourceDir) {
  const report = { errors: [], warnings: [], statements: [] };
  const plan = [
    ["services", JSON.parse(readFileSync(join(TR, "services.json"), "utf8"))],
    ["courses", JSON.parse(readFileSync(join(TR, "courses.json"), "utf8"))],
    [
      "projects",
      Object.fromEntries(
        readdirSync(join(TR, "projects"))
          .filter((f) => f.endsWith(".json"))
          .map((f) => [f.replace(/\.json$/, ""), JSON.parse(readFileSync(join(TR, "projects", f), "utf8"))]),
      ),
    ],
  ];
  for (const [table, translations] of plan) {
    const source = rows(sourceDir, table);
    for (const [slug, tr] of Object.entries(translations)) {
      const row = source.find((r) => r.slug === slug);
      if (!row) {
        report.errors.push(`${table}/${slug}: manbada topilmadi`);
        continue;
      }
      const out = { sets: [], guards: [], errors: [], warnings: [] };
      attach(row.data, SHAPES[table], tr, "$", out);
      report.errors.push(...out.errors.map((e) => `${table}/${slug} ${e}`));
      report.warnings.push(...out.warnings.map((e) => `${table}/${slug} ${e}`));
      if (out.sets.length) report.statements.push(statement(table, slug, out));
    }
    for (const row of source) if (!translations[row.slug]) report.warnings.push(`${table}/${row.slug}: tarjima fayli yo'q`);
  }
  const categories = JSON.parse(readFileSync(join(TR, "categories.json"), "utf8"));
  report.statements.push(
    `INSERT INTO settings(key, data) VALUES('categories_i18n', json(${q(JSON.stringify(categories))}))\n  ON CONFLICT(key) DO UPDATE SET data = excluded.data;`,
  );
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [sourceDir, output] = process.argv.slice(2);
  if (!sourceDir) {
    console.error("Ishlatish: node --experimental-strip-types scripts/build-i18n-migration.mjs <manba papka> [chiqish.sql]");
    process.exit(2);
  }
  const report = build(sourceDir);
  for (const w of report.warnings) console.log("ogohlantirish:", w);
  for (const e of report.errors) console.log("XATO:", e);
  if (report.errors.length) process.exit(1);
  const sql =
    "-- Kontent tarjimalari (ru, en): faqat `i18n` kalitlari yoziladi, o'zbekcha matn o'zgarmaydi.\n" +
    "-- scripts/build-i18n-migration.mjs yasagan: manba — jonli D1, tarjimalar — db/translations/.\n\n" +
    report.statements.join("\n\n") +
    "\n";
  if (output) writeFileSync(output, sql);
  console.log(`${report.statements.length} ta yozuv, ${(sql.length / 1024).toFixed(0)} KB${output ? ` → ${output}` : ""}`);
}
