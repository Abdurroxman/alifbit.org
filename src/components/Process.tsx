import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BookOpen, Check, Code2, Cpu, PenTool, Sparkles } from "lucide-react";
import { BrandMark } from "./Brand";
import ProjectArt from "./ProjectArt";
import { ButtonLink, Eyebrow } from "./ui";
import { useContent } from "../App";
import { prefersReducedMotion } from "../lib/motion";
import type { Project } from "../../shared/content";

const STEPS = [
  ["G‘oya", "Hammasi bir g‘oyadan boshlanadi.", "Bir savol, bir ehtiyoj yoki kichik fikr. Katta imkoniyatlar aynan shu yerdan boshlanadi."],
  ["Shakllanish", "Biz g‘oyalarga shakl beramiz.", "Izlanamiz, chizamiz, sinab ko‘ramiz. Texnologiya, bilim va dizayn bir maqsad atrofida uchrashadi."],
  ["Yig‘ilish", "Har bir detal — katta natijaning bir qismi.", "Alohida yechimlar birlashadi. Har bir satr kod, har bir qaror va har bir detal o‘z o‘rnini topadi."],
  ["Natija", "G‘oyalarni haqiqatga aylantiramiz.", "Natija — insonlarga foyda beradigan mahsulot. Yangi boshlanishlar uchun yana bir imkoniyat."],
] as const;

// Scroll progressi (0–1) bo'yicha bosqichlar chegaralari.
const RANGES = [
  [0, 0.2],
  [0.22, 0.44],
  [0.46, 0.7],
  [0.74, 0.96],
] as const;
const STAGE_VALUES = [
  { a: 1, b: 0, c: 0, d: 0 },
  { a: 1, b: 1, c: 0, d: 0 },
  { a: 1, b: 1, c: 1, d: 0 },
  { a: 1, b: 1, c: 1, d: 1 },
];

const PIN_QUERY = "(min-width: 1024px) and (min-height: 600px)";
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

type Frag = {
  cls: string;
  w: number;
  h: number;
  x1: number;
  y1: number;
  r1: number;
  x2: number;
  y2: number;
  content?: React.ReactNode;
};

// x1/y1 — tarqoq holat (2-bosqich), x2/y2 — yig'ilgan maket ichidagi joyi (3-bosqich). Birlik: sahna kengligining 1%.
const CODE: Frag[] = [14, 19, 11, 16, 13, 8].map((w, i) => {
  const indent = [0, 1, 1, 2, 1, 0][i] * 2.6;
  return {
    cls: `ps-code ps-code-${i % 3}`,
    w,
    h: 1.9,
    x1: -40 + (i % 2) * 8 + i * 1.5,
    y1: -26 + i * 9.5,
    r1: [-18, 12, -8, 20, -14, 9][i],
    x2: -24.5 + indent + w / 2,
    y2: -13.5 + i * 4.6,
  };
});
const SIDEBAR: Frag[] = [0, 1, 2, 3].map((i) => ({
  cls: `ps-side ${i === 0 ? "ps-side-active" : ""}`,
  w: 4.4,
  h: 4.4,
  x1: [-14, -4, 34, 44][i],
  y1: [-24, -27, 32, 40][i],
  r1: 25 - i * 14,
  x2: -33.2,
  y2: -14 + i * 6.4,
}));
const PANEL: Frag[] = [
  {
    cls: "ps-card ps-card-head",
    w: 33,
    h: 15,
    x1: 31,
    y1: -24,
    r1: 12,
    x2: 18.8,
    y2: -11,
    content: (
      <>
        <small>FIKRDAN — AMALGA.</small>
        <b>
          Yangi imkoniyatlar
          <br />
          shu yerdan boshlanadi.
        </b>
      </>
    ),
  },
  {
    cls: "ps-card ps-card-chart",
    w: 33,
    h: 12.5,
    x1: 37,
    y1: 10,
    r1: -10,
    x2: 18.8,
    y2: 4.6,
    content: [28, 46, 36, 60, 50, 74, 64, 90].map((n, i) => (
      <i key={i} style={{ height: `${n}%` }} />
    )),
  },
  {
    cls: "ps-pill",
    w: 25,
    h: 5,
    x1: 12,
    y1: 34,
    r1: 7,
    x2: 14.8,
    y2: 17.4,
    content: (
      <>
        <Check size={10} strokeWidth={2.4} /> Mahsulotga aylangan g‘oya
      </>
    ),
  },
  {
    cls: "ps-toggle",
    w: 7.4,
    h: 4.2,
    x1: 22,
    y1: 44,
    r1: -16,
    x2: 31.6,
    y2: 17.4,
  },
  {
    cls: "ps-progress",
    w: 21,
    h: 1.6,
    x1: -2,
    y1: 42,
    r1: -9,
    x2: -12.8,
    y2: 17.6,
  },
];
const LABELS = [
  { icon: Code2, text: "Dasturlash", x: -30, y: -40 },
  { icon: PenTool, text: "Dizayn", x: 24, y: -45 },
  { icon: BookOpen, text: "Bilim", x: -30, y: 34 },
  { icon: Sparkles, text: "Ijod", x: 36, y: 25 },
  { icon: Cpu, text: "Texnologiya", x: 0, y: -36 },
];

