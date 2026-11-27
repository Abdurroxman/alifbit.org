// Sayt tillari, til prefiksli manzillar va kontent tarjimasini qo'llash.
// O'zbekcha — asl matn: manzil prefikssiz (/services), ruscha va inglizcha — /ru/services, /en/services.
// Kontent (xizmat, loyiha, kurs, qayd) tarjimasi o'sha yozuvning o'zida turadi: har obyektning `i18n.ru` / `i18n.en`
// kalitida shu obyektning matn maydonlari. Ro'yxatdagi har element (paket, misol, demo qadami) o'z tarjimasini
// o'zi olib yuradi — admin tartibni o'zgartirsa ham tarjima o'z elementidan ajralmaydi.

import ru from "./messages/ru.ts";
import en from "./messages/en.ts";

export const LANGS = ["uz", "ru", "en"] as const;
export type Lang = (typeof LANGS)[number];
/** Tarjima qilinadigan tillar. */
export const TRANSLATED = ["ru", "en"] as const;
export type TranslatedLang = (typeof TRANSLATED)[number];
export const DEFAULT_LANG: Lang = "uz";

export const isLang = (value: unknown): value is Lang => (LANGS as readonly unknown[]).includes(value);
export const langParam = (value: string | null | undefined): Lang => (isLang(value) ? value : DEFAULT_LANG);

export const HTML_LANG: Record<Lang, string> = { uz: "uz", ru: "ru", en: "en" };
export const OG_LOCALE: Record<Lang, string> = { uz: "uz_UZ", ru: "ru_RU", en: "en_US" };
export const LANG_SHORT: Record<Lang, string> = { uz: "UZ", ru: "RU", en: "EN" };
export const LANG_NAME: Record<Lang, string> = { uz: "O‘zbekcha", ru: "Русский", en: "English" };
/** Admin panel va xabarnomalarda murojaat tili (o'zbekcha). */
export const LANG_LABEL_UZ: Record<Lang, string> = { uz: "o‘zbek tili", ru: "rus tili", en: "ingliz tili" };
/** Mehmon oxirgi ochgan sayt tili: virtual ofis shu kalitni o'qiydi. */
export const LANG_KEY = "alifbit-lang";

/** «/ru/services/seo» → { lang: "ru", path: "/services/seo" }. Prefikssiz manzil — o'zbekcha. */
export function splitLangPath(pathname: string): { lang: Lang; path: string } {
  const match = /^\/(ru|en)(?=\/|$)/.exec(pathname);
  if (!match) return { lang: DEFAULT_LANG, path: pathname || "/" };
  return { lang: match[1] as Lang, path: pathname.slice(match[0].length) || "/" };
}

/** Sahifaning shu tildagi manzili: localePath("ru", "/services") → «/ru/services», bosh sahifa — «/ru». */
export function localePath(lang: Lang, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LANG) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/** Lug'at: kalit — o'zbekcha matnning o'zi, qiymat — tarjimasi. Ko'plik shakllari «|» bilan ajratiladi. */
export type Dictionary = Readonly<Record<string, string>>;
const dictionaries: Record<TranslatedLang, Dictionary> = { ru, en };

type Params = Readonly<Record<string, string | number>>;
const fill = (text: string, params?: Params) =>
  params ? text.replace(/\{(\w+)\}/g, (all, key: string) => (key in params ? String(params[key]) : all)) : text;

/** O'zbekcha matnning shu tildagi tarjimasi; tarjima bo'lmasa — o'zbekchasi. `{n}` kabi joylar params'dan to'ldiriladi. */
export function translate(lang: Lang, text: string, params?: Params) {
  const found = lang === "uz" ? undefined : dictionaries[lang][text];
  return fill(found ? found.split("|")[0] : text, params);
}

/** Songa qarab shakl: rus tilida 3 shakl (1, 2–4, 5+), ingliz tilida 2 (1, ko'p), o'zbekchada bitta. */
export function translatePlural(lang: Lang, count: number, text: string, params?: Params) {
  const found = lang === "uz" ? undefined : dictionaries[lang][text];
  const forms = (found || text).split("|");
  let index = 0;
  if (lang === "ru") {
    const n10 = count % 10;
    const n100 = count % 100;
    index = n10 === 1 && n100 !== 11 ? 0 : n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14) ? 1 : 2;
  } else if (lang === "en") index = count === 1 ? 0 : 1;
  return fill(forms[Math.min(index, forms.length - 1)], { n: count, ...params });
}

