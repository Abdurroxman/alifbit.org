import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useContent } from "../App";
import { courseOrderLink, keepNumbers } from "./Studio";
import { ButtonLink, PriceNote, PriceLabel, TextLink } from "./ui";
import { usePackageChoice } from "../lib/packageChoice";
import { accentStyle } from "../lib/accent";
import { focusOfIcon, type StageFocus } from "../three/types";
import { PROMISES, TELEGRAM_URL, type Course, type Service, type ServicePackage } from "../../shared/content";
import { tr, trn } from "../lib/i18n";

// Tanlov slug bilan saqlanadi va har chizishda kontekstdan qayta topiladi:
// API javobi kelganda narx va paketlar o'z-o'zidan yangilanadi.
type Choice = { kind: "service"; slug: string } | { kind: "course"; slug: string } | { kind: "unknown" };

export type FlowState = { focus: StageFocus; step: 1 | 2 | 3 };

export function orderLink(service: Service, pkg?: ServicePackage) {
  const params = new URLSearchParams({ service: service.slug });
  if (pkg) params.set("package", pkg.name);
  return `/contact?${params}`;
}

/**
 * Bosh sahifaning birinchi ekrani: barcha xizmatlar ro'yxati. Xizmat tanlansa, ro'yxat o'rnida
 * uning to'liq kartasi ochiladi: ichiga nimalar kiradi, paketlar, narx va muddat.
 * Tanlangan xizmat 3D sahnaga uzatiladi.
 */
