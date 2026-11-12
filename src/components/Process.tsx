import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Code2,
  PenTool,
  BookOpen,
  Sparkles,
  Check,
} from "lucide-react";
import { BrandMark } from "./Brand";
import { Eyebrow } from "./Layout";
const steps = [
  [
    "G‘oya",
    "Hammasi bir g‘oyadan boshlanadi.",
    "Bir savol, bir ehtiyoj yoki kichik fikr. Katta imkoniyatlar aynan shu yerdan boshlanadi.",
  ],
  [
    "Shakllanish",
    "Biz g‘oyalarga shakl beramiz.",
    "Izlanamiz, chizamiz, sinab ko‘ramiz. Texnologiya, bilim va dizayn bir maqsad atrofida uchrashadi.",
  ],
  [
    "Yig‘ilish",
    "Har bir detal — katta natijaning bir qismi.",
    "Alohida yechimlar birlashadi. Har bir satr kod, har bir qaror va har bir detal o‘z o‘rnini topadi.",
  ],
  [
    "Natija",
    "G‘oyalarni haqiqatga aylantiramiz.",
    "Natija — insonlarga foyda beradigan mahsulot. Yangi boshlanishlar uchun yana bir imkoniyat.",
  ],
];
export default function Process() {
  const ref = useRef<HTMLElement>(null),
    [progress, setProgress] = useState(0),
    [mobile, setMobile] = useState(false);
  useEffect(() => {
    const media = matchMedia("(max-width: 767px)"),
      reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const resize = () => setMobile(media.matches || reduced.matches);
    resize();
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!ref.current || media.matches || reduced.matches) return;
        const box = ref.current.getBoundingClientRect();
        setProgress(
          Math.max(0, Math.min(1, -box.top / (box.height - innerHeight))),
        );
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", resize);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", resize);
    };
  }, []);
  const active = Math.min(3, Math.floor(progress * 4));
  function select(i: number) {
    if (mobile) setProgress((i + 0.15) / 4);
    else if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      window.scrollTo({
        top: scrollY + rect.top + ((rect.height - innerHeight) * (i + 0.3)) / 4,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }
  return (
    <section
      ref={ref}
      className="process"
      aria-label="G‘oyadan mahsulotga yaratish jarayoni"
    >
      <div className="process-sticky">
        <div className="container process-layout">
          <div className="process-copy">
            <Eyebrow>G‘OYADAN MAHSULOTGA</Eyebrow>
            <div className="process-number">
              0{active + 1}
              <span>/ 04</span>
            </div>
            <h2 key={active}>{steps[active][1]}</h2>
            <p>{steps[active][2]}</p>
            <div className="process-tabs" aria-label="Jarayon bosqichlari">
              {steps.map((step, i) => (
                <button
                  key={step[0]}
                  onClick={() => select(i)}
                  aria-pressed={active === i}
                  className={i === active ? "active" : ""}
                >
                  <span>0{i + 1}</span>
                  {step[0]}
                </button>
              ))}
            </div>
            <Link className="text-link" to="/projects">
              Loyihalarimizni kashf eting
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div
            className={`process-scene stage-${active}`}
            style={{ "--progress": progress } as React.CSSProperties}
            aria-hidden="true"
          >
            <div className="scene-orbit orbit-one" />
            <div className="scene-orbit orbit-two" />
            <div className="scene-axis axis-x" />
            <div className="scene-axis axis-y" />
            <div className="idea-seed" />
            <div className="scene-node node-code">
              <Code2 size={23} />
              <span>Dasturlash</span>
            </div>
            <div className="scene-node node-design">
              <PenTool size={21} />
              <span>Dizayn</span>
            </div>
            <div className="scene-node node-book">
              <BookOpen size={23} />
              <span>Bilim</span>
            </div>
            <div className="scene-node node-idea">
              <Sparkles size={21} />
              <span>Ijod</span>
            </div>
            <div className="assembled-ui">
              <div className="assembled-top">
                <BrandMark />
                <span>G‘oyangiz. Yangi shaklda.</span>
                <i />
                <i />
                <i />
              </div>
              <div className="assembled-body">
                <div className="assembled-sidebar">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="assembled-content">
                  <small>FIKRDAN — AMALGA.</small>
                  <h3>
                    Yangi imkoniyatlar
                    <br />
                    shu yerdan boshlanadi.
                  </h3>
                  <div className="assembled-chart">
                    {[25, 46, 35, 60, 48, 76, 65, 92].map((n, i) => (
                      <i key={i} style={{ height: `${n}%` }} />
                    ))}
                  </div>
                  <div className="assembled-done">
                    <Check size={12} /> Mahsulotga aylangan g‘oya
                  </div>
                </div>
              </div>
            </div>
            <div className="scene-coordinate">ALIFBIT / IDEA → REALITY</div>
            <div className="scene-progress">
              <span style={{ width: `${Math.max(3, progress * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