/** Matnni lug'atga belgilaydi (o'zi o'zgarmaydi): ishlatiladigan joyda translate() bilan o'giriladi. */
export const mk = <T extends string>(text: T): T => text;

/**
 * Matnning qisqa xeshi (FNV-1a). Tarjima saqlanganda asl o'zbekcha maydon xeshi `$h` ga yoziladi:
 * keyin o'zbekcha matn o'zgarsa, eski tarjima saytda ko'rsatilmaydi va admin panelda «eskirgan» bo'lib chiqadi.
 */
export function textHash(value: unknown): string {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** Obyektdagi tarjima qilinadigan maydonlar va ichki obyektlar/ro'yxatlar. */
export type Shape = {
  /** Matn yoki matnlar ro'yxati. */
  fields: readonly string[];
  /** Har tilga alohida rasm (xesh tekshirilmaydi). */
  media?: readonly string[];
  children?: Readonly<Record<string, Shape>>;
  lists?: Readonly<Record<string, Shape>>;
};

const STEP: Shape = { fields: ["title", "text"] };
const CARD: Shape = { fields: ["title", "lines"] };
const NODE: Shape = {
  fields: ["messages"],
  children: { card: CARD, owner: CARD },
  lists: { buttons: { fields: ["label"] } },
};
export const SHAPES = {
  services: {
    fields: ["name", "short", "description", "features", "price", "term"],
    lists: {
      packages: { fields: ["name", "price", "term", "features", "fit"] },
      examples: { fields: ["name", "owner", "text"], media: ["image", "imageMobile"] },
    },
  },
  projects: {
    fields: [
      "name",
      "summary",
      "description",
      "purpose",
      "features",
      "platforms",
      "seoTitle",
      "seoDescription",
      "problem",
      "customerView",
      "ownerView",
      "fit",
    ],
    lists: { steps: STEP, beforeAfter: { fields: ["before", "after"] }, faq: { fields: ["q", "a"] } },
    children: { demo: { fields: ["bot"], lists: { nodes: NODE } } },
  },
  courses: {
    fields: ["title", "tagline", "description", "price", "format", "start", "contents", "need", "seoTitle", "seoDescription"],
    lists: { steps: STEP },
  },
  articles: { fields: ["title", "summary", "body", "category", "seoTitle", "seoDescription"] },
} as const satisfies Record<string, Shape>;
export type ContentKind = keyof typeof SHAPES;

type Dict = Record<string, unknown>;
type Overlay = Record<string, unknown> & { $h?: Record<string, string> };

const APOSTROPHE = "[‘'ʻ’`]";
const MONEY = new RegExp(`^(\\d[\\d\\s ]*(?:[.,]\\d+)?)\\s*so${APOSTROPHE}m(\\/oy)?$`, "u");

/** «1 200 000 so‘m» → «1 200 000 сум» / «1 200 000 UZS»; «… so‘m/oy» → «/мес» / «/month». Boshqa ko'rinish — null. */
export function localizeMoney(value: string, lang: Lang): string | null {
  if (lang === DEFAULT_LANG || !value) return value;
  const match = MONEY.exec(value.trim());
  if (!match) return null;
  const amount = match[1].trim();
  if (lang === "ru") return `${amount} сум${match[2] ? "/мес" : ""}`;
  return `${amount} UZS${match[2] ? "/month" : ""}`;
}

type Unit = "week" | "month" | "day" | "workday" | "hour";
const UNIT: Array<[RegExp, Unit]> = [
  [/^ish kuni(dan|gacha)$/, "workday"],
  [/^hafta(dan|gacha)$/, "week"],
  [/^oy(dan|gacha)$/, "month"],
  [/^kun(dan|gacha)$/, "day"],
  [/^soat(dan|gacha)$/, "hour"],
];
// Rus tilida «от N …» va «до N …» dan keyin qaratqich kelishigi: 1 (11 emas) va kasr — birlik, qolgani — ko'plik.
const RU_UNIT: Record<Unit, [string, string]> = {
  week: ["недели", "недель"],
  month: ["месяца", "месяцев"],
  day: ["дня", "дней"],
  workday: ["рабочего дня", "рабочих дней"],
  hour: ["часа", "часов"],
};
const EN_UNIT: Record<Unit, [string, string]> = {
  week: ["week", "weeks"],
  month: ["month", "months"],
  day: ["day", "days"],
  workday: ["business day", "business days"],
  hour: ["hour", "hours"],
};

/** «2 haftadan» → «от 2 недель» / «from 2 weeks», «3 ish kunigacha» → «до 3 рабочих дней» / «up to 3 business days». */
export function localizeTerm(value: string, lang: Lang): string | null {
  if (lang === DEFAULT_LANG || !value) return value;
  const match = /^(\d+(?:[.,]\d+)?)\s+(.+)$/u.exec(value.trim());
  if (!match) return null;
  const [, number, rest] = match;
  const unit = UNIT.find(([re]) => re.test(rest));
  if (!unit) return null;
  const from = unit[0].exec(rest)![1] === "dan";
  const fractional = /[.,]/.test(number);
  const n = Number(number.replace(",", "."));
  if (lang === "ru") {
    const singular = fractional || (n % 10 === 1 && n % 100 !== 11);
    return `${from ? "от" : "до"} ${number.replace(".", ",")} ${RU_UNIT[unit[1]][singular ? 0 : 1]}`;
  }
  const plural = fractional || n !== 1;
  return `${from ? "from" : "up to"} ${number.replace(",", ".")} ${EN_UNIT[unit[1]][plural ? 1 : 0]}`;
}

const AUTO: Record<string, (value: string, lang: Lang) => string | null> = {
  price: localizeMoney,
  term: localizeTerm,
};

/** Tarjima maydoni hali to'g'rimi: asl matn tarjima qilingandan beri o'zgarmagan. Xesh yo'q bo'lsa — to'g'ri deb olinadi. */
export function isFresh(overlay: Overlay, field: string, source: unknown) {
  const h = overlay.$h?.[field];
  return h === undefined || h === textHash(source);
}

const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;

function applyShape<T>(value: T, shape: Shape, lang: Lang): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const source = value as Dict;
  const out: Dict = { ...source };
  delete out.i18n;
  const overlay = lang === DEFAULT_LANG ? undefined : ((source.i18n as Dict | undefined)?.[lang] as Overlay | undefined);
  for (const field of shape.fields) {
    const original = source[field];
    const auto = AUTO[field];
    if (auto && typeof original === "string") {
      const converted = auto(original, lang);
      if (converted !== null) {
        out[field] = converted;
        continue;
      }
    }
    if (!overlay || original === undefined || !isFresh(overlay, field, original)) continue;
    const tr = overlay[field];
    if (typeof original === "string" && filled(tr)) out[field] = tr;
    else if (Array.isArray(original) && Array.isArray(tr))
      out[field] = original.map((item, i) => (typeof item === "string" && filled(tr[i]) ? tr[i] : item));
  }
  if (overlay)
    for (const field of shape.media ?? []) if (filled(overlay[field])) out[field] = overlay[field];
  for (const [key, child] of Object.entries(shape.children ?? {}))
    if (source[key]) out[key] = applyShape(source[key], child, lang);
  for (const [key, item] of Object.entries(shape.lists ?? {}))
    if (Array.isArray(source[key])) out[key] = (source[key] as unknown[]).map((x) => applyShape(x, item, lang));
  return out as T;
}

