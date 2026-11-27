import {
  initialProjects,
  initialServices,
  type Course,
  type Project,
  type Service,
} from "../../shared/content";
import { lang, tr } from "./i18n";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Server xato xabarini sahifa tilida qaytaradi.
  const headers = new Headers(init?.headers);
  headers.set("x-lang", lang);
  const response = await fetch(path, { credentials: "same-origin", ...init, headers });
  const data = (await response
    .json()
    .catch(() => ({ error: tr("Server javobini o‘qib bo‘lmadi.") }))) as {
    error?: string;
  };
  if (!response.ok)
    throw new Error(data.error || tr("Amal bajarilmadi. Qayta urinib ko‘ring."));
  return data as T;
}
/** Ochiq kontent sahifa tilida keladi. */
const withLang = (path: string) => (lang === "uz" ? path : `${path}?lang=${lang}`);
export async function getProjects(): Promise<Project[]> {
  return api<Project[]>(withLang("/api/projects"));
}
/** Xizmatlar saytda tartib raqami bo'yicha chiqadi. */
const byNumber = (list: Service[]) => [...list].sort((a, b) => a.number.localeCompare(b.number));
export async function getServices(): Promise<Service[]> {
  return byNumber(await api<Service[]>(withLang("/api/services")));
}
export async function getArticles<T>(): Promise<T[]> {
  return api<T[]>(withLang("/api/articles"));
}
export async function getCourses(): Promise<Course[]> {
  return api<Course[]>(withLang("/api/courses"));
}
// Boshlang'ich ro'yxat o'zbekcha: boshqa tilda API javobi kutiladi.
const publicProjects = lang === "uz" ? initialProjects.filter((p) => p.published) : [];
const publicServices = lang === "uz" ? byNumber(initialServices.filter((s) => s.published !== false)) : [];
export { publicProjects as initialProjects, publicServices as initialServices };
