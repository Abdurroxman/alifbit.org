import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useContent } from "../App";
import { courseOrderLink, keepNumbers } from "./Studio";
import { ButtonLink, TextLink } from "./ui";
import { focusOfIcon, type StageFocus } from "../three/types";
import { TELEGRAM_URL, type Course, type Service, type ServicePackage } from "../../shared/content";

// Tanlov slug bilan saqlanadi va har chizishda kontekstdan qayta topiladi:
// API javobi kelganda narx va paketlar o'z-o'zidan yangilanadi.
type Choice = { kind: "service"; slug: string } | { kind: "course"; slug: string } | { kind: "unknown" };

export type FlowState = { focus: StageFocus; step: 1 | 2 | 3 };

function orderLink(service: Service, pkg?: ServicePackage) {
  const params = new URLSearchParams({ service: service.slug });
  if (pkg) params.set("package", pkg.name);
  return `/contact?${params}`;
}

/**
 * Bosh sahifadagi suhbat: «Sizga nima kerak?» → «Qaysi biri sizga yaqinroq?» → mos yechim va narx.
 * Aloqa ma'lumoti so'ralmaydi; buyurtma tugmasi formani tanlangan paket bilan ochadi.
 */
export default function NeedFlow({ onChange }: { onChange: (state: FlowState) => void }) {
  const { services, courses, loaded } = useContent();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [pkgName, setPkgName] = useState<string | null>(null);
  const [preview, setPreview] = useState<StageFocus | null>(null);
  const head = useRef<HTMLParagraphElement>(null);
  const moved = useRef(false);

  const needs = services.filter((s) => s.need).sort((a, b) => a.number.localeCompare(b.number));
  const courseNeeds = courses.filter((c) => c.need);
  const service = choice?.kind === "service" ? services.find((s) => s.slug === choice.slug) : undefined;
  const course = choice?.kind === "course" ? courses.find((c) => c.slug === choice.slug) : undefined;
  const fits = (service?.packages || []).filter((p) => p.fit);
  const pkg =
    fits.find((p) => p.name === pkgName) ||
    (service && loaded && fits.length < 2 ? fits[0] || (service.packages || [])[0] : undefined);

  const step: 1 | 2 | 3 = !choice ? 1 : choice.kind === "service" && !pkg ? 2 : 3;
  const focus: StageFocus = service
    ? focusOfIcon(service.icon)
    : choice?.kind === "course"
      ? "course"
      : choice?.kind === "unknown"
        ? "unknown"
        : "idle";

  useEffect(() => {
    onChange({ focus: step === 1 && preview ? preview : focus, step });
  }, [focus, step, preview, onChange]);

  // Qadam almashganda klaviatura va ekran o'quvchi yangi savolga o'tadi.
  useEffect(() => {
    if (moved.current) head.current?.focus({ preventScroll: true });
    moved.current = true;
  }, [step]);

  const reset = () => {
    setChoice(null);
    setPkgName(null);
    setPreview(null);
  };
  const back = () => {
    if (step === 3 && choice?.kind === "service" && fits.length >= 2) setPkgName(null);
    else reset();
  };

  return (
    <div className="nf" aria-live="polite">
      <div className="nf-bar">
        {step > 1 ? (
          <button className="nf-back" onClick={back}>
            <ArrowLeft size={16} /> Orqaga
          </button>
        ) : (
          <span />
        )}
        <span className="nf-count">{step === 3 ? "Natija" : `${step} / 2`}</span>
      </div>

      {step === 1 && (
        <div className="nf-step" key="s1">
          <p className="nf-q visually-hidden" ref={head} tabIndex={-1}>
            Sizga nima kerak?
          </p>
          <ul className="nf-options">
            {needs.map((s) => (
              <li key={s.slug}>
                <button
                  className="nf-option"
                  onClick={() => setChoice({ kind: "service", slug: s.slug })}
                  onPointerEnter={() => setPreview(focusOfIcon(s.icon))}
                  onPointerLeave={() => setPreview(null)}
                  onFocus={() => setPreview(focusOfIcon(s.icon))}
                  onBlur={() => setPreview(null)}
                >
                  {s.need}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
            {courseNeeds.map((c) => (
              <li key={c.id}>
                <button
                  className="nf-option"
                  onClick={() => setChoice({ kind: "course", slug: c.slug })}
                  onPointerEnter={() => setPreview("course")}
                  onPointerLeave={() => setPreview(null)}
                  onFocus={() => setPreview("course")}
                  onBlur={() => setPreview(null)}
                >
                  {c.need}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
            <li>
              <button className="nf-option nf-option-quiet" onClick={() => setChoice({ kind: "unknown" })}>
                Hali aniq bilmayman
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
      )}

      {step === 2 && service && (
        <div className="nf-step" key="s2">
          <p className="nf-q" ref={head} tabIndex={-1}>
            Qaysi biri sizga yaqinroq?
          </p>
          {loaded ? (
            <ul className="nf-options">
              {fits.map((p) => (
                <li key={p.name}>
                  <button className="nf-option" onClick={() => setPkgName(p.name)}>
                    {p.fit}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="nf-wait">Yuklanmoqda…</p>
          )}
        </div>
      )}

      {step === 3 && service && (
        <Result
          head={head}
          label={service.name}
          title={pkg?.name || service.name}
          price={pkg ? pkg.price || "Narxi kelishiladi" : service.price || "Narxi kelishiladi"}
          term={pkg ? pkg.term : service.term}
          items={(pkg?.features || service.features).slice(0, 4)}
          primary={["Buyurtma berish", orderLink(service, pkg)]}
          secondary={["Batafsil", `/services/${service.slug}`]}
          onReset={reset}
        />
      )}

      {step === 3 && course && <CourseResult head={head} course={course} onReset={reset} />}

      {step === 3 && choice?.kind === "unknown" && (
        <div className="nf-step nf-result" key="s3u">
          <p className="nf-q" ref={head} tabIndex={-1}>
            Birgalikda aniqlaymiz.
          </p>
          <p className="nf-text">Vazifangizni qisqacha yozing — mos yechim va narxini o‘zimiz taklif qilamiz.</p>
          <div className="nf-actions">
            <ButtonLink to="/contact?service=other" magnetic>
              Vazifani yozish
            </ButtonLink>
            <ButtonLink to={TELEGRAM_URL} variant="outline">
              Telegram’da yozish
            </ButtonLink>
          </div>
          <button className="nf-again" onClick={reset}>
            Boshqasini tanlash
          </button>
        </div>
      )}
    </div>
  );
}

function Result({
  head,
  label,
  title,
  price,
  term,
  items,
  primary,
  secondary,
  onReset,
}: {
  head: RefObject<HTMLParagraphElement | null>;
  label: string;
  title: string;
  price: string;
  term?: string;
  items: string[];
  primary: [string, string];
  secondary: [string, string];
  onReset: () => void;
}) {
  return (
    <div className="nf-step nf-result" key={`s3-${title}`}>
      <span className="nf-label">Sizga mos · {label}</span>
      <p className="nf-q" ref={head} tabIndex={-1}>
        {title}
      </p>
      <p className="nf-price">
        <b>{keepNumbers(price)}</b>
        {term && <small>{term}</small>}
      </p>
      {items.length > 0 && (
        <ul className="nf-list">
          {items.map((f) => (
            <li key={f}>
              <Check size={16} aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      )}
      <div className="nf-actions">
        <ButtonLink to={primary[1]} magnetic>
          {primary[0]}
        </ButtonLink>
        <TextLink to={secondary[1]}>{secondary[0]}</TextLink>
      </div>
      <button className="nf-again" onClick={onReset}>
        Boshqasini tanlash
      </button>
    </div>
  );
}

function CourseResult({
  head,
  course,
  onReset,
}: {
  head: RefObject<HTMLParagraphElement | null>;
  course: Course;
  onReset: () => void;
}) {
  return (
    <Result
      head={head}
      label={course.format ? `Kurs · ${course.format}` : "Kurs"}
      title={course.title}
      price={course.price || "Narxi kelishiladi"}
      term={course.start}
      items={course.contents.slice(0, 4)}
      primary={["Kursga yozilish", courseOrderLink(course)]}
      secondary={["Kurs haqida", `/courses/${course.slug}`]}
      onReset={onReset}
    />
  );
}
