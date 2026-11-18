import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useContent } from "../App";
import DeviceStage from "../components/DeviceStage";
import NeedFlow, { type FlowState } from "../components/NeedFlow";
import { CourseTeaser, WorkCard } from "../components/Studio";
import { Chars, ContactBand, Eyebrow, Lines, TextLink, delay } from "../components/ui";
import { FAQ, WorkingProcess } from "./Services";
import { copy } from "../../shared/content";
import { focusOfIcon, type StageSection } from "../three/types";
import type { Project } from "../../shared/content";

/** Bosh sahifada ko'rsatiladigan ishlar tartibi: jonli mahsulot, keyin uchta namuna yechim. */
const HOME_WORKS = ["voice", "tungi-navbatchi", "peshtaxta", "qabulxona"];

function homeWorks(projects: Project[]) {
  const picked = HOME_WORKS.map((id) => projects.find((p) => p.id === id)).filter((p): p is Project => !!p);
  const rest = projects.filter((p) => !picked.includes(p));
  return [...picked, ...rest].slice(0, 4);
}

function Hero({ onFlow, stage }: { onFlow: (s: FlowState) => void; stage: ReactNode }) {
  return (
    <section className="hero" data-stage="hero">
      <div className="hero-glow" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="container hero-grid">
        <div className="hero-copy">
          <div data-reveal="rise">
            <Eyebrow>AlifBit · studiya</Eyebrow>
          </div>
          <Chars text={copy.uz.hero.title} delay={120} />
          <p className="hero-text" data-reveal="rise" style={delay(420)}>
            {copy.uz.hero.text}
          </p>
          <div data-reveal="rise" style={delay(540)}>
            <NeedFlow onChange={onFlow} />
          </div>
        </div>
        {stage}
      </div>
    </section>
  );
}

/** Har bir ish alohida «qadam»: u ekran markaziga kelganda 3D sahna shu ishni ko'rsatadi. */
function Works({ onWork }: { onWork: (id: string) => void }) {
  const { projects } = useContent();
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) onWork((e.target as HTMLElement).dataset.work || "");
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    root.querySelectorAll("[data-work]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [projects, onWork]);
  return (
    <section className="container section works" data-stage="works">
      <div className="works-copy">
        <div className="section-head">
          <div>
            <div data-reveal="fade">
              <Eyebrow>Qilgan ishlarimiz</Eyebrow>
            </div>
            <Lines>
              {[
                "Ishlar va yechimlar.",
                <span className="accent" key="a">
                  Sinab ko‘ring.
                </span>,
              ]}
            </Lines>
          </div>
        </div>
        <div className="work-steps" ref={list}>
          {homeWorks(projects).map((p, i) => (
            <div className="work-step" key={p.id} data-work={p.id}>
              <WorkCard project={p} delay={(i % 2) * 90} thumb />
            </div>
          ))}
        </div>
        <div data-reveal>
          <TextLink to="/projects">Barcha ishlar</TextLink>
        </div>
      </div>
    </section>
  );
}

function Course() {
  const { courses } = useContent();
  if (!courses.length) return null;
  return (
    <section className="container section hairline">
      <div data-reveal="fade">
        <Eyebrow>Kurs</Eyebrow>
      </div>
      <CourseTeaser course={courses[0]} />
    </section>
  );
}

/**
 * Ekran o'rtasidagi bo'limni kuzatadi: sahna faqat hero va ishlar bo'limida chiqadi.
 * Kuzatuv chizig'i — oynaning o'rta qismi, shuning uchun bo'lim balandligi ahamiyatsiz.
 */
function useStageSection(root: RefObject<HTMLDivElement | null>) {
  const [section, setSection] = useState<StageSection>("hero");
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const inside = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const name = (e.target as HTMLElement).dataset.stage || "";
          if (e.isIntersecting) inside.add(name);
          else inside.delete(name);
        }
        setSection(inside.has("hero") ? "hero" : inside.has("works") ? "works" : "hidden");
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );
    el.querySelectorAll("[data-stage]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [root]);
  return section;
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [flow, setFlow] = useState<FlowState>({ focus: "idle", step: 1 });
  const [work, setWork] = useState<string | null>(null);
  const section = useStageSection(root);
  const onFlow = useCallback((s: FlowState) => setFlow(s), []);
  const onWork = useCallback((id: string) => setWork(id || null), []);
  const { projects, services } = useContent();
  const icon = services.find((s) => s.slug === projects.find((p) => p.id === work)?.service)?.icon || "";
  const stage = (
    <DeviceStage state={{ section, focus: flow.focus, step: flow.step, work, workFocus: focusOfIcon(icon) }} />
  );
  return (
    <div className="home" ref={root}>
      <Hero onFlow={onFlow} stage={stage} />
      <Works onWork={onWork} />
      <WorkingProcess />
      <Course />
      <FAQ priceMode="ask" />
      <ContactBand />
    </div>
  );
}
