import { useEffect, useRef, useState, type CSSProperties } from "react";
import { LOGO } from "../../shared/logo";
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

function Arms({ id }: { id: string }) {
  return (
    <>
      <path className="i-arm i-arm-bottom" d={LOGO.lowerArm} fill={`url(#${id}b)`} stroke={LOGO.colors.edge} strokeWidth="1.1" strokeLinejoin="round" />
      <path className="i-arm i-arm-top" d={LOGO.upperArm} fill={`url(#${id}t)`} stroke={LOGO.colors.edge} strokeWidth="1.1" strokeLinejoin="round" />
    </>
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
  const id = "intro";
  const c = LOGO.colors;
  return (
    <div className="intro" ref={root} aria-hidden="true">
      <div className="intro-bg" />
      <div className="intro-stage">
        <svg className="intro-mark" viewBox={LOGO.viewBox} fill="none">
          <defs>
            <linearGradient id={`${id}t`} x1="80" y1="60" x2="10" y2="118" gradientUnits="userSpaceOnUse">
              <stop stopColor={c.armTop[0]} />
              <stop offset="1" stopColor={c.armTop[1]} />
            </linearGradient>
            <linearGradient id={`${id}b`} x1="10" y1="116" x2="80" y2="172" gradientUnits="userSpaceOnUse">
              <stop stopColor={c.armBottom[0]} />
              <stop offset="1" stopColor={c.armBottom[1]} />
            </linearGradient>
            <linearGradient id={`${id}a`} x1="80" y1="40" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor={c.alif[0]} />
              <stop offset=".45" stopColor={c.alif[1]} />
              <stop offset="1" stopColor={c.alif[2]} />
            </linearGradient>
          </defs>
          <g className="i-rays">
            {RAYS.map((r, i) => (
              <line key={i} {...r} pathLength={1} style={{ "--i": i } as CSSProperties} />
            ))}
          </g>
          <circle className="i-ring" cx="100" cy="112" r="88" pathLength={1} />
          <g className="i-side">
            <Arms id={id} />
          </g>
          <g className="i-side">
            <g transform="matrix(-1 0 0 1 200 0)">
              <Arms id={id} />
            </g>
          </g>
          <path className="i-alif" d={LOGO.alif} fill={`url(#${id}a)`} stroke="#a7834b" strokeWidth=".8" />
          <circle className="i-dot" cx="100" cy="112" r="4.5" />
        </svg>
        <div className="intro-word wordmark">
          {"AlifBit".split("").map((ch, i) => (
            <span key={i} className={i > 3 ? "gold" : ""} style={{ "--i": i } as CSSProperties}>
              {ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