/** Kontent yozuvining shu tildagi ko'rinishi; `i18n` kalitlari olib tashlanadi. Tarjima yo'q joyda o'zbekcha qoladi. */
export function localize<T>(kind: ContentKind, value: T, lang: Lang): T {
  return applyShape(value, SHAPES[kind], lang);
}

/** Toifa nomlari tarjimasi (settings `categories_i18n`): { ru: { Dasturlar: "Программы" }, en: {...} }. */
export type CategoryLabels = Partial<Record<TranslatedLang, Record<string, string>>>;

/**
 * Ro'yxat elementini eski nusxadagi juftiga moslash kaliti: admin o'zbekcha tahrirni saqlaganda tarjima shu bo'yicha
 * o'z elementiga qaytadi (tartib o'zgargan bo'lsa ham). Topilmasa — o'sha o'rindagi element olinadi.
 */
const LIST_KEY: Record<string, string> = {
  packages: "name",
  examples: "url",
  steps: "title",
  beforeAfter: "before",
  faq: "q",
  nodes: "id",
  buttons: "label",
};

function carry(next: unknown, prev: unknown, shape: Shape): unknown {
  if (!next || typeof next !== "object" || Array.isArray(next)) return next;
  if (!prev || typeof prev !== "object" || Array.isArray(prev)) return next;
  const n = { ...(next as Dict) };
  const p = prev as Dict;
  if (n.i18n === undefined && p.i18n !== undefined) n.i18n = p.i18n;
  for (const [key, child] of Object.entries(shape.children ?? {})) if (n[key]) n[key] = carry(n[key], p[key], child);
  for (const [key, item] of Object.entries(shape.lists ?? {})) {
    if (!Array.isArray(n[key]) || !Array.isArray(p[key])) continue;
    const old = p[key] as Dict[];
    const field = LIST_KEY[key];
    const used = new Set<number>();
    const matched = (n[key] as Dict[]).map((x) => {
      const i = field ? old.findIndex((o, j) => !used.has(j) && o?.[field] === x?.[field]) : -1;
      if (i >= 0) used.add(i);
      return i;
    });
    n[key] = (n[key] as Dict[]).map((x, i) => {
      const j = matched[i] >= 0 ? matched[i] : !used.has(i) && i < old.length ? i : -1;
      if (j >= 0) used.add(j);
      return j >= 0 ? carry(x, old[j], item) : x;
    });
  }
  return n;
}

