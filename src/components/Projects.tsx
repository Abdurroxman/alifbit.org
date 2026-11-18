import type { Project } from "../../shared/content";
import ProjectArt from "./ProjectArt";

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
    <img className="project-upload" src={project.cover} alt={`${project.name} muqovasi`} loading="lazy" />
  ) : (
    <ProjectArt kind={project.cover} large={large} demo={project.demo} title={project.name} />
  );
}