export default function NeedFlow({ onChange }: { onChange: (state: FlowState) => void }) {
  const { services, courses, loaded } = useContent();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [preview, setPreview] = useState<StageFocus | null>(null);
  const head = useRef<HTMLParagraphElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const index = choice?.kind === "service" ? services.findIndex((s) => s.slug === choice.slug) : -1;
  const service = index >= 0 ? services[index] : undefined;
  const course = choice?.kind === "course" ? courses.find((c) => c.slug === choice.slug) : undefined;
  const open = !!service || !!course || choice?.kind === "unknown";
  const step: 1 | 3 = open ? 3 : 1;
  const focus: StageFocus = service
    ? focusOfIcon(service.icon)
    : course
      ? "course"
      : choice?.kind === "unknown"
        ? "unknown"
        : "idle";

  useEffect(() => {
    onChange({ focus: step === 1 && preview ? preview : focus, step });
  }, [focus, step, preview, onChange]);

  // Ko'rinish almashganda klaviatura va ekran o'quvchi yangi sarlavhaga o'tadi;
  // karta boshi ekrandan chiqib qolgan bo'lsa, unga qaytiladi.
  useEffect(() => {
    if (moved.current) {
      head.current?.focus({ preventScroll: true });
      const top = box.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) box.current?.scrollIntoView({ block: "start" });
    }
    moved.current = true;
  }, [choice]);

  const reset = () => {
    setChoice(null);
    setPreview(null);
  };
  const hover = (f: StageFocus) => ({
    onPointerEnter: () => setPreview(f),
    onPointerLeave: () => setPreview(null),
    onFocus: () => setPreview(f),
    onBlur: () => setPreview(null),
  });
  const next = index >= 0 ? services[(index + 1) % services.length] : undefined;

  return (
    <div className="nf" aria-live="polite" ref={box}>
      <div className="nf-bar">
        {open ? (
          <button className="nf-back" onClick={reset}>
            <ArrowLeft size={16} /> {tr("Barcha xizmatlar")}
          </button>
        ) : (
          <span />
        )}
        <span className="nf-count">{service ? `${service.number} / ${String(services.length).padStart(2, "0")}` : open ? "" : trn(services.length, "{n} ta xizmat")}</span>
      </div>

      {!open && (
        <div className="nf-step" key="list">
          <p className="nf-q visually-hidden" ref={head} tabIndex={-1}>
            {tr("Xizmatlar")}
          </p>
          <ul className="nf-services">
            {services.map((s) => (
              <li key={s.slug}>
                <button
                  className="nf-svc"
                  style={accentStyle(s.icon)}
                  onClick={() => setChoice({ kind: "service", slug: s.slug })}
                  {...hover(focusOfIcon(s.icon))}
                >
                  <span className="nf-svc-num">{s.number}</span>
                  <span className="nf-svc-main">
                    <b>{s.name}</b>
                    <small>{s.short}</small>
                  </span>
                  <span className="nf-svc-price">{loaded ? keepNumbers(s.price || tr("Kelishiladi")) : ""}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className="nf-more">
            {courses
              .filter((c) => c.need)
              .map((c) => (
                <button key={c.id} onClick={() => setChoice({ kind: "course", slug: c.slug })} {...hover("course")}>
                  {c.need} — {c.title}
                </button>
              ))}
            <button onClick={() => setChoice({ kind: "unknown" })}>{tr("Hali aniq bilmayman")}</button>
          </div>
        </div>
      )}

      {service && (
        <ServiceCard
          key={service.slug}
          head={head}
          service={service}
          loaded={loaded}
          next={next && next.slug !== service.slug ? next : undefined}
          onNext={(slug) => setChoice({ kind: "service", slug })}
        />
      )}

      {course && <CourseResult head={head} course={course} onReset={reset} />}

      {choice?.kind === "unknown" && (
        <div className="nf-step nf-result" key="unknown">
          <p className="nf-q" ref={head} tabIndex={-1}>
            {tr("Birgalikda aniqlaymiz.")}
          </p>
          <p className="nf-text">{tr("Vazifangizni qisqacha yozing — mos yechim va narxini o‘zimiz taklif qilamiz.")}</p>
          <div className="nf-actions">
            <ButtonLink to="/contact?service=other" magnetic>
              {tr("Vazifani yozish")}
            </ButtonLink>
            <ButtonLink to={TELEGRAM_URL} variant="outline">
              {tr("Telegram’da yozish")}
            </ButtonLink>
          </div>
          <button className="nf-again" onClick={reset}>
            {tr("Barcha xizmatlar")}
          </button>
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  head,
  service,
  loaded,
  next,
  onNext,
}: {
  head: RefObject<HTMLParagraphElement | null>;
  service: Service;
  loaded: boolean;
  next?: Service;
  onNext: (slug: string) => void;
}) {
  const packages = service.packages || [];
  const { selected, optionProps } = usePackageChoice(packages);
  return (
    <article className="nf-step nf-result nf-card" style={accentStyle(service.icon)}>
      <span className="nf-label">{tr("Xizmat {number}", { number: service.number })}</span>
      <p className="nf-q" ref={head} tabIndex={-1}>
        {service.name}
      </p>
      {loaded && (service.price || service.term) && (
        <p className="nf-price">
          {service.price && <PriceLabel />}
          <b>{keepNumbers(service.price || tr("Narxi kelishiladi"))}</b>
          {service.term && <small>{service.term}</small>}
        </p>
      )}
      <p className="nf-text">{service.short}</p>

      <h3 className="nf-h">{tr("Xizmatga nimalar kiradi?")}</h3>
      <ul className="nf-list nf-cols">
        {service.features.map((f) => (
          <li key={f}>
            <Check size={16} aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>

      <h3 className="nf-h">{packages.length > 1 ? tr("Paketlar") : tr("Narxi")}</h3>
      {loaded ? (
        <ul
          className="nf-pkgs"
          role={packages.length ? "radiogroup" : undefined}
          aria-label={packages.length ? tr("Paketlar") : undefined}
        >
          {packages.map((p) => (
            <li key={p.name} className={p === selected ? "is-selected" : ""} {...optionProps(p)}>
              <div className="nf-pkg-head">
                <b>{p.name}</b>
                {p.recommended && <span className="nf-badge">{tr("Tavsiya")}</span>}
              </div>
              {p.fit && <p className="nf-pkg-fit">{p.fit}</p>}
              {p.features.length > 0 && <p className="nf-pkg-items">{p.features.join(" · ")}</p>}
              <div className="nf-pkg-foot">
                {p.price && <PriceLabel />}
                <span>
                  <b>{keepNumbers(p.price || tr("Narxi kelishiladi"))}</b>
                  {p.term && <small>{p.term}</small>}
                </span>
              </div>
            </li>
          ))}
          {!packages.length && (
            <li>
              <div className="nf-pkg-foot">
                <span>
                  <b>{keepNumbers(service.price || tr("Narxi kelishiladi"))}</b>
                </span>
                <TextLink to={orderLink(service)}>{tr("Buyurtma berish")}</TextLink>
              </div>
            </li>
          )}
        </ul>
      ) : (
        <p className="nf-wait">{tr("Narxlar yuklanmoqda…")}</p>
      )}
      {loaded && (service.price || packages.some((p) => p.price)) && (
        <PriceNote />
      )}

      {service.promises !== false && (
        <ul className="nf-promises" aria-label={tr("Har bir loyihada")}>
          {PROMISES.map(([title, text]) => (
            <li key={title} title={tr(text)}>
              <Check size={14} aria-hidden="true" />
              {tr(title)}
            </li>
          ))}
        </ul>
      )}

      <div className="nf-actions">
        <ButtonLink to={orderLink(service, selected)} magnetic>
          {tr("Buyurtma berish")}
        </ButtonLink>
        <ButtonLink to={`/services/${service.slug}`} variant="outline">
          {tr("Batafsil")}
        </ButtonLink>
      </div>
      {next && (
        <button className="nf-next" onClick={() => onNext(next.slug)}>
          {tr("Keyingi: {name}", { name: next.name })} <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}
    </article>
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
    <div className="nf-step nf-result" key={`course-${course.slug}`}>
      <span className="nf-label">{course.format ? tr("Kurs · {format}", { format: course.format }) : tr("Kurs")}</span>
      <p className="nf-q" ref={head} tabIndex={-1}>
        {course.title}
      </p>
      <p className="nf-price">
        <b>{keepNumbers(course.price || tr("Narxi kelishiladi"))}</b>
        {course.start && <small>{course.start}</small>}
      </p>
      {course.contents.length > 0 && (
        <ul className="nf-list">
          {course.contents.slice(0, 6).map((f) => (
            <li key={f}>
              <Check size={16} aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      )}
      <div className="nf-actions">
        <ButtonLink to={courseOrderLink(course)} magnetic>
          {tr("Kursga yozilish")}
        </ButtonLink>
        <TextLink to={`/courses/${course.slug}`}>{tr("Kurs haqida")}</TextLink>
      </div>
      <button className="nf-again" onClick={onReset}>
        {tr("Barcha xizmatlar")}
      </button>
    </div>
  );
}