function vars(v: Record<string, number | string>) {
  const out: Record<string, number | string> = {};
  for (const [k, val] of Object.entries(v)) out[`--${k}`] = val;
  return out as CSSProperties;
}

function MiniCard({ project, slot }: { project: Project; slot: number }) {
  return (
    <div className={`ps-project ps-project-${slot}`}>
      <div className="ps-project-art">
        <ProjectArt kind={project.cover.startsWith("/media/") ? "custom" : project.cover} />
      </div>
      <div className="ps-project-info">
        <small>{project.category}</small>
        <b>{project.name}</b>
      </div>
    </div>
  );
}

export function ProcessScene({
  stage,
  sceneRef,
  projects,
}: {
  stage?: number;
  sceneRef?: React.Ref<HTMLDivElement>;
  projects: Project[];
}) {
  const initial = stage === undefined ? STAGE_VALUES[0] : STAGE_VALUES[stage];
  return (
    <div
      className="ps-scene"
      ref={sceneRef}
      data-step={stage}
      style={vars(stage === undefined ? { a: 0, b: 0, c: 0, d: 0 } : initial)}
      aria-hidden="true"
    >
      <div className="ps-ring" />
      <div className="ps-ring ps-ring-2" />
      {Array.from({ length: 12 }, (_, i) => (
        <div className="ps-ray" key={i} style={vars({ r: i * 30, l: i % 2 ? 26 : 36 })} />
      ))}
      {LABELS.map(({ icon: Icon, text, x, y }, i) => (
        <div className="ps-label" key={text} style={vars({ x, y, k: i })}>
          <Icon size={13} strokeWidth={1.6} />
          {text}
        </div>
      ))}
      <div className="ps-product">
        <div className="ps-frame">
          <div className="ps-titlebar">
            <BrandMark />
            <span>G‘oyangiz. Yangi shaklda.</span>
            <i />
            <i />
            <i />
          </div>
          <div className="ps-sidebar-bg" />
          <div className="ps-code-bg" />
        </div>
        {[...CODE, ...SIDEBAR, ...PANEL].map((f, i) => (
          <div
            key={i}
            className={`ps-frag ${f.cls}`}
            style={vars({ w: f.w, h: f.h, x1: f.x1, y1: f.y1, r1: f.r1, x2: f.x2, y2: f.y2, k: i % 6 })}
          >
            {f.content}
          </div>
        ))}
      </div>
      {projects.slice(0, 2).map((p, i) => (
        <MiniCard key={p.id} project={p} slot={i + 1} />
      ))}
      <div className="ps-seed" />
    </div>
  );
}

