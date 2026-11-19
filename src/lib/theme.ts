import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

/** index.html dagi boshlang'ich skript ham shu kalitni o'qiydi. */
export const THEME_KEY = "alifbit-theme";
const DEFAULT_THEME: Theme = "dark";
const BAR_COLOR: Record<Theme, string> = { dark: "#0B0D0C", light: "#F9F8F5" };

const listeners = new Set<() => void>();

function stored(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function apply(theme: Theme) {
  const html = document.documentElement;
  if (html.dataset.theme !== theme) html.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BAR_COLOR[theme]);
  listeners.forEach((l) => l());
}

export function currentTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Ochiq sayt mehmon tanlagan mavzuda ko'rinadi. */
export function applyStoredTheme() {
  apply(stored());
}

/** Boshqaruv panelining mavzusi saytnikidan alohida saqlanadi; standart — yorug'. */
export const ADMIN_THEME_KEY = "alifbit-admin-theme";

function storedAdmin(): Theme {
  try {
    return localStorage.getItem(ADMIN_THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyAdminTheme() {
  apply(storedAdmin());
}

export function setAdminTheme(theme: Theme) {
  try {
    localStorage.setItem(ADMIN_THEME_KEY, theme);
  } catch {
    /* saqlab bo'lmasa ham mavzu shu sahifada almashadi */
  }
  apply(theme);
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* saqlab bo'lmasa ham mavzu shu sahifada almashadi */
  }
  apply(theme);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => DEFAULT_THEME);
}
