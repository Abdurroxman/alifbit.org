import { useEffect } from "react";

export type IntroMode = "full" | "short" | "none";
export const INTRO_KEY = "alifbit-intro-v3";
const isBrowser = typeof window !== "undefined";

let introMode: IntroMode = "none";

export function prefersReducedMotion() {
  return isBrowser && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Birinchi chizishdan oldin, main.tsx dan bir marta chaqiriladi. */
export function bootMotion() {
  const html = document.documentElement;
  html.classList.add("js");
  const path = location.pathname;
  if (prefersReducedMotion() || path.startsWith("/admin")) {
    introMode = "none";
    return;
  }
  html.classList.add("motion");
  const forced = new URLSearchParams(location.search).get("intro") === "1";
  let seen = false;
  try {
    seen = storage()?.getItem(INTRO_KEY) === "1";
  } catch {
    seen = false;
  }
  introMode = forced || (path === "/" && !seen) ? "full" : "short";
  html.classList.add("intro-running", `intro-${introMode}`);
}

export function getIntroMode(): IntroMode {
  return introMode;
}

/** Kirish tugadi: belgi faqat to'liq variant oxirigacha borganda yoziladi. */
export function finishIntro(completedFull: boolean) {
  const html = document.documentElement;
  html.classList.remove("intro-running", "intro-full", "intro-short");
  html.classList.add("intro-done");
  introMode = "none";
  if (completedFull) {
    try {
      storage()?.setItem(INTRO_KEY, "1");
    } catch {
      /* xususiy rejimda saqlash yopiq bo'lishi mumkin */
    }
  }
  window.dispatchEvent(new Event(INTRO_DONE));
}

export const INTRO_DONE = "alifbit:intro-done";

/** Kirish animatsiyasi tugashini kutadi (u bo'lmasa — darhol). */
export function afterIntro(): Promise<void> {
  if (!isBrowser || !document.documentElement.classList.contains("intro-running")) return Promise.resolve();
  return new Promise((resolve) => window.addEventListener(INTRO_DONE, () => resolve(), { once: true }));
}

/**
 * Sahifadagi [data-reveal] va [data-magnetic] elementlarini jonlantiradi.
 * Yangi elementlar (API dan kelgan kartalar) MutationObserver orqali qo'shiladi.
 */
export function usePageEnhancements(rootId: string, routeKey: string) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const motion = document.documentElement.classList.contains("motion");
    const revealAll = () =>
      root
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.classList.add("is-in"));
    if (!motion || !("IntersectionObserver" in window)) {
      revealAll();
      const mo = new MutationObserver(revealAll);
      mo.observe(root, { childList: true, subtree: true });
      return () => mo.disconnect();
    }
    const pending = new Set<Element>();
    const show = (el: Element) => {
      el.classList.add("is-in");
      pending.delete(el);
      io.unobserve(el);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) show(entry.target);
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );
    // Tez sakrab o'tilgan (ekran ustida qolgan) elementlar ham ochiladi.
    let passFrame = 0;
    const revealPassed = () => {
      passFrame = 0;
      for (const el of pending) if (el.getBoundingClientRect().bottom < 0) show(el);
    };
    const onScroll = () => {
      if (!passFrame && pending.size) passFrame = requestAnimationFrame(revealPassed);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const magnets = new WeakSet<Element>();
    const attachMagnet = (el: HTMLElement) => {
      if (magnets.has(el)) return;
      magnets.add(el);
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate3d(${x * 10}px, ${y * 8}px, 0)`;
      };
      const leave = () => (el.style.transform = "");
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
    };
    // Kartalar sichqoncha ostida hajmli egiladi; yaltirash nuqtasi kursorga ergashadi.
    const tilts = new WeakSet<Element>();
    const attachTilt = (el: HTMLElement) => {
      if (tilts.has(el)) return;
      tilts.add(el);
      let timer = 0;
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        clearTimeout(timer);
        el.classList.add("is-tilting");
        el.style.transition = "";
        el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - 0.5) * 9).toFixed(2)}deg)`;
        el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      };
      const leave = () => {
        el.classList.remove("is-tilting");
        el.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.transform = "";
        timer = window.setTimeout(() => (el.style.transition = ""), 650);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
    };
    const scan = () => {
      root
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)")
        .forEach((el) => {
          if (pending.has(el)) return;
          pending.add(el);
          io.observe(el);
        });
      if (finePointer) {
        document
          .querySelectorAll<HTMLElement>("[data-magnetic]")
          .forEach(attachMagnet);
        root.querySelectorAll<HTMLElement>("[data-tilt]").forEach(attachTilt);
      }
    };
    scan();
    let queued = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(scan);
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(queued);
      cancelAnimationFrame(passFrame);
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
      io.disconnect();
    };
  }, [rootId, routeKey]);
}