/**
 * O'zbekcha tahrir saqlanganda oldingi yozuvdagi tarjimalarni yangi yozuvga ko'chiradi. O'zbekcha matni o'zgargan
 * maydonning tarjimasi xesh tufayli o'z-o'zidan «eskirgan» bo'ladi va saytda ko'rsatilmaydi.
 */
export function carryTranslations<T>(kind: ContentKind, next: T, prev: unknown): T {
  return carry(next, prev, SHAPES[kind]) as T;
}

/** Tarjima daraxti: obyekt tuzilmasini takrorlaydi, lekin faqat `i18n` qismlarini saqlaydi. */
export type I18nTree = { i18n?: Partial<Record<TranslatedLang, Overlay>> } & { [key: string]: unknown };

function tree(value: unknown, shape: Shape): I18nTree {
  const out: I18nTree = {};
  if (!value || typeof value !== "object") return out;
  const v = value as Dict;
  if (v.i18n) out.i18n = v.i18n as I18nTree["i18n"];
  for (const [key, child] of Object.entries(shape.children ?? {})) if (v[key]) out[key] = tree(v[key], child);
  for (const [key, item] of Object.entries(shape.lists ?? {}))
    if (Array.isArray(v[key])) out[key] = (v[key] as unknown[]).map((x) => tree(x, item));
  return out;
}
export function i18nTree(kind: ContentKind, value: unknown): I18nTree {
  return tree(value, SHAPES[kind]);
}

const MAX_TEXT = 12000;
const MAX_ITEM = 1200;
const MAX_ITEMS = 40;

/** Bitta til ustamasi to'g'rimi: faqat shu obyektning matn/rasm maydonlari, `$h` — xeshlar. */
function validOverlay(overlay: unknown, shape: Shape): string | null {
  if (!overlay || typeof overlay !== "object" || Array.isArray(overlay)) return "tarjima obyekt bo‘lishi kerak";
  for (const [key, value] of Object.entries(overlay as Dict)) {
    if (key === "$h") {
      if (!value || typeof value !== "object" || Object.values(value).some((h) => typeof h !== "string" || h.length > 16))
        return "xesh noto‘g‘ri";
      continue;
    }
    if (shape.media?.includes(key)) {
      if (typeof value !== "string" || (value && !/^\/media\/public\/[a-f0-9-]+\.(png|jpg|webp)$/.test(value)))
        return `«${key}» rasm manzili noto‘g‘ri`;
      continue;
    }
    if (!shape.fields.includes(key)) return `«${key}» tarjima qilinmaydi`;
    if (typeof value === "string") {
      if (value.length > MAX_TEXT) return `«${key}» juda uzun`;
    } else if (Array.isArray(value)) {
      if (value.length > MAX_ITEMS || value.some((x) => typeof x !== "string" || x.length > MAX_ITEM)) return `«${key}» ro‘yxati noto‘g‘ri`;
    } else return `«${key}» matn bo‘lishi kerak`;
  }
  return null;
}

