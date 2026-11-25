import type {
  Course,
  FaqItem,
  Project,
  Service,
} from "../shared/content.ts";
import { PROMISES, routeMeta } from "../shared/content.ts";
import { escapeHtml } from "./security.ts";

/**
 * Qidiruv tizimlari uchun sahifa: <head> teglari, #root ichidagi matn nusxasi va schema.org ma'lumoti.
 * Matn nusxasi JavaScript ishlatmaydigan robotlar (Yandex, Bing, havola ko'rinishlari) uchun.
 * Brauzerda React ishga tushganda createRoot uni o'z sahifasi bilan almashtiradi.
 */

export type ContentTable = "projects" | "services" | "articles" | "courses";
type Row = Record<string, unknown> & { slug: string; updated_at?: string };
export interface ContentSource {
  list(table: ContentTable): Promise<Row[]>;
  get(table: ContentTable, slug: string): Promise<Row | null>;
}
type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  seoTitle?: string;
  seoDescription?: string;
};
type Crumb = [string, string];
export interface SeoPage {
  status: number;
  title: string;
  description: string;
  path: string;
  type: "website" | "article";
  noindex: boolean;
  body: string;
  crumbs: Crumb[];
  nodes: Record<string, unknown>[];
  modified?: string;
}

export const SITE_NAME = "AlifBit";
const TELEGRAM_URL = "https://t.me/alifbitbot";
const NAV: Crumb[] = [
  ["/", "Bosh sahifa"],
  ["/services", "Xizmatlar"],
  ["/projects", "Loyihalar"],
  ["/courses", "Kurslar"],
  ["/journal", "Qaydlar"],
  ["/about", "Biz haqimizda"],
  ["/contact", "Buyurtma berish"],
];
const SECTION: Record<string, Crumb> = {
  services: ["/services", "Xizmatlar"],
  projects: ["/projects", "Loyihalar"],
  courses: ["/courses", "Kurslar"],
  journal: ["/journal", "Qaydlar"],
};

const e = (value: unknown) => escapeHtml(String(value ?? ""));
const arr = <T>(value: unknown): T[] => (Array.isArray(value) ? value : []);
const list = (items: string[]) =>
  items.length ? `<ul>${items.map((i) => `<li>${e(i)}</li>`).join("")}</ul>` : "";
const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${e(p)}</p>`)
    .join("");
const link = (href: string, label: string) => `<a href="${e(href)}">${e(label)}</a>`;
/** «Sarlavha — AlifBit» dan sahifa sarlavhasi (h1) uchun birinchi qism. */
const heading = (title: string) => title.replace(/\s+—\s+AlifBit$/, "");
const visibleService = (s: Row) => (s as Partial<Service>).published !== false;
const publicPackages = (s: Partial<Service>) =>
  arr<NonNullable<Service["packages"]>[number]>(s.packages).filter((p) => !p.hidden);
/** D1 `CURRENT_TIMESTAMP` («YYYY-MM-DD HH:MM:SS») dan ISO sana. */
export function isoDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined;
  return value.slice(0, 10);
}

function serviceCards(services: Row[]) {
  return services.length
    ? `<ul>${services
        .map((row) => {
          const s = row as unknown as Service;
          return `<li>${link(`/services/${s.slug}`, s.name)} — ${e(s.short || s.description)}</li>`;
        })
        .join("")}</ul>`
    : "";
}
function projectCards(projects: Row[]) {
  return projects.length
    ? `<ul>${projects
        .map((row) => {
          const p = row as unknown as Project;
          return `<li>${link(`/projects/${p.slug}`, p.name)} — ${e(p.summary)}</li>`;
        })
        .join("")}</ul>`
    : "";
}
function faqHtml(faq: FaqItem[]) {
  return faq.length
    ? `<h2>Savol-javoblar</h2><dl>${faq.map((f) => `<dt>${e(f.q)}</dt><dd>${e(f.a)}</dd>`).join("")}</dl>`
    : "";
}
function faqNode(path: string, origin: string, faq: FaqItem[]) {
  return {
    "@type": "FAQPage",
    "@id": `${origin}${path}#faq`,
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
function section(title: string, inner: string) {
  return inner ? `<h2>${e(title)}</h2>${inner}` : "";
}

const notFound = (path: string): SeoPage => ({
  status: 404,
  title: "Sahifa topilmadi — AlifBit",
  description: "Bu sahifa mavjud emas.",
  path,
  type: "website",
  noindex: true,
  body: `<h1>Sahifa topilmadi</h1><p>${link("/", "Bosh sahifaga qaytish")}</p>`,
  crumbs: [],
  nodes: [],
});

