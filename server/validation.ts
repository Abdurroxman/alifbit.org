import { z } from "zod";
import {
  projectCovers,
  projectStatuses,
  orderStatuses,
  serviceIcons,
} from "../shared/content.ts";
import { safeUrl, validSlug } from "./security.ts";
import { LANGS, mk } from "../shared/i18n.ts";
const text = (max: number) => z.string().trim().max(max);
const slug = text(100).refine(
  validSlug,
  mk("Manzil faqat kichik lotin harflari, raqam va chiziqchadan iborat bo‘lsin."),
);
export const orderSchema = z.object({
  name: text(100).min(2, mk("Ismingizni kiriting.")),
  contact: text(150)
    .min(4)
    .refine(
      (v) =>
        /^@[A-Za-z0-9_]{4,32}$/.test(v) ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
        /^\+?[\d\s()-]{7,25}$/.test(v),
      mk("Email, @telegram yoki telefon raqamini to‘g‘ri kiriting."),
    ),
  service: slug,
  description: text(6000).min(20, mk("Loyihangiz haqida kamida 20 belgi yozing.")),
  budget: text(100).default(""),
  deadline: z
    .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
    .default(""),
  consent: z.literal("yes"),
  website: z.literal("").default(""),
  lang: z.enum(LANGS).default("uz"),
});
const demoCard = z.object({
  title: text(120).min(1),
  lines: z.array(text(200).min(1)).max(8).default([]),
});
const demoNode = z.object({
  id: text(40).regex(/^[a-z0-9-]+$/, "Demo qadami id'si: kichik lotin harf, raqam, chiziqcha."),
  messages: z.array(text(600).min(1)).min(1).max(4),
  card: demoCard.optional(),
  buttons: z
    .array(z.object({ label: text(60).min(1), next: text(40).min(1) }))
    .max(4)
    .default([]),
  owner: demoCard.optional(),
});
/** Demo grafigi: id'lar takrorlanmaydi, boshlanish va har bir tugma mavjud qadamga olib boradi. */
export const demoSchema = z
  .object({
    bot: text(60).min(2),
    start: text(40).min(1),
    nodes: z.array(demoNode).min(1).max(20),
  })
  .superRefine((demo, ctx) => {
    const ids = new Set<string>();
    for (const n of demo.nodes) {
      if (ids.has(n.id)) ctx.addIssue({ code: "custom", message: `Demo qadami takrorlangan: ${n.id}` });
      ids.add(n.id);
    }
    if (!ids.has(demo.start))
      ctx.addIssue({ code: "custom", message: `Demo boshlanadigan qadam topilmadi: ${demo.start}` });
    for (const n of demo.nodes)
      for (const b of n.buttons)
        if (!ids.has(b.next))
          ctx.addIssue({ code: "custom", message: `«${b.label}» tugmasi yo‘q qadamga olib boradi: ${b.next}` });
  });
export const projectSchema = z.object({
  id: text(100).min(1),
  slug,
  name: text(150).min(2),
  category: text(80).min(2),
  status: z.string().refine((v) => projectStatuses.includes(v)),
  summary: text(500).min(10),
  description: text(12000).min(20),
  purpose: text(6000).min(10),
  features: z.array(text(250).min(1)).min(1).max(20),
  platforms: z.array(text(80).min(1)).max(12),
  cover: text(250).refine(
    (v) =>
      (projectCovers as readonly string[]).includes(v) ||
      /^\/media\/public\/[a-f0-9-]+\.(png|jpg|webp)$/.test(v),
  ),
  url: text(1000).refine(
    (v) => !v || !!safeUrl(v),
    "Havola http yoki https bilan boshlansin.",
  ),
  published: z.boolean(),
  seoTitle: text(160).optional(),
  seoDescription: text(350).optional(),
  service: text(100).default(""),
  problem: text(2000).default(""),
  steps: z
    .array(z.object({ title: text(120).min(2), text: text(400).default("") }))
    .max(8)
    .default([]),
  customerView: z.array(text(250).min(1)).max(10).default([]),
  ownerView: z.array(text(250).min(1)).max(10).default([]),
  beforeAfter: z
    .array(z.object({ before: text(300).min(1), after: text(300).min(1) }))
    .max(8)
    .default([]),
  fit: z.array(text(160).min(1)).max(12).default([]),
  faq: z
    .array(z.object({ q: text(300).min(1), a: text(1200).min(1) }))
    .max(10)
    .default([]),
  demo: demoSchema.optional(),
});
/** Admin yuklagan rasm yoki bo'sh qiymat. */
const mediaImage = text(250)
  .refine((v) => !v || /^\/media\/public\/[a-f0-9-]+\.(png|jpg|webp)$/.test(v), "Misol rasmi yuklangan fayl bo‘lsin.")
  .default("");
export const serviceSchema = z.object({
  slug,
  number: z.string().regex(/^\d{2}$/),
  name: text(100).min(2),
  short: text(300).min(5),
  description: text(6000).min(20),
  features: z.array(text(250).min(1)).min(1).max(20),
  icon: z.enum(serviceIcons),
  price: text(100).default(""),
  term: text(100).default(""),
  packages: z
    .array(
      z.object({
        name: text(100).min(2, "Paket nomini kiriting."),
        price: text(100).default(""),
        term: text(100).default(""),
        features: z.array(text(250).min(1)).max(20),
        recommended: z.boolean().default(false),
        fit: text(160).default(""),
        hidden: z.boolean().default(false),
      }),
    )
    .max(6)
    .default([]),
  examples: z
    .array(
      z.object({
        name: text(120).min(2, "Misol nomini kiriting."),
        owner: text(120).default(""),
        text: text(400).default(""),
        url: text(1000).refine((v) => !!safeUrl(v), "Misol havolasi http yoki https bilan boshlansin."),
        image: mediaImage,
        imageMobile: mediaImage,
      }),
    )
    .max(8)
    .default([]),
  published: z.boolean().default(true),
  promises: z.boolean().optional(),
});
export const courseSchema = z.object({
  id: text(100).min(1),
  slug,
  title: text(150).min(2),
  tagline: text(300).min(5),
  description: text(6000).min(20),
  price: text(100).default(""),
  format: text(100).default(""),
  start: text(100).default(""),
  steps: z
    .array(z.object({ title: text(120).min(2), text: text(400).default("") }))
    .max(6),
  contents: z.array(text(250).min(1)).max(30),
  published: z.boolean(),
  need: text(160).default(""),
  seoTitle: text(160).optional(),
  seoDescription: text(350).optional(),
});
export const articleSchema = z.object({
  id: text(100).min(1),
  slug,
  title: text(200).min(3),
  summary: text(500).min(10),
  body: text(40000).min(20),
  category: text(100).min(2),
  published: z.boolean(),
  seoTitle: text(160).optional(),
  seoDescription: text(350).optional(),
});
export const orderStatusSchema = z.object({
  status: z.string().refine((v) => orderStatuses.includes(v)),
});
