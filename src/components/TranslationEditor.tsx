import { useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, LoaderCircle, Sparkles, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import {
  i18nTree,
  isFresh,
  LANG_NAME,
  textHash,
  textSlots,
  TRANSLATED,
  type ContentKind,
  type I18nTree,
  type TextSlot,
  type TranslatedLang,
} from "../../shared/i18n";

type Item = Record<string, unknown> & { updated_at?: string; id?: string; slug?: string };
type Value = string | string[];
type Draft = Record<TranslatedLang, Record<string, Value>>;

/** Maydon nomlari — o'zbekcha tahrir formasidagi bilan bir xil. */
const FIELD: Record<string, string> = {
  name: "Nomi",
  short: "Qisqa matn",
  description: "Tavsif",
  features: "Bandlar",
  summary: "Qisqa tavsif",
  purpose: "Maqsadi",
  platforms: "Platformalar",
  seoTitle: "SEO sarlavha",
  seoDescription: "SEO tavsif",
  problem: "Muammo",
  customerView: "Mijoz ko‘radi",
  ownerView: "Siz ko‘rasiz",
  fit: "Kimga mos",
  title: "Sarlavha",
  text: "Matn",
  tagline: "Qisqa jumla",
  format: "Format",
  start: "Boshlanishi",
  contents: "Kurs ichida",
  need: "«Sizga nima kerak?» javobi",
  body: "Maqola matni",
  category: "Kategoriya",
  price: "Narx",
  term: "Muddat",
  owner: "Kompaniya",
  before: "Oldin",
  after: "Keyin",
  q: "Savol",
  a: "Javob",
  bot: "Bot nomi",
  messages: "Bot xabarlari",
  lines: "Qatorlar",
  label: "Tugma",
  image: "Kompyuter ekrani rasmi",
  imageMobile: "Telefon ekrani rasmi",
};
const GROUP: Record<string, string> = {
  packages: "Paket",
  examples: "Misol",
  steps: "Qadam",
  beforeAfter: "Oldin va keyin",
  faq: "Savol-javob",
  demo: "Demo suhbat",
  nodes: "Demo qadami",
  card: "Karta",
  owner: "Egasiga xabar",
  buttons: "Tugma",
};
const LONG = new Set(["description", "purpose", "problem", "body", "a", "seoDescription", "text", "short", "summary", "tagline"]);

const slotKey = (s: TextSlot) => `${s.at.join(".")}|${s.field}`;
const groupKey = (s: TextSlot) => s.at.join(".");

function groupTitle(at: TextSlot["at"]) {
  if (!at.length) return "";
  const parts: string[] = [];
  for (let i = 0; i < at.length; i++) {
    const part = at[i];
    if (typeof part === "number") continue;
    const index = typeof at[i + 1] === "number" ? ` ${(at[i + 1] as number) + 1}` : "";
    parts.push(`${GROUP[part] || part}${index}`);
  }
  return parts.join(" · ");
}

/** Yozuvdagi `at` yo'li bo'yicha obyekt. */
function objectAt(root: unknown, at: TextSlot["at"]): Record<string, unknown> | undefined {
  let cur: unknown = root;
  for (const part of at) cur = (cur as Record<string | number, unknown> | undefined)?.[part];
  return cur && typeof cur === "object" ? (cur as Record<string, unknown>) : undefined;
}
type Overlay = Record<string, unknown> & { $h?: Record<string, string> };
const overlayAt = (item: Item, s: TextSlot, lang: TranslatedLang) =>
  (objectAt(item, s.at)?.i18n as Record<string, Overlay> | undefined)?.[lang];

function initialDraft(item: Item, slots: TextSlot[]): Draft {
  const draft: Draft = { ru: {}, en: {} };
  for (const lang of TRANSLATED)
    for (const s of slots) {
      const v = overlayAt(item, s, lang)?.[s.field];
      if (typeof v === "string" || Array.isArray(v)) draft[lang][slotKey(s)] = v as Value;
    }
  return draft;
}
const filled = (v: Value | undefined) => (Array.isArray(v) ? v.some((x) => x.trim()) : !!v && !!v.trim());

/** Maydon holati: tarjima yo'q, o'zbekchasi o'zgargan (eskirgan) yoki tayyor. */
function slotState(item: Item, s: TextSlot, lang: TranslatedLang, value: Value | undefined) {
  if (!filled(value)) return "empty";
  if (s.media) return "ok";
  const overlay = overlayAt(item, s, lang);
  const saved = overlay?.[s.field];
  // Saqlangandan beri qo'lda o'zgartirilgan maydon saqlanganda yangi xesh oladi.
  if (overlay && JSON.stringify(saved) === JSON.stringify(value) && !isFresh(overlay, s.field, s.source)) return "stale";
  return "ok";
}

/** Loyiha toifalari nomlarining ruscha va inglizcha ko'rinishi (bazada qiymat o'zbekcha qoladi). */
export function CategoryTranslations({ categories }: { categories: string[] }) {
  const [labels, setLabels] = useState<Record<TranslatedLang, Record<string, string>>>({ ru: {}, en: {} });
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    api<Partial<Record<TranslatedLang, Record<string, string>>>>("/api/admin/categories/i18n")
      .then((r) => setLabels({ ru: r.ru || {}, en: r.en || {} }))
      .catch((e) => setError((e as Error).message));
  }, []);
  async function save() {
    setBusy(true);
    setError("");
    setNote("");
    try {
      const pick = (l: TranslatedLang) =>
        Object.fromEntries(categories.map((c) => [c, (labels[l][c] || "").trim()]).filter(([, v]) => v));
      await api("/api/admin/categories/i18n", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ru: pick("ru"), en: pick("en") }),
      });
      setNote("Tarjimalar saqlandi.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ad-panel ad-form ad-tr">
      <h2>Tarjima</h2>
      <div className="ad-tr-cats">
        <span />
        {TRANSLATED.map((l) => (
          <b key={l}>{LANG_NAME[l]}</b>
        ))}
        {categories.map((c) => (
          <div className="ad-tr-cat" key={c}>
            <span>{c}</span>
            {TRANSLATED.map((l) => (
              <input
                key={l}
                className="input"
                aria-label={`${c} — ${LANG_NAME[l]}`}
                value={labels[l][c] || ""}
                maxLength={80}
                onChange={(e) => setLabels((x) => ({ ...x, [l]: { ...x[l], [c]: e.target.value } }))}
              />
            ))}
          </div>
        ))}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {note && <p className="ad-hint" role="status">{note}</p>}
      <div className="ad-tr-save">
        <button type="button" className="button" onClick={save} disabled={busy}>
          Tarjimalarni saqlash
          <span className="button-icon" aria-hidden="true">
            {busy ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}
          </span>
        </button>
      </div>
    </section>
  );
}