/** Yo'l bo'yicha sahifani yig'adi. Noma'lum yoki nashr qilinmagan sahifa 404 bo'ladi. */
export async function buildPage(
  path: string,
  source: ContentSource,
  origin: string,
): Promise<SeoPage> {
  if (path === "/admin" || path.startsWith("/admin/"))
    return {
      ...notFound(path),
      status: 200,
      title: "Boshqaruv — AlifBit",
      description: "AlifBit boshqaruv paneli",
      body: "",
    };
  const parts = path.split("/").filter(Boolean);
  const base = (title: string, description: string): SeoPage => ({
    status: 200,
    title,
    description,
    path,
    type: "website",
    noindex: false,
    body: "",
    crumbs: [],
    nodes: [],
  });

  if (parts.length === 2) {
    const sectionCrumb = SECTION[parts[0]];
    if (!sectionCrumb) return notFound(path);
    const table: ContentTable = parts[0] === "journal" ? "articles" : (parts[0] as ContentTable);
    const row = await source.get(table, parts[1]);
    if (!row || (table === "services" && !visibleService(row))) return notFound(path);
    const url = `${origin}${path}`;
    const modified = isoDate(row.updated_at);

    if (table === "services") {
      const s = row as unknown as Service;
      const page = base(`${s.name} — AlifBit`, s.description || s.short);
      const packages = publicPackages(s);
      page.body =
        `<h1>${e(s.name)}</h1><p>${e(s.short)}</p>${paragraphs(s.description || "")}` +
        section("Ichiga nimalar kiradi", list(arr<string>(s.features))) +
        section(
          "Paketlar",
          packages
            .map(
              (p) =>
                `<h3>${e(p.name)}</h3>${p.fit ? `<p>${e(p.fit)}</p>` : ""}` +
                `<p>${[p.price, p.term].filter(Boolean).map(e).join(" · ")}</p>${list(arr<string>(p.features))}`,
            )
            .join(""),
        ) +
        (s.promises === false
          ? ""
          : section(
              "Har bir loyihada",
              `<ul>${PROMISES.map(([t, d]) => `<li>${e(t)}: ${e(d)}</li>`).join("")}</ul>`,
            )) +
        `<p>${link(`/contact?service=${encodeURIComponent(s.slug)}`, "Buyurtma berish")}</p>`;
      page.crumbs = [sectionCrumb, [path, s.name]];
      page.nodes = [
        {
          "@type": "Service",
          "@id": `${url}#service`,
          name: s.name,
          description: s.description || s.short,
          url,
          serviceType: s.name,
          provider: { "@id": `${origin}/#organization` },
          areaServed: { "@type": "Country", name: "Uzbekistan" },
        },
      ];
      page.modified = modified;
      return page;
    }
    if (table === "projects") {
      const p = row as unknown as Project;
      const page = base(p.seoTitle || `${p.name} — AlifBit`, p.seoDescription || p.summary);
      const faq = arr<FaqItem>(p.faq);
      page.body =
        `<h1>${e(p.name)}</h1><p>${e(p.summary)}</p>` +
        (p.problem ? `<p>${e(p.problem)}</p>` : "") +
        paragraphs(p.description || "") +
        (p.purpose ? `<p>${e(p.purpose)}</p>` : "") +
        section("Imkoniyatlar", list(arr<string>(p.features))) +
        section(
          "Qanday ishlaydi",
          arr<{ title: string; text: string }>(p.steps)
            .map((step) => `<h3>${e(step.title)}</h3><p>${e(step.text)}</p>`)
            .join(""),
        ) +
        section("Kimga mos", list(arr<string>(p.fit))) +
        faqHtml(faq);
      page.crumbs = [sectionCrumb, [path, p.name]];
      page.nodes = faq.length ? [faqNode(path, origin, faq)] : [];
      page.modified = modified;
      return page;
    }
    if (table === "courses") {
      const c = row as unknown as Course;
      const page = base(c.seoTitle || `${c.title} — AlifBit`, c.seoDescription || c.tagline);
      page.body =
        `<h1>${e(c.title)}</h1><p>${e(c.tagline)}</p>${paragraphs(c.description || "")}` +
        `<p>${[c.format, c.start, c.price].filter(Boolean).map(e).join(" · ")}</p>` +
        section(
          "Dastur",
          arr<{ title: string; text: string }>(c.steps)
            .map((step) => `<h3>${e(step.title)}</h3><p>${e(step.text)}</p>`)
            .join(""),
        ) +
        section("Kursda nimalar bor", list(arr<string>(c.contents))) +
        `<p>${link(`/contact?service=kurs-${encodeURIComponent(c.slug)}`, "Kursga yozilish")}</p>`;
      page.crumbs = [sectionCrumb, [path, c.title]];
      page.nodes = [
        {
          "@type": "Course",
          "@id": `${url}#course`,
          name: c.title,
          description: c.description || c.tagline,
          url,
          inLanguage: "uz",
          provider: { "@id": `${origin}/#organization` },
        },
      ];
      page.modified = modified;
      return page;
    }
    const a = row as unknown as Article;
    const page = base(a.seoTitle || `${a.title} — AlifBit`, a.seoDescription || a.summary);
    page.type = "article";
    page.body = `<article><h1>${e(a.title)}</h1><p>${e(a.summary)}</p>${paragraphs(a.body || "")}</article>`;
    page.crumbs = [sectionCrumb, [path, a.title]];
    page.nodes = [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: a.title,
        description: a.summary,
        url,
        inLanguage: "uz",
        articleSection: a.category,
        dateModified: modified,
        author: { "@id": `${origin}/#organization` },
        publisher: { "@id": `${origin}/#organization` },
        mainEntityOfPage: url,
      },
    ];
    page.modified = modified;
    return page;
  }

  const meta = routeMeta[path];
  if (!meta || parts.length > 1) return notFound(path);
  const page = base(meta[0], meta[1]);
  const intro = `<h1>${e(heading(meta[0]))}</h1><p>${e(meta[1])}</p>`;
  if (path === "/") {
    const [services, projects] = await Promise.all([
      source.list("services"),
      source.list("projects"),
    ]);
    page.body =
      `<h1>${e(heading(meta[0]))}</h1><p>${e(meta[1])}</p>` +
      section("Xizmatlar", serviceCards(services.filter(visibleService))) +
      section("Loyihalar va namunalar", projectCards(projects));
    return page;
  }
  page.crumbs = [[path, heading(meta[0])]];
  if (path === "/services") {
    const services = (await source.list("services")).filter(visibleService);
    page.body = intro + serviceCards(services);
  } else if (path === "/projects") {
    page.body = intro + projectCards(await source.list("projects"));
  } else if (path === "/courses") {
    const courses = await source.list("courses");
    page.body =
      intro +
      (courses.length
        ? `<ul>${courses
            .map((row) => {
              const c = row as unknown as Course;
              return `<li>${link(`/courses/${c.slug}`, c.title)} — ${e(c.tagline)}</li>`;
            })
            .join("")}</ul>`
        : "");
  } else if (path === "/journal") {
    const articles = await source.list("articles");
    page.body =
      intro +
      (articles.length
        ? `<ul>${articles
            .map((row) => {
              const a = row as unknown as Article;
              return `<li>${link(`/journal/${a.slug}`, a.title)} — ${e(a.summary)}</li>`;
            })
            .join("")}</ul>`
        : "");
  } else page.body = intro;
  return page;
}

