import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  carryTranslations,
  graftI18n,
  i18nTree,
  localePath,
  localize,
  localizeMoney,
  localizeTerm,
  splitLangPath,
  textHash,
  textSlots,
  translate,
  translatePlural,
} from "../shared/i18n.ts";
import ru from "../shared/messages/ru.ts";
import en from "../shared/messages/en.ts";
import { extractKeys, problems } from "../scripts/i18n-extract.mjs";
import { buildPage, buildSitemap, renderHtml, type ContentSource } from "../server/seo.ts";
import { parseTranslation } from "../server/translate.ts";

test("every UI text in the code has a Russian and English translation with the same placeholders", () => {
  const keys = extractKeys();
  assert.ok(keys.size > 500, "kalitlar topilmadi");
  for (const [name, dict] of [["ru", ru], ["en", en]] as const) {
    const p = problems(dict, keys);
    assert.deepEqual(p.missing, [], `${name}: tarjimasi yo'q`);
    assert.deepEqual(p.badPlaceholders, [], `${name}: {…} joylari mos emas`);
    assert.deepEqual(p.unused, [], `${name}: ishlatilmaydigan kalit`);
  }
});

test("language prefix in paths", () => {
  assert.deepEqual(splitLangPath("/ru/services/seo"), { lang: "ru", path: "/services/seo" });
  assert.deepEqual(splitLangPath("/en"), { lang: "en", path: "/" });
  assert.deepEqual(splitLangPath("/services"), { lang: "uz", path: "/services" });
  assert.deepEqual(splitLangPath("/russia"), { lang: "uz", path: "/russia" });
  assert.equal(localePath("ru", "/"), "/ru");
  assert.equal(localePath("en", "/contact"), "/en/contact");
  assert.equal(localePath("uz", "/contact"), "/contact");
});

test("translate and plural forms", () => {
  assert.equal(translate("uz", "Bosh sahifa"), "Bosh sahifa");
  assert.equal(translate("ru", "Bosh sahifa"), "Главная");
  assert.equal(translate("en", "Xizmat {number}", { number: "03" }), "Service 03");
  assert.equal(translate("ru", "Hech qayerda yo'q matn"), "Hech qayerda yo'q matn");
  assert.equal(translatePlural("ru", 1, "{n} ta ish"), "1 работа");
  assert.equal(translatePlural("ru", 3, "{n} ta ish"), "3 работы");
  assert.equal(translatePlural("ru", 12, "{n} ta ish"), "12 работ");
  assert.equal(translatePlural("ru", 21, "{n} ta ish"), "21 работа");
  assert.equal(translatePlural("en", 1, "{n} ta ish"), "1 project");
  assert.equal(translatePlural("en", 5, "{n} ta ish"), "5 projects");
  assert.equal(translatePlural("uz", 5, "{n} ta ish"), "5 ta ish");
});

test("prices and terms are converted from the Uzbek value, so they never go out of date", () => {
  assert.equal(localizeMoney("1 200 000 so‘m", "ru"), "1 200 000 сум");
  assert.equal(localizeMoney("2 500 000 so‘m/oy", "en"), "2 500 000 UZS/month");
  assert.equal(localizeMoney("Kelishiladi", "ru"), null);
  assert.equal(localizeTerm("2 haftadan", "ru"), "от 2 недель");
  assert.equal(localizeTerm("1 haftadan", "ru"), "от 1 недели");
  assert.equal(localizeTerm("1,5 haftadan", "en"), "from 1.5 weeks");
  assert.equal(localizeTerm("3 ish kunigacha", "ru"), "до 3 рабочих дней");
  assert.equal(localizeTerm("3 ish kunigacha", "en"), "up to 3 business days");
  assert.equal(localizeTerm("3 oydan", "ru"), "от 3 месяцев");
  assert.equal(localizeTerm("Kelishiladi", "en"), null);
});

