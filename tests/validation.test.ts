import test from "node:test";
import assert from "node:assert/strict";
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