/** Butun sayt uchun umumiy schema.org tugunlari: kompaniya va sayt. */
export function siteNodes(origin: string, email?: string) {
  return [
    {
      "@type": "ProfessionalService",
      "@id": `${origin}/#organization`,
      name: SITE_NAME,
      url: `${origin}/`,
      logo: `${origin}/brand/logo.png`,
      image: `${origin}/brand/social.png`,
      description: routeMeta["/"][1],
      areaServed: [
        { "@type": "City", name: "Toshkent" },
        { "@type": "Country", name: "Uzbekistan" },
      ],
      knowsLanguage: "uz",
      ...(email ? { email } : {}),
      sameAs: [TELEGRAM_URL],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        url: TELEGRAM_URL,
        availableLanguage: "uz",
        ...(email ? { email } : {}),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      name: SITE_NAME,
      url: `${origin}/`,
      inLanguage: "uz",
      publisher: { "@id": `${origin}/#organization` },
    },
  ];
}

const HEAD_TAGS = [
  /<title>[\s\S]*?<\/title>\s*/g,
  /<meta\s+name="(?:description|robots|twitter:[^"]+)"[^>]*>\s*/g,
  /<meta\s+property="og:[^"]+"[^>]*>\s*/g,
  /<link\s+rel="canonical"[^>]*>\s*/g,
  /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/g,
];
/** Matn nusxasi React yuklanguncha bir lahza ko'rinadi: shrift va ranglar saytnikiga yaqin, oddiy o'qiladigan sahifa. */
const SNAPSHOT_STYLE =
  "<style>.seo-snapshot{max-width:760px;margin:0 auto;padding:96px 20px 64px;line-height:1.6;font-family:Manrope,system-ui,sans-serif}" +
  ".seo-snapshot a{color:inherit}.seo-snapshot nav a,.seo-snapshot footer a{margin-right:14px}.seo-snapshot h1{font-size:2rem;line-height:1.2}</style>";