const service = {
  slug: "veb-sayt",
  name: "Sayt yaratish",
  short: "Qisqa",
  price: "1 200 000 so‘m",
  term: "2 haftadan",
  features: ["Bir", "Ikki"],
  i18n: {
    ru: { name: "Создание сайтов", short: "Коротко", features: ["Один", "Два"], $h: { name: textHash("Sayt yaratish"), short: textHash("Eski qisqa"), features: textHash(["Bir", "Ikki"]) } },
  },
  packages: [
    { name: "Start", price: "", features: ["A"], i18n: { ru: { name: "Старт", $h: { name: textHash("Start") } } } },
    { name: "Pro", price: "", features: ["B"], i18n: { ru: { name: "Про", $h: { name: textHash("Pro") } } } },
  ],
  examples: [{ name: "EVOS", owner: "", text: "", url: "https://evos.uz", image: "/media/public/a.webp", i18n: { en: { image: "/media/public/b.webp" } } }],
};

test("localize applies fresh translations, keeps Uzbek for missing or outdated ones and strips i18n", () => {
  const r = localize("services", service, "ru") as unknown as Record<string, unknown> & typeof service;
  assert.equal(r.name, "Создание сайтов");
  assert.equal(r.short, "Qisqa", "o'zbekchasi o'zgargan maydon tarjimasi ko'rsatilmaydi");
  assert.deepEqual(r.features, ["Один", "Два"]);
  assert.equal(r.price, "1 200 000 сум");
  assert.equal(r.term, "от 2 недель");
  assert.equal(r.packages[0].name, "Старт");
  assert.equal(r.examples[0].image, "/media/public/a.webp");
  assert.equal("i18n" in r, false);
  assert.equal("i18n" in r.packages[0], false);
  const e = localize("services", service, "en") as unknown as typeof service;
  assert.equal(e.name, "Sayt yaratish");
  assert.equal(e.examples[0].image, "/media/public/b.webp");
  assert.equal(localize("services", service, "uz").name, "Sayt yaratish");
});

test("saving the Uzbek editor keeps translations attached to their items, even after reordering", () => {
  const next = {
    ...service,
    i18n: undefined,
    packages: [
      { name: "Pro", price: "", features: ["B"] },
      { name: "Start", price: "", features: ["A"] },
      { name: "Yangi", price: "", features: [] },
    ],
  };
  delete (next as Record<string, unknown>).i18n;
  const carried = carryTranslations("services", next, service) as unknown as typeof service;
  assert.equal(carried.i18n.ru.name, "Создание сайтов");
  assert.equal(carried.packages[0].i18n.ru.name, "Про");
  assert.equal(carried.packages[1].i18n.ru.name, "Старт");
  assert.equal((carried.packages[2] as { i18n?: unknown }).i18n, undefined);
});

test("translation tree is validated before it is grafted onto a record", () => {
  const tree = i18nTree("services", service);
  const same = graftI18n("services", service, tree);
  assert.deepEqual(localize("services", same, "ru"), localize("services", service, "ru"));
  assert.throws(() => graftI18n("services", service, { i18n: { ru: { slug: "x" } } }), /tarjima qilinmaydi/);
  assert.throws(() => graftI18n("services", service, { i18n: { de: { name: "x" } } }), /tili yo/);
  assert.throws(() => graftI18n("services", service, { packages: [{}] }), /elementlar soni/);
  assert.throws(() => graftI18n("services", service, { i18n: { en: { image: "https://evil.example/x.png" } } }), /tarjima qilinmaydi/);
  assert.throws(() => graftI18n("services", service, { examples: [{ i18n: { en: { image: "javascript:alert(1)" } } }] }), /rasm/);
  const slots = textSlots("services", service);
  assert.ok(slots.some((s) => s.field === "name" && s.at.length === 0));
  assert.ok(!slots.some((s) => s.field === "price"), "o'giriladigan narx qo'lda tarjima qilinmaydi");
});

test("Gemini answer must be a list of the same length", () => {
  const ok = { candidates: [{ content: { parts: [{ text: '["Один","Два"]' }] } }] };
  assert.deepEqual(parseTranslation(ok, 2), ["Один", "Два"]);
  assert.equal(parseTranslation(ok, 3), null);
  assert.equal(parseTranslation({ candidates: [{ content: { parts: [{ text: "salom" }] } }] }, 1), null);
});

