/**
 * Yangi murojaat haqida egasiga email: Cloudflare Email Routing'ning `send_email` binding'i orqali.
 * Xat faqat Email Routing'da tasdiqlangan manzilga (NOTIFY_EMAIL) boradi — bu bepul tarifda ishlaydi.
 * Telegram xabari asosiy kanal bo'lib qoladi; email yuborilmasa murojaat saqlanishiga ta'sir qilmaydi.
 */
import { LANG_LABEL_UZ, type Lang } from "../shared/i18n.ts";

export interface MailEnv {
  SEND_EMAIL?: SendEmail;
  NOTIFY_EMAIL?: string;
  PUBLIC_EMAIL?: string;
  PUBLIC_ORIGIN: string;
}
export interface OrderMail {
  reference: string;
  name: string;
  contact: string;
  service: string;
  description: string;
  budget: string;
  deadline: string;
  attachment: boolean;
  /** Mijoz yozgan sahifa tili (o'zbekchada bo'lsa yozilmaydi). */
  lang?: Lang;
}

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

/** Xat matni: oddiy matn, mijoz kiritgan qiymatlar HTML sifatida talqin qilinmaydi. */
export function orderEmail(order: OrderMail, origin: string) {
  const line = (label: string, value: string) => (value ? `${label}: ${value}\n` : "");
  const contact = order.contact.trim();
  return {
    subject: `AlifBit: yangi murojaat ${order.reference}`,
    text:
      `Saytga yangi murojaat keldi.\n\n` +
      line("Raqam", order.reference) +
      line("Ism", order.name) +
      line("Aloqa", contact) +
      line("Xizmat", order.service) +
      line("Byudjet", order.budget) +
      line("Muddat", order.deadline) +
      line("Til", order.lang && order.lang !== "uz" ? LANG_LABEL_UZ[order.lang] : "") +
      (order.attachment ? "Fayl biriktirilgan (admin panelda).\n" : "") +
      `\n${order.description}\n\n` +
      `Admin panel: ${origin}/admin\n`,
    // Mijoz email qoldirgan bo'lsa, Gmail'dagi «Javob berish» to'g'ridan-to'g'ri unga boradi.
    replyTo: EMAIL_RE.test(contact) ? contact : undefined,
  };
}

export async function sendOrderEmail(env: MailEnv, order: OrderMail) {
  if (!env.SEND_EMAIL || !env.NOTIFY_EMAIL || !env.PUBLIC_EMAIL) return false;
  const mail = orderEmail(order, env.PUBLIC_ORIGIN);
  try {
    await env.SEND_EMAIL.send({
      from: { name: "AlifBit sayti", email: env.PUBLIC_EMAIL },
      to: env.NOTIFY_EMAIL,
      subject: mail.subject,
      text: mail.text,
      ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
    });
    return true;
  } catch (error) {
    console.error("Order email delivery failed.", error instanceof Error ? error.message : "");
    return false;
  }
}
