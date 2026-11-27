import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../App";
import { accentStyle } from "../lib/accent";
import { COURSE_ORDER_PREFIX, SADO_URL, type Course, type Project, type Service } from "../../shared/content";
import { ProjectCover, Status } from "./Projects";
import { Arrow, ButtonLink, PriceLabel, TextLink } from "./ui";
import { tr } from "../lib/i18n";

/** Ishning jonli manzili; eski Sado yozuvida manzil bo'sh bo'lsa, Sado sayti olinadi. */
export function projectLink(project: Project) {
  return project.url || (project.id === "voice" ? SADO_URL : "");
}

/** Narxdagi raqamlar satr oxirida bo'linib ketmasin. */
export function keepNumbers(value: string) {
  return value.replace(/(\d) (?=\d)/g, "$1 ");
}

export function courseOrderLink(course: Course) {
  return `/contact?service=${COURSE_ORDER_PREFIX}${course.slug}`;
}

export function ServiceCards({ services }: { services: Service[] }) {
  return (
    <div className="svc-grid">
      {services.map((s, i) => (
        <Link
          key={s.slug}
          to={`/services/${s.slug}`}
          className="svc-card"
          data-reveal
          data-tilt
          style={accentStyle(s.icon, { "--d": (i % 2) * 90 } as CSSProperties)}
        >
          <span className="svc-top">
            <span className="svc-num">{s.number}</span>
            <Arrow size={20} />
          </span>
          <h3>{s.name}</h3>
          <p>{s.short}</p>
          {(s.price || s.term) && (
            <span className="svc-price">
              {s.price && (
                <span className="svc-price-main">
                  <PriceLabel />
                  <b>{s.price}</b>
                </span>
              )}
              {s.term && <small>{s.term}</small>}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

export function WorkCard({ project, delay = 0, thumb = false }: { project: Project; delay?: number; thumb?: boolean }) {
  const link = projectLink(project);
  const { services, categoryLabel } = useContent();
  const icon = services.find((s) => s.slug === project.service)?.icon;
  return (
    <article className="work-card" data-reveal data-tilt style={accentStyle(icon, { "--d": delay } as CSSProperties)}>
      {thumb && (
        <div className="work-thumb" aria-hidden="true">
          <ProjectCover project={project} />
        </div>
      )}
      <div className="work-meta">
        <span>{categoryLabel(project.category)}</span>
        <Status value={project.status} />
      </div>
      <h3>
        <Link to={`/projects/${project.slug}`}>{project.name}</Link>
      </h3>
      <p>{project.summary}</p>
      {project.platforms.length > 0 && (
        <ul className="tags" aria-label={tr("Platformalar")}>
          {project.platforms.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      <div className="work-actions">
        {link ? (
          <ButtonLink to={link} small external>
            {tr("Ochish")}
          </ButtonLink>
        ) : (
          project.demo && (
            <ButtonLink to={`/projects/${project.slug}#demo`} small>
              {tr("Demo")}
            </ButtonLink>
          )
        )}
        <TextLink to={`/projects/${project.slug}`}>{tr("Batafsil")}</TextLink>
      </div>
    </article>
  );
}

export function WorkGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="work-grid">
      {projects.map((p, i) => (
        <WorkCard key={p.id} project={p} delay={(i % 2) * 110} />
      ))}
    </div>
  );
}

export function CourseTeaser({ course }: { course: Course }) {
  return (
    <div className="course-teaser" data-reveal data-tilt>
      <div>
        <span className="course-teaser-label">{course.format ? tr("Kurs · {format}", { format: course.format }) : tr("Kurs")}</span>
        <h3>{course.title}</h3>
        <p>{course.tagline}</p>
      </div>
      <div className="course-teaser-side">
        {course.price && <b>{course.price}</b>}
        <ButtonLink to={`/courses/${course.slug}`}>{tr("Kurs haqida")}</ButtonLink>
      </div>
    </div>
  );
}