export default function Process() {
  const { projects } = useContent();
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(
    () =>
      typeof window !== "undefined" &&
      matchMedia(PIN_QUERY).matches &&
      !prefersReducedMotion(),
  );

  useEffect(() => {
    const wide = matchMedia(PIN_QUERY);
    const decide = () => setPinned(wide.matches && !prefersReducedMotion());
    decide();
    wide.addEventListener("change", decide);
    return () => wide.removeEventListener("change", decide);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    let frame = 0;
    let lastStage = -1;
    const update = () => {
      frame = 0;
      const el = section.current;
      const sc = scene.current;
      if (!el || !sc) return;
      const box = el.getBoundingClientRect();
      const p = clamp01(-box.top / (box.height - innerHeight));
      RANGES.forEach(([from, to], i) => {
        const t = ease(clamp01((p - from) / (to - from)));
        sc.style.setProperty(`--${"abcd"[i]}`, t.toFixed(4));
      });
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      const stage = p < RANGES[1][0] ? 0 : p < RANGES[2][0] ? 1 : p < RANGES[3][0] ? 2 : 3;
      if (stage !== lastStage) {
        lastStage = stage;
        setActive(stage);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pinned]);

  function goTo(i: number) {
    const el = section.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const [from, to] = RANGES[i];
    const p = i === 0 ? 0.12 : from + (to - from) * 0.92;
    window.scrollTo({
      top: scrollY + box.top + (box.height - innerHeight) * p,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  if (!pinned)
    return (
      <section className="process process-steps on-dark" aria-labelledby="process-title">
        <div className="container">
          <h2 id="process-title" className="process-steps-title" data-reveal>
            G‘oyadan mahsulotga<span className="dot">.</span>
          </h2>
          <ol className="process-list">
            {STEPS.map(([name, title, text], i) => (
              <li key={name} className="process-step" data-reveal="fade">
                <div className="process-step-copy">
                  <span className="process-index">
                    0{i + 1} <small>/ {name}</small>
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <ProcessScene stage={i} projects={projects} />
              </li>
            ))}
          </ol>
          <ButtonLink to="/projects" variant="light">
            Loyihalarimizni kashf eting
          </ButtonLink>
        </div>
      </section>
    );

  return (
    <section ref={section} className="process process-pinned on-dark" aria-labelledby="process-title">
      <div className="process-sticky">
        <div className="container process-layout">
          <div className="process-copy">
            <Eyebrow>G‘oyadan mahsulotga</Eyebrow>
            <div className="process-counter" aria-hidden="true">
              <span key={active}>0{active + 1}</span>
              <small>/ 04</small>
            </div>
            <h2 id="process-title" className="visually-hidden">
              G‘oyadan mahsulotga
            </h2>
            <div className="process-texts">
              {STEPS.map(([name, title, text], i) => (
                <div key={name} className={`process-text ${i === active ? "is-active" : ""}`} aria-hidden={i !== active}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
            <div className="process-tabs" role="group" aria-label="Jarayon bosqichlari">
              {STEPS.map(([name], i) => (
                <button key={name} className={i === active ? "is-active" : ""} aria-pressed={i === active} onClick={() => goTo(i)}>
                  <span>0{i + 1}</span>
                  {name}
                </button>
              ))}
            </div>
            <div className="process-bar" aria-hidden="true">
              <span ref={bar} />
            </div>
            <div className={`process-cta ${active === 3 ? "is-active" : ""}`}>
              <ButtonLink to="/projects" variant="light" magnetic>
                Loyihalarimizni kashf eting
              </ButtonLink>
            </div>
          </div>
          <div className="process-stage">
            <ProcessScene sceneRef={scene} projects={projects} />
          </div>
        </div>
      </div>
    </section>
  );
}