test("translations migration applies after all previous migrations and keeps Uzbek data untouched", () => {
  const dir = new URL("../db/migrations/", import.meta.url);
  const db = new DatabaseSync(":memory:");
  const files = readdirSync(dir).filter((f: string) => f.endsWith(".sql")).sort();
  for (const file of files.filter((f: string) => f < "0017")) db.exec(readFileSync(new URL(file, dir), "utf8"));
  const before = db.prepare("SELECT slug,data FROM services ORDER BY slug").all() as Array<{ slug: string; data: string }>;
  for (const file of files.filter((f: string) => f >= "0017")) db.exec(readFileSync(new URL(file, dir), "utf8"));
  const after = db.prepare("SELECT slug,data FROM services ORDER BY slug").all() as Array<{ slug: string; data: string }>;
  const strip = (v: unknown): unknown =>
    Array.isArray(v) ? v.map(strip) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).filter(([k]) => k !== "i18n").map(([k, x]) => [k, strip(x)])) : v;
  for (const [i, row] of after.entries()) assert.deepEqual(strip(JSON.parse(row.data)), strip(JSON.parse(before[i].data)), row.slug);
  assert.ok(after.some((r) => JSON.parse(r.data).i18n), "tarjimalar yozilmadi");
  const labels = JSON.parse((db.prepare("SELECT data FROM settings WHERE key='categories_i18n'").get() as { data: string }).data);
  assert.equal(labels.ru.Dasturlar, "Программы");
  const columns = db.prepare("PRAGMA table_info(orders)").all() as Array<{ name: string }>;
  assert.ok(columns.some((c) => c.name === "lang"));
});

const source: ContentSource = {
  async list(table) {
    return table === "services" ? [{ ...localize("services", service, "ru"), updated_at: "2026-11-27 10:00:00" }] : [];
  },
  async get(table, slug) {
    return table === "services" && slug === "veb-sayt" ? { ...localize("services", service, "ru"), updated_at: "2026-11-27 10:00:00" } : null;
  },
};
const INDEX = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("Russian pages: html lang, hreflang alternates, canonical and links carry the prefix", async () => {
  const page = await buildPage("/services/veb-sayt", source, "https://alifbit.org", "ru");
  const html = renderHtml(INDEX, page, "https://alifbit.org");
  assert.match(html, /<html lang="ru">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/alifbit.org\/ru\/services\/veb-sayt"\/>/);
  assert.match(html, /hreflang="uz" href="https:\/\/alifbit.org\/services\/veb-sayt"/);
  assert.match(html, /hreflang="en" href="https:\/\/alifbit.org\/en\/services\/veb-sayt"/);
  assert.match(html, /hreflang="x-default" href="https:\/\/alifbit.org\/services\/veb-sayt"/);
  assert.match(html, /<meta property="og:locale" content="ru_RU"\/>/);
  assert.match(html, /<title>Создание сайтов — AlifBit<\/title>/);
  assert.match(html, /href="\/ru\/contact\?service=veb-sayt">Заказать</);
  assert.match(html, /"inLanguage":"ru"/);
  const home = renderHtml(INDEX, await buildPage("/", source, "https://alifbit.org", "en"), "https://alifbit.org");
  assert.match(home, /<html lang="en">/);
  assert.match(home, /<a href="\/en\/services">Services<\/a>/);
  const missing = await buildPage("/yoq", source, "https://alifbit.org", "ru");
  assert.equal(missing.status, 404);
  assert.doesNotMatch(renderHtml(INDEX, missing, "https://alifbit.org"), /hreflang/);
});

test("sitemap lists every page in all three languages", async () => {
  const xml = await buildSitemap(source, "https://alifbit.org");
  for (const loc of ["/", "/ru", "/en", "/services/veb-sayt", "/ru/services/veb-sayt", "/en/services/veb-sayt", "/office/"])
    assert.match(xml, new RegExp(`<loc>https://alifbit.org${loc.replace(/\//g, "\\/")}</loc>`), loc);
});
