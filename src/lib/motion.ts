import { useEffect } from "react";

const isBrowser = typeof window !== "undefined";

export function prefersReducedMotion() {
  return isBrowser && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Birinchi chizishdan oldin, main.tsx dan bir marta chaqiriladi. */
export function bootMotion() {
  const html = document.documentElement;
  html.classList.add("js");
  if (prefersReducedMotion() || location.pathname.startsWith("/admin")) return;
  html.classList.add("motion");
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
    const scan = () => {
      root
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)")
        .forEach((el) => {
          if (pending.has(el)) return;
          pending.add(el);
          io.observe(el);
        });
      if (finePointer)
        document
          .querySelectorAll<HTMLElement>("[data-magnetic]")
          .forEach(attachMagnet);
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
