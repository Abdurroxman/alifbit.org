// Admin paneldagi «Tarjima qilish» tugmasi: o'zbekcha matnlarni Gemini orqali ruscha yoki inglizchaga o'giradi.
// Natija darhol saqlanmaydi — admin maydonlarda ko'rib, keyin o'zi saqlaydi.
import type { TranslatedLang } from "../shared/i18n.ts";

export interface TranslateEnv {
  /** Gemini kaliti (wrangler secret). Bo'lmasa tugma o'chiq turadi. */
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  /** Faqat lokal sinovda: soxta Gemini serveri manzili. */
  GEMINI_BASE?: string;
}

export const TRANSLATE_LIMITS = { items: 200, chars: 60000 };
const DEFAULT_MODEL = "gemini-3.8-flash";
const LANGUAGE: Record<TranslatedLang, string> = { ru: "Russian", en: "English" };

export function translatePrompt(lang: TranslatedLang) {
  const target = LANGUAGE[lang];
  return [
    `You translate website content of AlifBit — a small studio in Uzbekistan that builds websites, Telegram bots, AI assistants and apps — from Uzbek into ${target}.`,
    "The input is a JSON array of strings. Return a JSON array of the same length and order, each item the translation of the item at the same position.",
    "Rules:",
    "- Keep the meaning exact: do not add, drop or soften information, promises, numbers or conditions.",
    lang === "ru"
      ? "- Write natural, friendly business Russian; address the reader as «вы» (lowercase)."
      : "- Write natural, friendly business English in a clear, plain style.",
    "- Keep brand, product and company names as they are (AlifBit, Sado, DALOLAT, Payme, Click, Uzum, Telegram, Instagram, amoCRM, Bitrix24, 1C, Eskiz, etc.).",
    `- Currency «so‘m» becomes ${lang === "ru" ? "«сум»" : "«UZS»"}; keep digits and their grouping as in the source.`,
    "- Keep emoji, line breaks (\\n), punctuation marks like «», ·, —, № and placeholders in curly braces unchanged in place.",
    "- Personal names in examples (Dilshod, Madina, Nilufar…) are transliterated, not translated.",
    "- Output only the JSON array.",
  ].join("\n");
}

/** Gemini javobini o'qiydi: kirish bilan bir xil uzunlikdagi matnlar ro'yxati bo'lmasa — null. */
export function parseTranslation(json: unknown, count: number): string[] | null {
  const parts = (json as { candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }> })
    ?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const text = parts
    .filter((p) => typeof p.text === "string" && !p.thought)
    .map((p) => p.text)
    .join("")
    .trim()
    .replace(/^```(?:json)?\s*|\s*```$/g, "");
  try {
    const value = JSON.parse(text);
    if (!Array.isArray(value) || value.length !== count || value.some((v) => typeof v !== "string")) return null;
    return value as string[];
  } catch {
    return null;
  }
}

export async function geminiTranslate(env: TranslateEnv, lang: TranslatedLang, texts: string[]): Promise<string[] | null> {
  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const response = await fetch(
    `${env.GEMINI_BASE || "https://generativelanguage.googleapis.com"}/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY || "" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: translatePrompt(lang) }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(texts) }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 32768,
          responseMimeType: "application/json",
          responseSchema: { type: "ARRAY", items: { type: "STRING" } },
        },
      }),
    },
  );
  if (!response.ok) {
    console.error("Gemini translate failed", response.status);
    return null;
  }
  return parseTranslation(await response.json().catch(() => null), texts.length);
}
