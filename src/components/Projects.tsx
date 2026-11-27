import type { Project } from "../../shared/content";
import ProjectArt from "./ProjectArt";
import { mk, tr } from "../lib/i18n";

// Loyiha holatlari bazada o'zbekcha saqlanadi, saytda sahifa tilida ko'rinadi.
export const STATUS_LABELS = [mk("Ishlayapti"), mk("Ishlab chiqilmoqda"), mk("Tez kunda"), mk("Taqdimot"), mk("Namuna"), mk("Arxiv")];

export function Status({ value }: { value: string }) {
  return (
    <span className={`status ${value === "Ishlayapti" ? "status-live" : ""}`}>
      <i aria-hidden="true" />
      {tr(value)}
    </span>
  );
}

export function ProjectCover({ project, large = false }: { project: Project; large?: boolean }) {
  return project.cover.startsWith("/media/") ? (
    <img className="project-upload" src={project.cover} alt={tr("{name} muqovasi", { name: project.name })} loading="lazy" />
  ) : (
    <ProjectArt kind={project.cover} large={large} demo={project.demo} title={project.name} />
  );
}
