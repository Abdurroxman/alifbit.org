import type { CSSProperties } from "react";

/** Xizmat belgilari: har biri base.css da o'z `--svc-*` rangiga ega. */
export const SERVICE_ICONS = ["web", "design", "telegram", "app", "ai", "integration", "seo", "support"] as const;
export type ServiceIcon = (typeof SERVICE_ICONS)[number];

export function isServiceIcon(icon: string | undefined | null): icon is ServiceIcon {
  return !!icon && (SERVICE_ICONS as readonly string[]).includes(icon);
}

/** Element va uning ichidagilar uchun `--accent` — shu xizmat rangi. */
export function accentStyle(icon: string | undefined | null, extra?: CSSProperties): CSSProperties | undefined {
  if (!isServiceIcon(icon)) return extra;
  return { ...extra, "--accent": `var(--svc-${icon})` } as CSSProperties;
}

/**
 * Fondagi nuqtalar to'ri qaysi xizmat rangida yonishi.
 * Sahifalar (masalan, bosh sahifadagi tanlov) yozadi, fon qatlami o'qiydi.
 */
let netAccent: ServiceIcon | null = null;
const listeners = new Set<() => void>();

export function setNetworkAccent(icon: string | null) {
  const next = isServiceIcon(icon) ? icon : null;
  if (next === netAccent) return;
  netAccent = next;
  listeners.forEach((l) => l());
}

export function getNetworkAccent() {
  return netAccent;
}

export function onNetworkAccent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
