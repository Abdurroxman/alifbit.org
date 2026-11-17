import {
  initialProjects,
  initialServices,
  type Course,
  type Project,
  type Service,
} from "../../shared/content";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...init });
  const data = (await response
    .json()
    .catch(() => ({ error: "Server javobini o‘qib bo‘lmadi." }))) as {
    error?: string;
  };
  if (!response.ok)
    throw new Error(data.error || "Amal bajarilmadi. Qayta urinib ko‘ring.");
  return data as T;
}
export async function getProjects(): Promise<Project[]> {
  return api<Project[]>("/api/projects");
}
export async function getServices(): Promise<Service[]> {
  return api<Service[]>("/api/services");
}
export async function getCourses(): Promise<Course[]> {
  return api<Course[]>("/api/courses");
}
export { initialProjects, initialServices };
