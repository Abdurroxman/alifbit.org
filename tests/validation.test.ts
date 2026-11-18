import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { courseSchema, demoSchema, orderSchema, projectSchema, serviceSchema } from "../server/validation.ts";
import { initialProjects, initialServices, type Course } from "../shared/content.ts";

const course: Course = {
  id: "vayb-koding",
  slug: "vayb-koding",
  title: "Vayb koding",
  tagline: "AI bilan sayt va Telegram bot yasang.",
  description: "Kurs tavsifi kamida yigirma belgidan iborat bo‘lishi kerak.",
  price: "1 200 000 so‘m",
  format: "Onlayn",
  start: "",
  steps: [{ title: "Reja tuzish", text: "G‘oyani topshiriqqa aylantirish." }],
  contents: ["Sayt yasash"],
  published: false,
};

test("services accept prices and packages, and stay valid without them", () => {
  const plain = serviceSchema.safeParse(initialServices[0]);
  assert.equal(plain.success, true);
  assert.deepEqual(plain.success && plain.data.packages, []);
  assert.equal(plain.success && plain.data.price, "");
  const priced = serviceSchema.safeParse({
    ...initialServices[0],
    price: "1 200 000 so‘mdan",
    term: "2 haftadan",
    packages: [
      { name: "Landing", price: "1 200 000 so‘mdan", term: "", features: ["Bitta sahifa"], recommended: true },
      { name: "Internet-do‘kon", price: "", term: "", features: [] },
    ],
  });
  assert.equal(priced.success, true);
  assert.equal(priced.success && priced.data.packages[1].recommended, false);
});

test("services reject unknown icons, nameless packages and too many packages", () => {
  assert.equal(serviceSchema.safeParse({ ...initialServices[0], icon: "film" }).success, false);
  assert.equal(
    serviceSchema.safeParse({ ...initialServices[0], packages: [{ name: "", features: [] }] }).success,
    false,
  );
  const many = Array.from({ length: 7 }, (_, i) => ({ name: `Paket ${i}`, features: [] }));
  assert.equal(serviceSchema.safeParse({ ...initialServices[0], packages: many }).success, false);
});

test("courses validate slug, required texts and step limits", () => {
  assert.equal(courseSchema.safeParse(course).success, true);
  assert.equal(courseSchema.safeParse({ ...course, slug: "../admin" }).success, false);
  assert.equal(courseSchema.safeParse({ ...course, tagline: "" }).success, false);
  const steps = Array.from({ length: 7 }, (_, i) => ({ title: `Qadam ${i}`, text: "" }));
  assert.equal(courseSchema.safeParse({ ...course, steps }).success, false);
});

test("course sign-up uses a slug-safe service value", () => {
  const order = {
    name: "Test User",
    contact: "@id799",
    service: "kurs-vayb-koding",
    description: "Kursga yozilmoqchiman, batafsil ma’lumot kerak.",
    consent: "yes",
    website: "",
  };
  assert.equal(orderSchema.safeParse(order).success, true);
});

