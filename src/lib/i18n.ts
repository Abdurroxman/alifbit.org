import { LANGS, localePath, splitLangPath, translate, translatePlural, type Lang } from "../../shared/i18n";

export { mk } from "../../shared/i18n";

type Params = Readonly<Record<string, string | number>>;

/** Sahifa tili manzildan bir marta aniqlanadi: til almashtirilganda sahifa to'liq qayta yuklanadi. */
export const lang: Lang = typeof location === "undefined" ? "uz" : splitLangPath(location.pathname).lang;
/** React Router manzillari shu prefiks ostida: <Link to="/services"> ruscha sahifada «/ru/services» bo'ladi. */
export const basename = lang === "uz" ? undefined : `/${lang}`;

export const tr = (text: string, params?: Params) => translate(lang, text, params);
export const trn = (count: number, text: string, params?: Params) => translatePlural(lang, count, text, params);
/** Router'dan tashqaridagi oddiy <a href> uchun shu tildagi manzil. */
export const lp = (path: string) => localePath(lang, path);

/** Shu sahifaning boshqa tillardagi manzillari (til tugmasi uchun). */
export function langLinks(pathname: string, search = "") {
  return LANGS.map((l) => ({ lang: l, href: localePath(l, pathname) + search }));
}
