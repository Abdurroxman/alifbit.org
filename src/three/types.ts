// 3D sahna holati. Bu fayl three.js'ni import qilmaydi: asosiy bundle yengil qoladi.

/** Mehmon tanlagan yo'nalish: sahna shunga qarab qurilmalarni joylaydi va ekranni almashtiradi. */
export type StageFocus =
  | "idle"
  | "web"
  | "design"
  | "telegram"
  | "app"
  | "ai"
  | "integration"
  | "seo"
  | "support"
  | "course"
  | "unknown";

const SERVICE_FOCUS: readonly StageFocus[] = ["web", "design", "telegram", "app", "ai", "integration", "seo", "support"];

/** Sahifaning qaysi qismi ko'rinib turibdi. */
export type StageSection = "hero" | "works" | "hidden";

export type StageState = {
  section: StageSection;
  focus: StageFocus;
  /** Kirish suhbatining qadami: 1 — savol, 2 — aniqlovchi savol, 3 — natija. */
  step: 1 | 2 | 3;
  /** «Qilgan ishlarimiz»da ekranda turgan ish (loyiha id). */
  work: string | null;
};

export type StageHandle = {
  /** Canvas'ni berilgan blokka ulaydi va chizishni boshlaydi. */
  attach: (parent: HTMLElement) => void;
  /** Chizishni to'xtatadi va canvas'ni sahifadan oladi; WebGL konteksti saqlanadi. */
  detach: () => void;
  set: (state: StageState) => void;
  setDocked: (docked: boolean) => void;
};

/** Xizmat belgisi → sahna yo'nalishi. */
export function focusOfIcon(icon: string): StageFocus {
  return SERVICE_FOCUS.find((f) => f === icon) || "idle";
}