test("package fit and hidden flag, service published flag and course need have safe defaults", () => {
  const parsed = serviceSchema.safeParse({
    ...initialServices[0],
    published: false,
    packages: [{ name: "Landing", price: "", term: "", features: [], recommended: false, fit: "Bitta sahifa kerak", hidden: true }],
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.success && parsed.data.packages[0].fit, "Bitta sahifa kerak");
  assert.equal(parsed.success && parsed.data.packages[0].hidden, true);
  assert.equal(parsed.success && parsed.data.published, false);
  const bare = serviceSchema.safeParse({ ...initialServices[0], published: undefined, packages: [{ name: "Landing", features: [] }] });
  assert.equal(bare.success && bare.data.published, true);
  assert.equal(bare.success && bare.data.packages[0].fit, "");
  assert.equal(bare.success && bare.data.packages[0].hidden, false);
  assert.equal(serviceSchema.safeParse({ ...initialServices[0], packages: [{ name: "Landing", features: [], fit: "x".repeat(161) }] }).success, false);
  assert.equal(courseSchema.safeParse({ ...course, need: "O‘zim yasashni o‘rganmoqchiman" }).success, true);
});

test("every built-in service passes the admin schema", () => {
  assert.equal(initialServices.length, 10);
  for (const s of initialServices) assert.equal(serviceSchema.safeParse(s).success, true, s.slug);
  assert.equal(new Set(initialServices.map((s) => s.number)).size, initialServices.length);
});

test("migration 0007 services pass the schema; built-in texts match the database after all migrations", () => {
  const sql = readFileSync(new URL("../db/migrations/0007_full_services.sql", import.meta.url), "utf8");
  const rows = [...sql.matchAll(/'(\{"slug":.*?\})',/g)].map((m) => JSON.parse(m[1].replace(/''/g, "'")));
  assert.equal(rows.length, 8);
  for (const row of rows) {
    const parsed = serviceSchema.safeParse(row);
    assert.equal(parsed.success, true, row.slug);
    assert.ok(row.packages.length > 0, row.slug);
  }
  assert.match(sql, /UPDATE projects SET published=0,data=json_set\(data,'\$\.published',json\('false'\)\)/);
  // Keyingi migratsiyalar matnlarni o'zgartiradi: kod ichidagi boshlang'ich matnlar yakuniy baza holatiga teng bo'lishi kerak.
  const dir = new URL("../db/migrations/", import.meta.url);
  const db = new DatabaseSync(":memory:");
  for (const file of readdirSync(dir).filter((f: string) => f.endsWith(".sql")).sort()) db.exec(readFileSync(new URL(file, dir), "utf8"));
  const final = db.prepare("SELECT data FROM services ORDER BY rowid").all().map((r: Record<string, unknown>) => JSON.parse(String(r.data)));
  assert.equal(final.length, initialServices.length);
  for (const row of final) {
    assert.equal(serviceSchema.safeParse(row).success, true, row.slug);
    const base = initialServices.find((s) => s.slug === row.slug);
    assert.ok(base, row.slug);
    const { price, term, packages, examples, ...texts } = row;
    assert.deepEqual(texts, base);
  }
});

const demo = {
  bot: "Qabulxona",
  start: "a",
  nodes: [
    { id: "a", messages: ["Salom!"], buttons: [{ label: "Yozilish", next: "b" }] },
    { id: "b", messages: ["Tayyor."], buttons: [], owner: { title: "Yangi yozilish", lines: ["Ertaga 10:00"] } },
  ],
};

test("projects without solution fields still pass and get empty defaults", () => {
  const parsed = projectSchema.safeParse(initialProjects[0]);
  assert.equal(parsed.success, true);
  assert.equal(parsed.success && parsed.data.service, "");
  assert.deepEqual(parsed.success && parsed.data.steps, []);
  assert.deepEqual(parsed.success && parsed.data.faq, []);
  assert.equal(parsed.success && parsed.data.demo, undefined);
});

test("solution projects accept a demo whose buttons lead to existing steps", () => {
  const parsed = projectSchema.safeParse({ ...initialProjects[0], status: "Namuna", cover: "demo", demo });
  assert.equal(parsed.success, true);
  assert.equal(parsed.success && parsed.data.demo?.nodes[1].owner?.title, "Yangi yozilish");
});

test("demo graph rejects broken links, duplicate ids and a missing start", () => {
  const broken = { ...demo, nodes: [{ ...demo.nodes[0], buttons: [{ label: "Yozilish", next: "z" }] }, demo.nodes[1]] };
  assert.equal(demoSchema.safeParse(broken).success, false);
  assert.equal(demoSchema.safeParse({ ...demo, nodes: [demo.nodes[0], { ...demo.nodes[1], id: "a" }] }).success, false);
  assert.equal(demoSchema.safeParse({ ...demo, start: "x" }).success, false);
  assert.equal(demoSchema.safeParse({ ...demo, nodes: [{ ...demo.nodes[0], id: "A B" }, demo.nodes[1]] }).success, false);
});

test("service examples need a name and a safe link; images must be uploaded files", () => {
  const ok = {
    name: "Savdo boti",
    owner: "Do‘kon · O‘zbekiston",
    text: "Buyurtma qabul qiladi.",
    url: "https://t.me/example_bot",
    image: "/media/public/0b6c8a52-1d7e-4f6a-9f43-2a6f1d3c9e10.webp",
  };
  const parsed = serviceSchema.safeParse({ ...initialServices[0], examples: [ok, { name: "Sayt", url: "https://example.uz" }] });
  assert.equal(parsed.success, true);
  assert.equal(parsed.success && parsed.data.examples[1].image, "");
  assert.deepEqual(serviceSchema.safeParse(initialServices[0]).success && serviceSchema.parse(initialServices[0]).examples, []);
  const bad = (patch: object) => serviceSchema.safeParse({ ...initialServices[0], examples: [{ ...ok, ...patch }] }).success;
  assert.equal(bad({ url: "javascript:alert(1)" }), false);
  assert.equal(bad({ url: "" }), false);
  assert.equal(bad({ name: "" }), false);
  assert.equal(bad({ image: "https://evil.example/x.png" }), false);
  assert.equal(bad({ image: "/media/public/../x.png" }), false);
  const many = Array.from({ length: 9 }, () => ok);
  assert.equal(serviceSchema.safeParse({ ...initialServices[0], examples: many }).success, false);
});

test("examples seeded by migration 0010 pass the service schema", () => {
  const sql = readFileSync(new URL("../db/migrations/0010_service_examples.sql", import.meta.url), "utf8");
  const lists = [...sql.matchAll(/json\('((?:[^']|'')*)'\)/g)].map((m) => JSON.parse(m[1].replace(/''/g, "'")));
  assert.equal(lists.length, 8);
  for (const examples of lists) {
    const parsed = serviceSchema.safeParse({ ...initialServices[0], examples });
    assert.equal(parsed.success, true, parsed.success ? "" : parsed.error.issues[0].message);
    assert.equal(examples.length, 4);
  }
});

test("service examples accept an uploaded phone screenshot next to the laptop one", () => {
  const ex = { name: "Bot", url: "https://t.me/example_bot", imageMobile: "/media/public/0b6c8a52-1d7e-4f6a-9f43-2a6f1d3c9e10.png" };
  const parsed = serviceSchema.safeParse({ ...initialServices[0], examples: [ex] });
  assert.equal(parsed.success, true);
  assert.equal(parsed.success && parsed.data.examples[0].image, "");
  assert.equal(serviceSchema.safeParse({ ...initialServices[0], examples: [{ ...ex, imageMobile: "/images/x.png" }] }).success, false);
});
