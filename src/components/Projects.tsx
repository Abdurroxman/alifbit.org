import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../../shared/content";
import ProjectArt from "./ProjectArt";
import { Arrow } from "./ui";

export function Status({ value }: { value: string }) {
  return (
    <span className={`status ${value === "Ishlayapti" ? "status-live" : ""}`}>
      <i aria-hidden="true" />
      {value}
    </span>
  );
}

export function ProjectCover({ project, large = false }: { project: Project; large?: boolean }) {
  return project.cover.startsWith("/media/") ? (
    <img className="project-upload" src={project.cover} alt={`${project.name} loyihasi muqovasi`} loading="lazy" />
  ) : (
    <ProjectArt kind={project.cover} large={large} />
  );
}

export function ProjectCard({
  project,
  index = 0,
  delay = 0,
}: {
  project: Project;
  index?: number;
  delay?: number;
}) {
  return (
    <article className="project-card" data-reveal style={{ "--d": delay } as CSSProperties}>
      <Link to={`/projects/${project.slug}`} className="project-cover" tabIndex={-1} aria-hidden="true">
        <ProjectCover project={project} />
        <span className="project-open">
          <Arrow size={20} />
        </span>
      </Link>
      <div className="project-info">
        <div className="project-meta">
          <span>
            {project.category} <i>/</i> {String(index + 1).padStart(2, "0")}
          </span>
          <Status value={project.status} />
        </div>
        <h3>
          <Link to={`/projects/${project.slug}`}>{project.name}</Link>
        </h3>
        <p>{project.summary}</p>
      </div>
    </article>
  );
}
