import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { courseSchema, orderSchema, serviceSchema } from "../server/validation.ts";
import { initialServices, type Course } from "../shared/content.ts";

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
  assert.equal(initialServices.length, 8);
  for (const s of initialServices) assert.equal(serviceSchema.safeParse(s).success, true, s.slug);
  assert.equal(new Set(initialServices.map((s) => s.number)).size, initialServices.length);
});

test("migration 0007 services pass the schema and match the built-in texts", () => {
  const sql = readFileSync(new URL("../db/migrations/0007_full_services.sql", import.meta.url), "utf8");
  const rows = [...sql.matchAll(/'(\{"slug":.*?\})',/g)].map((m) => JSON.parse(m[1].replace(/''/g, "'")));
  assert.equal(rows.length, initialServices.length);
  for (const row of rows) {
    const parsed = serviceSchema.safeParse(row);
    assert.equal(parsed.success, true, row.slug);
    assert.ok(row.packages.length > 0, row.slug);
    const base = initialServices.find((s) => s.slug === row.slug);
    assert.ok(base, row.slug);
    const { price, term, packages, ...texts } = row;
    assert.deepEqual(texts, base);
  }
  assert.match(sql, /UPDATE projects SET published=0,data=json_set\(data,'\$\.published',json\('false'\)\)/);
});