/** index.html dagi standart teglarni olib tashlab, sahifaga xos teglar, matn va schema.org ni qo'yadi. */
export function renderHtml(
  html: string,
  page: SeoPage,
  origin: string,
  options: { email?: string } = {},
) {
  const url = `${origin}${page.path}`;
  const image = `${origin}/brand/social.png`;
  const robots = page.noindex
    ? "noindex,nofollow"
    : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
  const head = [
    `<title>${e(page.title)}</title>`,
    `<meta name="description" content="${e(page.description)}"/>`,
    `<meta name="robots" content="${robots}"/>`,
    `<link rel="canonical" href="${e(url)}"/>`,
    `<link rel="alternate" hreflang="uz" href="${e(url)}"/>`,
    `<meta property="og:type" content="${page.type}"/>`,
    `<meta property="og:site_name" content="${SITE_NAME}"/>`,
    `<meta property="og:locale" content="uz_UZ"/>`,
    `<meta property="og:url" content="${e(url)}"/>`,
    `<meta property="og:title" content="${e(page.title)}"/>`,
    `<meta property="og:description" content="${e(page.description)}"/>`,
    `<meta property="og:image" content="${e(image)}"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${e(page.title)}"/>`,
    `<meta name="twitter:description" content="${e(page.description)}"/>`,
    `<meta name="twitter:image" content="${e(image)}"/>`,
  ];
  if (page.modified && page.type === "article")
    head.push(`<meta property="article:modified_time" content="${e(page.modified)}"/>`);
  if (!page.noindex) {
    const crumbs: Crumb[] = page.crumbs.length ? [["/", "Bosh sahifa"], ...page.crumbs] : [];
    const graph: Record<string, unknown>[] = [
      ...siteNodes(origin, options.email),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "uz",
        isPartOf: { "@id": `${origin}/#website` },
        about: { "@id": `${origin}/#organization` },
        ...(page.modified ? { dateModified: page.modified } : {}),
        ...(crumbs.length ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
      },
      ...(crumbs.length
        ? [
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: crumbs.map(([href, name], i) => ({
                "@type": "ListItem",
                position: i + 1,
                name,
                item: `${origin}${href}`,
              })),
            },
          ]
        : []),
      ...page.nodes,
    ];
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph })
      // </script> va HTML izohlari JSON ichida skriptni yopib qo'ymasligi uchun.
      .replace(/</g, "\\u003c");
    head.push(`<script type="application/ld+json">${json}</script>`);
  }
  if (page.body) head.push(SNAPSHOT_STYLE);
  let out = html;
  for (const pattern of HEAD_TAGS) out = out.replace(pattern, "");
  out = out.replace("</head>", `${head.join("")}</head>`);
  if (page.body) {
    const nav = `<nav>${NAV.map(([href, label]) => link(href, label)).join("")}</nav>`;
    const footer = `<footer><p>${SITE_NAME} — sayt, Telegram bot, AI yordamchi va ilovalar yaratish. ${link(TELEGRAM_URL, "Telegram: @alifbitbot")}</p></footer>`;
    out = out.replace(
      /<div id="root">\s*<\/div>/,
      `<div id="root"><div class="seo-snapshot">${nav}<main>${page.body}</main>${footer}</div></div>`,
    );
  }
  return out;
}

/** sitemap.xml: statik sahifalar va nashr qilingan kontent, bor joyda oxirgi o'zgarish sanasi bilan. */
export async function buildSitemap(source: ContentSource, origin: string) {
  const [projects, services, articles, courses] = await Promise.all([
    source.list("projects"),
    source.list("services"),
    source.list("articles"),
    source.list("courses"),
  ]);
  const entries: Array<[string, string | undefined]> = [
    ...Object.keys(routeMeta).map((route): [string, undefined] => [route, undefined]),
    ...services.filter(visibleService).map((s): [string, string | undefined] => [`/services/${s.slug}`, isoDate(s.updated_at)]),
    ...projects.map((p): [string, string | undefined] => [`/projects/${p.slug}`, isoDate(p.updated_at)]),
    ...courses.map((c): [string, string | undefined] => [`/courses/${c.slug}`, isoDate(c.updated_at)]),
    ...articles.map((a): [string, string | undefined] => [`/journal/${a.slug}`, isoDate(a.updated_at)]),
  ];
  return (
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    entries
      .map(
        ([route, lastmod]) =>
          `<url><loc>${e(origin + route)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`,
      )
      .join("") +
    `</urlset>`
  );
}
