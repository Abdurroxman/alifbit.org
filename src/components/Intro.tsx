import { useEffect, useRef, useState, type CSSProperties } from "react";
import { finishIntro, getIntroMode, type IntroMode } from "../lib/motion";

const FLIGHT_AT = 1320;
const FLIGHT_MS = 520;

// Markazdan tarqaladigan nurlar (burchak, ichki va tashqi radius).
const RAYS = [0, 40, 90, 140, 180, 220, 270, 320].map((deg, i) => {
  const a = (deg * Math.PI) / 180;
  const r1 = 14;
  const r2 = i % 2 ? 78 : 98;
  return {
    x1: 100 + Math.cos(a) * r1,
    y1: 112 + Math.sin(a) * r1,
    x2: 100 + Math.cos(a) * r2,
    y2: 112 + Math.sin(a) * r2,
  };
});

function flyTo(source: Element | null, target: Element | null, duration: number) {
  if (!source || !target) return null;
  const a = source.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  if (!a.width || !b.width) return null;
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = b.width / a.width;
  return source.animate(
    [
      { transform: "translate3d(0,0,0) scale(1)" },
      { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${s})` },
    ],
    { duration, easing: "cubic-bezier(0.7, 0, 0.2, 1)", fill: "forwards" },
  );
}

export default function Intro() {
  const [mode, setMode] = useState<IntroMode>(() =>
    typeof window === "undefined" ? "none" : getIntroMode(),
  );
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "none") return;
    const html = document.documentElement;
    const timers: number[] = [];
    let finished = false;
    const releaseHero = () => html.classList.remove("intro-running");
    const done = (full: boolean) => {
      if (finished) return;
      finished = true;
      releaseHero();
      finishIntro(full);
      setMode("none");
    };

    if (mode === "short") {
      timers.push(window.setTimeout(releaseHero, 260));
      timers.push(window.setTimeout(() => done(false), 900));
      return () => timers.forEach(clearTimeout);
    }

    const el = root.current;
    const startFlight = () => {
      if (!el || finished) return;
      releaseHero();
      const brand = document.querySelector(".header-brand");
      flyTo(el.querySelector(".intro-mark"), brand?.querySelector(".brand-mark") ?? null, FLIGHT_MS);
      flyTo(el.querySelector(".intro-word"), brand?.querySelector(".wordmark") ?? null, FLIGHT_MS);
      el.querySelector(".intro-bg")?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: FLIGHT_MS * 0.8,
        easing: "ease-out",
        fill: "forwards",
      });
      timers.push(window.setTimeout(() => done(true), FLIGHT_MS + 20));
    };
    // Foydalanuvchi scroll qilsa yoki tugma bossa, animatsiya darhol yakunlanadi.
    const skip = () => {
      if (!el || finished) return;
      timers.forEach(clearTimeout);
      releaseHero();
      el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 240,
        easing: "ease-out",
        fill: "forwards",
      }).onfinish = () => done(true);
    };
    timers.push(window.setTimeout(startFlight, FLIGHT_AT));
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    events.forEach((e) => window.addEventListener(e, skip, { passive: true, once: true }));
    return () => {
      timers.forEach(clearTimeout);
      events.forEach((e) => window.removeEventListener(e, skip));
    };
  }, [mode]);

  if (mode !== "full") return null;
  return (
    <div className="intro" ref={root} aria-hidden="true">
      <div className="intro-bg" />
      <div className="intro-stage">
        <span className="intro-mark brand-mark is-l">
          <svg className="intro-fx" viewBox="0 0 200 200" fill="none">
            <g className="i-rays">
              {RAYS.map((r, i) => (
                <line key={i} {...r} pathLength={1} style={{ "--i": i } as CSSProperties} />
              ))}
            </g>
            <circle className="i-ring" cx="100" cy="112" r="88" pathLength={1} />
            <circle className="i-dot" cx="100" cy="112" r="4.5" />
          </svg>
          <span className="logo-left" />
          <span className="logo-alif" />
          <span className="logo-right" />
        </span>
        <span className="intro-word wordmark" />
      </div>
    </div>
  );
}