function graft(target: unknown, t: unknown, shape: Shape, path: string): unknown {
  if (!t || typeof t !== "object" || Array.isArray(t)) throw new Error(`${path}: tarjima tuzilmasi noto‘g‘ri`);
  if (!target || typeof target !== "object") throw new Error(`${path}: yozuvda bu qism yo‘q`);
  const out = { ...(target as Dict) };
  const tr = t as Dict;
  const allowed = new Set(["i18n", ...Object.keys(shape.children ?? {}), ...Object.keys(shape.lists ?? {})]);
  for (const key of Object.keys(tr)) if (!allowed.has(key)) throw new Error(`${path}: «${key}» kutilmagan`);
  delete out.i18n;
  if (tr.i18n !== undefined) {
    if (!tr.i18n || typeof tr.i18n !== "object") throw new Error(`${path}: i18n noto‘g‘ri`);
    const clean: Dict = {};
    for (const [lang, overlay] of Object.entries(tr.i18n as Dict)) {
      if (!(TRANSLATED as readonly string[]).includes(lang)) throw new Error(`${path}: «${lang}» tili yo‘q`);
      const problem = validOverlay(overlay, shape);
      if (problem) throw new Error(`${path}.${lang}: ${problem}`);
      if (Object.keys(overlay as Dict).some((k) => k !== "$h")) clean[lang] = overlay;
    }
    if (Object.keys(clean).length) out.i18n = clean;
  }
  for (const [key, child] of Object.entries(shape.children ?? {}))
    if (tr[key] !== undefined && out[key]) out[key] = graft(out[key], tr[key], child, `${path}.${key}`);
  for (const [key, item] of Object.entries(shape.lists ?? {})) {
    if (tr[key] === undefined) continue;
    const list = out[key];
    if (!Array.isArray(tr[key]) || !Array.isArray(list) || (tr[key] as unknown[]).length !== list.length)
      throw new Error(`${path}.${key}: elementlar soni yozuvdagidan farq qiladi`);
    out[key] = list.map((x, i) => graft(x, (tr[key] as unknown[])[i], item, `${path}.${key}[${i}]`));
  }
  return out;
}

/** Admin tarjima bo'limidan kelgan daraxtni yozuvga qo'yadi; tuzilma mos kelmasa — xato (xabari o'zbekcha). */
export function graftI18n<T>(kind: ContentKind, value: T, t: unknown): T {
  return graft(value, t, SHAPES[kind], kind) as T;
}

/** Tarjima qilinadigan matn maydonlari ro'yxati (admin tarjima bo'limi va avtomatik tarjima uchun). */
export type TextSlot = {
  /** Obyektga yo'l: [] — yozuvning o'zi, ["packages", 0], ["demo", "nodes", 2, "card"]. */
  at: Array<string | number>;
  field: string;
  /** O'zbekcha matn yoki matnlar ro'yxati. */
  source: string | string[];
  media?: boolean;
};
function slots(value: unknown, shape: Shape, at: Array<string | number>, out: TextSlot[]) {
  if (!value || typeof value !== "object") return;
  const v = value as Dict;
  for (const field of shape.fields) {
    const s = v[field];
    if (field === "price" || field === "term") {
      // Narx va muddat avtomatik o'giriladi; faqat o'girib bo'lmaydigan yozuvlar qo'lda tarjima qilinadi.
      if (typeof s !== "string" || !s || AUTO[field](s, "ru") !== null) continue;
    }
    if ((typeof s === "string" && s.trim()) || (Array.isArray(s) && s.length && s.every((x) => typeof x === "string")))
      out.push({ at, field, source: s as string | string[] });
  }
  for (const field of shape.media ?? []) if (typeof v[field] === "string" && v[field]) out.push({ at, field, source: v[field] as string, media: true });
  for (const [key, child] of Object.entries(shape.children ?? {})) if (v[key]) slots(v[key], child, [...at, key], out);
  for (const [key, item] of Object.entries(shape.lists ?? {}))
    if (Array.isArray(v[key])) (v[key] as unknown[]).forEach((x, i) => slots(x, item, [...at, key, i], out));
}
export function textSlots(kind: ContentKind, value: unknown): TextSlot[] {
  const out: TextSlot[] = [];
  slots(value, SHAPES[kind], [], out);
  return out;
}