export default function TranslationEditor({
  kind,
  item,
  onSaved,
}: {
  kind: ContentKind;
  item: Item;
  onSaved: () => Promise<void>;
}) {
  const slots = useMemo(() => textSlots(kind, item), [kind, item]);
  const [lang, setLang] = useState<TranslatedLang>("ru");
  const [draft, setDraft] = useState<Draft>(() => initialDraft(item, slots));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [auto, setAuto] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(initialDraft(item, slots));
    setDirty(false);
  }, [item, slots]);
  useEffect(() => {
    api<{ configured: boolean }>("/api/admin/translate")
      .then((r) => setAuto(r.configured))
      .catch(() => setAuto(false));
  }, []);

  const counts = TRANSLATED.map((l) => {
    const texts = slots.filter((s) => !s.media);
    const states = texts.map((s) => slotState(item, s, l, draft[l][slotKey(s)]));
    return { lang: l, done: states.filter((x) => x === "ok").length, stale: states.filter((x) => x === "stale").length, all: texts.length };
  });

  function set(s: TextSlot, value: Value) {
    setDraft((d) => ({ ...d, [lang]: { ...d[lang], [slotKey(s)]: value } }));
    setDirty(true);
  }

  async function translateMissing() {
    const todo = slots.filter((s) => !s.media && slotState(item, s, lang, draft[lang][slotKey(s)]) !== "ok");
    if (!todo.length) {
      setNote("Barcha maydonlar tarjima qilingan.");
      return;
    }
    setBusy(true);
    setError("");
    setNote("");
    try {
      // Ro'yxatli maydonlar bittadan qatorga yoyiladi, javob shu tartibda qaytadi.
      const texts = todo.flatMap((s) => (Array.isArray(s.source) ? s.source : [s.source]));
      const result: string[] = [];
      for (let i = 0; i < texts.length; ) {
        const chunk: string[] = [];
        let size = 0;
        while (i < texts.length && chunk.length < 150 && size + texts[i].length < 40000) {
          size += texts[i].length;
          chunk.push(texts[i++]);
        }
        if (!chunk.length) chunk.push(texts[i++]);
        const r = await api<{ translations: string[] }>("/api/admin/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ lang, texts: chunk }),
        });
        result.push(...r.translations);
      }
      let pos = 0;
      setDraft((d) => {
        const next = { ...d[lang] };
        for (const s of todo) {
          if (Array.isArray(s.source)) {
            next[slotKey(s)] = result.slice(pos, pos + s.source.length);
            pos += s.source.length;
          } else next[slotKey(s)] = result[pos++];
        }
        return { ...d, [lang]: next };
      });
      setDirty(true);
      setNote(`${todo.length} ta maydon to‘ldirildi. Tekshirib, saqlang.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function upload(s: TextSlot, file: File) {
    setBusy(true);
    setError("");
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Rasm 5 MB dan kichik bo‘lsin.");
      const r = await api<{ url: string }>("/api/admin/upload", {
        method: "POST",
        headers: { "content-type": file.type },
        body: file,
      });
      set(s, r.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError("");
    setNote("");
    try {
      const tree = i18nTree(kind, item) as I18nTree;
      // Daraxtdagi barcha til ustamalarini draft bo'yicha qaytadan yig'amiz.
      const reset = (node: unknown) => {
        if (!node || typeof node !== "object") return;
        const n = node as Record<string, unknown>;
        delete n.i18n;
        for (const v of Object.values(n)) Array.isArray(v) ? v.forEach(reset) : reset(v);
      };
      reset(tree);
      for (const l of TRANSLATED)
        for (const s of slots) {
          const value = draft[l][slotKey(s)];
          if (!filled(value)) continue;
          const node = objectAt(tree, s.at) as Record<string, unknown>;
          const i18n = ((node.i18n ??= {}) as Record<string, Overlay>);
          const overlay = (i18n[l] ??= {});
          const clean = Array.isArray(value) ? value.map((x) => x.trim()) : (value as string).trim();
          overlay[s.field] = clean;
          if (s.media) continue;
          // Tarjima o'zgarmagan bo'lsa eski xesh qoladi (eskirgani ko'rinib turadi), aks holda — joriy o'zbekcha matn xeshi.
          const old = overlayAt(item, s, l);
          const unchanged = old && JSON.stringify(old[s.field]) === JSON.stringify(clean) && old.$h?.[s.field];
          (overlay.$h ??= {})[s.field] = unchanged ? old!.$h![s.field] : textHash(s.source);
        }
      const id = encodeURIComponent(String(kind === "services" ? item.slug : item.id));
      await api(`/api/admin/${kind}/${id}/i18n`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ updated_at: item.updated_at, tree }),
      });
      setDirty(false);
      setNote("Tarjimalar saqlandi.");
      await onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const groups: Array<[string, TextSlot[]]> = [];
  for (const s of slots) {
    const last = groups[groups.length - 1];
    if (last && last[0] === groupKey(s)) last[1].push(s);
    else groups.push([groupKey(s), [s]]);
  }

  return (
    <details className="ad-panel ad-form ad-fold ad-tr">
      <summary>
        <h2>Tarjima</h2>
        <small>
          {counts.map((c) => `${LANG_NAME[c.lang]}: ${c.done}/${c.all}${c.stale ? `, ${c.stale} ta eskirgan` : ""}`).join(" · ")}
        </small>
      </summary>
      <div className="ad-tr-bar">
        <div className="ad-tr-langs" role="tablist" aria-label="Til">
          {TRANSLATED.map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              className={lang === l ? "is-active" : ""}
              onClick={() => setLang(l)}
            >
              {LANG_NAME[l]}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="button button-outline button-small"
          onClick={translateMissing}
          disabled={busy || !auto}
          title={auto ? undefined : "Cloudflare’da GEMINI_API_KEY qo‘yilmagan"}
        >
          Tarjima qilish
          <span className="button-icon" aria-hidden="true">
            {busy ? <LoaderCircle className="spin" size={15} /> : <Sparkles size={15} />}
          </span>
        </button>
      </div>
      {groups.map(([key, list]) => (
        <fieldset className="ad-tr-group" key={key}>
          {list[0].at.length > 0 && <legend>{groupTitle(list[0].at)}</legend>}
          {list.map((s) => {
            const value = draft[lang][slotKey(s)];
            const state = slotState(item, s, lang, value);
            const label = FIELD[s.field] || s.field;
            if (s.media)
              return (
                <div className={`ad-tr-row is-${state}`} key={slotKey(s)}>
                  <span className="ad-tr-label">{label}</span>
                  <div className="ad-tr-media">
                    <img src={s.source as string} alt="" />
                    {typeof value === "string" && value ? <img src={value} alt="" /> : <span className="ad-hint">O‘zbekcha rasm ko‘rinadi</span>}
                    <label className="button button-outline button-small">
                      <ImagePlus size={15} aria-hidden="true" /> Rasm
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        hidden
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void upload(s, f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {typeof value === "string" && value && (
                      <button type="button" className="ad-icon-btn" aria-label="Rasmni olib tashlash" onClick={() => set(s, "")}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            return (
              <div className={`ad-tr-row is-${state}`} key={slotKey(s)}>
                <span className="ad-tr-label">
                  {label}
                  {state === "stale" && <em>O‘zbekcha matn o‘zgargan — tarjimani yangilang</em>}
                </span>
                {Array.isArray(s.source) ? (
                  <ol className="ad-tr-list">
                    {s.source.map((src, i) => (
                      <li key={i}>
                        <p className="ad-tr-src">{src}</p>
                        <input
                          className="input"
                          value={(Array.isArray(value) ? value[i] : "") || ""}
                          maxLength={1200}
                          onChange={(e) => {
                            const arr = Array.isArray(value) ? [...value] : [];
                            while (arr.length < (s.source as string[]).length) arr.push("");
                            arr[i] = e.target.value;
                            set(s, arr);
                          }}
                        />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <>
                    <p className="ad-tr-src">{s.source}</p>
                    {LONG.has(s.field) || (s.source as string).length > 120 ? (
                      <textarea
                        className="input"
                        rows={Math.min(8, Math.max(2, Math.ceil((s.source as string).length / 90)))}
                        value={typeof value === "string" ? value : ""}
                        maxLength={12000}
                        onChange={(e) => set(s, e.target.value)}
                      />
                    ) : (
                      <input
                        className="input"
                        value={typeof value === "string" ? value : ""}
                        maxLength={1200}
                        onChange={(e) => set(s, e.target.value)}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </fieldset>
      ))}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {note && <p className="ad-hint" role="status">{note}</p>}
      <div className="ad-tr-save">
        <button type="button" className="button" onClick={save} disabled={busy || !dirty}>
          Tarjimalarni saqlash
          <span className="button-icon" aria-hidden="true">
            {busy ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}
          </span>
        </button>
      </div>
    </details>
  );
}
