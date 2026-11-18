import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildPage,
  buildSitemap,
  renderHtml,
  type ContentSource,
  type ContentTable,
} from "../server/seo.ts";
import { orderEmail, sendOrderEmail } from "../server/mail.ts";

const ORIGIN = "https://alifbit.org";
const INDEX = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const rows: Record<ContentTable, Array<Record<string, unknown> & { slug: string }>> = {
  services: [
    {
      slug: "veb-sayt",
      name: "Sayt yaratish",
      short: "Kompaniya sayti va internet-do‘kon",
      description: "Sayt tavsifi <b>qalin</b>",
      features: ["Telefonga moslashgan"],
      packages: [
        { name: "Start", price: "1 mln", term: "7 kun", features: ["1 sahifa"], recommended: false },
        { name: "Yashirin paket", price: "9", term: "1", features: [], recommended: false, hidden: true },
      ],
      updated_at: "2026-11-18 10:00:00",
    },
    { slug: "yopiq", name: "Yopiq xizmat", short: "x", description: "x", published: false },
  ],
  projects: [
    {
      slug: "bot",
      name: "Yozilish boti </script><script>alert(1)</script>",
      summary: "Mijozlar o‘zi yoziladi",
      description: "Tavsif",
      features: [],
      faq: [{ q: "Qancha turadi?", a: "Ishga qarab" }],
      updated_at: "2026-11-17 09:00:00",
    },
  ],
  courses: [],
  articles: [],
};
const source: ContentSource = {
  async list(table) {
    return rows[table];
  },
  async get(table, slug) {
    return rows[table].find((r) => r.slug === slug) ?? null;
  },
};

const count = (html: string, pattern: RegExp) => (html.match(pattern) || []).length;

test("each page replaces the multi-line index.html tags exactly once", async () => {
  const page = await buildPage("/services/veb-sayt", source, ORIGIN);
  const html = renderHtml(INDEX, page, ORIGIN);
  assert.equal(page.status, 200);
  assert.equal(count(html, /<title>/g), 1);
  assert.equal(count(html, /name="description"/g), 1);
  assert.equal(count(html, /property="og:title"/g), 1);
  assert.equal(count(html, /property="og:description"/g), 1);
  assert.equal(count(html, /rel="canonical"/g), 1);
  assert.equal(count(html, /application\/ld\+json/g), 1);
  assert.match(html, /<title>Sayt yaratish — AlifBit<\/title>/);
  assert.match(html, /<meta name="description" content="Sayt tavsifi &lt;b&gt;qalin&lt;\/b&gt;"\/>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/alifbit.org\/services\/veb-sayt"\/>/);
  assert.doesNotMatch(html, /Avval tinglaymiz/);
});

test("server snapshot carries page text, hides hidden packages and escapes content", async () => {
  const html = renderHtml(INDEX, await buildPage("/services/veb-sayt", source, ORIGIN), ORIGIN);
  assert.match(html, /<div id="root"><div class="seo-snapshot">/);
  assert.match(html, /<h1>Sayt yaratish<\/h1>/);
  assert.match(html, /Start/);
  assert.doesNotMatch(html, /Yashirin paket/);
  assert.match(html, /href="\/contact\?service=veb-sayt"/);

  const project = renderHtml(INDEX, await buildPage("/projects/bot", source, ORIGIN), ORIGIN);
  assert.doesNotMatch(project, /<script>alert/);
  const json = project.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1];
  assert.doesNotMatch(json, /<\/script/i);
  const data = JSON.parse(json);
  const types = data["@graph"].map((n: { "@type": string }) => n["@type"]);
  assert.deepEqual(types, ["ProfessionalService", "WebSite", "WebPage", "BreadcrumbList", "FAQPage"]);
});

test("home page lists only published services and links to projects", async () => {
  const html = renderHtml(INDEX, await buildPage("/", source, ORIGIN), ORIGIN, {
    email: "info@alifbit.org",
  });
  assert.match(html, /href="\/services\/veb-sayt"/);
  assert.doesNotMatch(html, /Yopiq xizmat/);
  assert.match(html, /href="\/projects\/bot"/);
  assert.match(html, /"email":"info@alifbit.org"/);
  assert.match(html, /max-image-preview:large/);
});

test("unknown, unpublished and admin pages are not indexed", async () => {
  for (const path of ["/yoq", "/services/yopiq", "/projects/yoq", "/about/x"]) {
    const page = await buildPage(path, source, ORIGIN);
    assert.equal(page.status, 404, path);
    const html = renderHtml(INDEX, page, ORIGIN);
    assert.match(html, /<meta name="robots" content="noindex,nofollow"\/>/);
    assert.doesNotMatch(html, /ld\+json/);
  }
  const admin = await buildPage("/admin/orders", source, ORIGIN);
  assert.equal(admin.status, 200);
  const html = renderHtml(INDEX, admin, ORIGIN);
  assert.match(html, /noindex,nofollow/);
  assert.match(html, /<div id="root"><\/div>/);
});

test("sitemap has published pages with lastmod", async () => {
  const xml = await buildSitemap(source, ORIGIN);
  assert.match(xml, /<url><loc>https:\/\/alifbit.org\/services\/veb-sayt<\/loc><lastmod>2026-11-18<\/lastmod><\/url>/);
  assert.match(xml, /<loc>https:\/\/alifbit.org\/<\/loc>/);
  assert.doesNotMatch(xml, /yopiq/);
});

test("order email replies to the customer only when the contact is an email", async () => {
  const order = {
    reference: "AB-2026-1",
    name: "Ali",
    contact: "ali@example.com",
    service: "veb-sayt",
    description: "Sayt kerak",
    budget: "",
    deadline: "",
    attachment: false,
  };
  assert.equal(orderEmail(order, ORIGIN).replyTo, "ali@example.com");
  assert.equal(orderEmail({ ...order, contact: "@ali" }, ORIGIN).replyTo, undefined);
  assert.doesNotMatch(orderEmail(order, ORIGIN).text, /Byudjet/);

  assert.equal(await sendOrderEmail({ PUBLIC_ORIGIN: ORIGIN }, order), false);
  const sent: unknown[] = [];
  const ok = await sendOrderEmail(
    {
      PUBLIC_ORIGIN: ORIGIN,
      NOTIFY_EMAIL: "owner@example.com",
      PUBLIC_EMAIL: "info@alifbit.org",
      SEND_EMAIL: { send: async (m: unknown) => (sent.push(m), { messageId: "1" }) } as unknown as SendEmail,
    },
    order,
  );
  assert.equal(ok, true);
  assert.deepEqual(
    (sent[0] as { to: string; replyTo: string; subject: string }).to,
    "owner@example.com",
  );
  assert.equal((sent[0] as { replyTo: string }).replyTo, "ali@example.com");
  const failed = await sendOrderEmail(
    {
      PUBLIC_ORIGIN: ORIGIN,
      NOTIFY_EMAIL: "owner@example.com",
      PUBLIC_EMAIL: "info@alifbit.org",
      SEND_EMAIL: { send: async () => { throw new Error("not verified"); } } as unknown as SendEmail,
    },
    order,
  );
  assert.equal(failed, false);
});
