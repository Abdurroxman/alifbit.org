import { useState, type KeyboardEvent } from "react";
import type { ServicePackage } from "../../shared/content";

/**
 * Paket tanlash (radio guruh): boshida tavsiya etilgan paket, u bo'lmasa birinchisi tanlangan.
 * Tanlov paket nomi bilan saqlanadi: xizmat almashsa yoki paket ro'yxati yangilansa,
 * mos kelmagan nom o'rniga yana standart paket olinadi.
 */
export function usePackageChoice(packages: ServicePackage[]) {
  const [name, setName] = useState<string | null>(null);
  const fallback = packages.find((p) => p.recommended) || packages[0];
  const selected = packages.find((p) => p.name === name) || fallback;

  /** Paket kartasiga beriladigan atributlar: sichqoncha, barmoq va klaviatura (strelkalar, Enter, Space). */
  const optionProps = (p: ServicePackage) => ({
    role: "radio" as const,
    "aria-checked": p === selected,
    tabIndex: p === selected ? 0 : -1,
    onClick: () => setName(p.name),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      const i = packages.indexOf(p);
      let to = -1;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") to = (i + 1) % packages.length;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") to = (i - 1 + packages.length) % packages.length;
      else if (e.key === " " || e.key === "Enter") to = i;
      if (to < 0) return;
      e.preventDefault();
      setName(packages[to].name);
      const options = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="radio"]');
      options?.[to]?.focus();
    },
  });

  return { selected, optionProps };
}
