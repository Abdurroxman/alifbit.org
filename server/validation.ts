import { z } from "zod";
import {
  projectCovers,
  projectStatuses,
  orderStatuses,
  serviceIcons,
} from "../shared/content.ts";
import { safeUrl, validSlug } from "./security.ts";
const text = (max: number) => z.string().trim().max(max);
const slug = text(100).refine(
  validSlug,
  "Manzil faqat kichik lotin harflari, raqam va chiziqchadan iborat bo‘lsin.",
);
export const orderSchema = z.object({
  name: text(100).min(2, "Ismingizni kiriting."),
  contact: text(150)
    .min(4)
    .refine(
      (v) =>
        /^@[A-Za-z0-9_]{4,32}$/.test(v) ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
        /^\+?[\d\s()-]{7,25}$/.test(v),
      "Email, @telegram yoki telefon raqamini to‘g‘ri kiriting.",
    ),
  service: slug,
  description: text(6000).min(20, "Loyihangiz haqida kamida 20 belgi yozing."),
  budget: text(100).default(""),
  deadline: z
    .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
    .default(""),
  consent: z.literal("yes"),
  website: z.literal("").default(""),
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
});
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
      }),
    )
    .max(6)
    .default([]),
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
