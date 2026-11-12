import { Link } from "react-router-dom";
import type { Project } from "../../shared/content";
import ProjectArt from "./ProjectArt";
import { Arrow } from "./Layout";
export function Status({ value }: { value: string }) {
  return (
    <span className={`status ${value === "Ishlayapti" ? "status-live" : ""}`}>
      <i />
      {value}
    </span>
  );
}
export function ProjectCard({
  project,
  index = 0,
}: {
  project: Project;
  index?: number;
}) {
  return (
    <article className="project-card">
      <Link
        to={`/projects/${project.slug}`}
        className="project-image-link"
        aria-label={`${project.name} haqida batafsil`}
      >
        {project.cover.startsWith("/media/") ? (
          <img
            className="project-upload"
            src={project.cover}
            alt={`${project.name} loyihasi muqovasi`}
            loading="lazy"
          />
        ) : (
          <ProjectArt kind={project.cover} />
        )}
        <span className="project-open">
          <Arrow />
        </span>
      </Link>
      <div className="project-info">
        <div>
          <span className="project-category">
            {project.category} <span>/</span>{" "}
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3>
            <Link to={`/projects/${project.slug}`}>{project.name}</Link>
          </h3>
          <p>{project.summary}</p>
        </div>
        <Status value={project.status} />
      </div>
    </article>
  );
}
