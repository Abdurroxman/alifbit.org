// Koddagi tarjima kalitlarini yig'adi: tr("…"), trn(n, "…"), mk("…") va translate(lang, "…").
// Ishlatish: node scripts/i18n-extract.mjs [ru|en]  — shu tilda tarjimasi yo'q kalitlarni JSON qilib chiqaradi.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIRS = ["src", "server", "shared"];
// Admin panel faqat o'zbekcha.
const SKIP = [/[\\/]pages[\\/]Admin\.tsx$/, /[\\/]components[\\/](AdminParts|DemoEditor|PaymentPanel)\.tsx$/, /[\\/]messages[\\/]/];

const STRING = String.raw`"((?:[^"\\]|\\.)*)"`;
const PATTERNS = [
  new RegExp(String.raw`\b(?:tr|mk)\(\s*${STRING}`, "g"),
  new RegExp(String.raw`\btrn\([^,()]+(?:\([^()]*\))?[^,()]*,\s*${STRING}`, "g"),
  new RegExp(String.raw`\btranslate(?:Plural)?\([^,]+,\s*(?:[^,]+,\s*)?${STRING}`, "g"),
];
// Server sahifalarida tarjima funksiyasi qisqa nom bilan: t("…").
const SERVER_PATTERN = new RegExp(String.raw`\bt\(\s*${STRING}`, "g");

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(ts|tsx)$/.test(name) && !SKIP.some((re) => re.test(path)) ? [path] : [];
  });
}

/** Map: kalit → u uchragan fayllar. */
export function extractKeys() {
  const keys = new Map();
  for (const dir of DIRS)
    for (const file of files(join(ROOT, dir))) {
      const text = readFileSync(file, "utf8");
      const patterns = /[\\/]server[\\/]/.test(file) ? [...PATTERNS, SERVER_PATTERN] : PATTERNS;
      for (const re of patterns)
        for (const m of text.matchAll(re)) {
          const key = JSON.parse(`"${m[1]}"`);
          if (!keys.has(key)) keys.set(key, new Set());
          keys.get(key).add(relative(ROOT, file).replace(/\\/g, "/"));
        }
    }
  return keys;
}

const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

/** Tarjimasi yo'q yoki `{…}` joylari mos kelmaydigan kalitlar. */
export function problems(dict, keys = extractKeys()) {
  const missing = [];
  const badPlaceholders = [];
  for (const key of keys.keys()) {
    const value = dict[key];
    if (typeof value !== "string" || !value.trim()) missing.push(key);
    else if (value.split("|").some((form) => placeholders(form) !== placeholders(key))) badPlaceholders.push(key);
  }
  const unused = Object.keys(dict).filter((k) => !keys.has(k));
  return { missing, badPlaceholders, unused };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const lang = process.argv[2];
  const keys = extractKeys();
  if (!lang) {
    console.log(JSON.stringify([...keys.keys()], null, 1));
  } else {
    const dict = (await import(`../shared/messages/${lang}.ts`)).default;
    console.log(JSON.stringify(problems(dict, keys), null, 1));
  }
}
