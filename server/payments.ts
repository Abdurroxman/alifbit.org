import { z } from "zod";
import { constantEqual, keyedHash } from "./security.ts";

/**
 * pay.alifbit.org bilan bog'lanish: murojaatdan to'lov buyurtmasi yaratish va to'lov holatini olish.
 * Pul hisobi faqat to'lov markazida yuritiladi. Bu yerda buyurtma id'si va oxirgi holat nusxasi (pay_data) saqlanadi.
 * To'lov markaziga Bearer token (PAY_API_TOKEN) bilan murojaat qilinadi. Uning xabarlari
 * PAY_CALLBACK_SECRET bilan HMAC-SHA256 imzolangan bo'ladi.
 */
export interface PaymentsEnv {
  DB: D1Database;
  PUBLIC_ORIGIN: string;
  PAY_API_URL?: string;
  PAY_API_TOKEN?: string;
  PAY_CALLBACK_SECRET?: string;
}

/** Imzo vaqti shu oraliqdan eski yoki kelajakda bo'lsa, xabar qabul qilinmaydi (qayta yuborish hujumi). */
export const SIGNATURE_TOLERANCE_SECONDS = 300;
const MAX_CALLBACK_BYTES = 64 * 1024;
/** So'mda: 1 000 so'mdan 10 mlrd so'mgacha. */
const MIN_SUM = 1000;
const MAX_SUM = 10_000_000_000;

const reply = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
const fail = (status: number, error: string) => reply({ error }, status);

export const paymentsConfigured = (env: PaymentsEnv) =>
  !!(env.PAY_API_URL && env.PAY_API_TOKEN && env.PAY_API_TOKEN.length >= 32);

const sum = z
  .number({ invalid_type_error: "Summani so‘mda kiriting." })
  .int("Summa butun so‘mda bo‘lsin.")
  .min(MIN_SUM, "Summa kamida 1 000 so‘m bo‘lsin.")
  .max(MAX_SUM, "Summa juda katta.");

export const paymentRequestSchema = z
  .object({ total: sum, advance: sum.optional() })
  .refine((d) => d.advance === undefined || d.advance < d.total, {
    message: "Avans umumiy narxdan kichik bo‘lsin.",
  });

/** To'lov markazi qaytaradigan buyurtma ko'rinishi (summalar tiyinda). */
export interface PayOrder {
  id: string;
  external_id: string;
  reference: string;
  title: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  refunded_amount: number;
  remaining_amount: number;
  progress: string;
  pay_url: string;
  invoices: Array<{ no: number; kind: string; title: string; amount: number; status: string }>;
  created_at: number;
}

interface OrderRow {
  id: string;
  reference: string;
  name: string;
  contact: string;
  service: string;
  service_name: string | null;
  course_title: string | null;
  pay_order_id: string | null;
}

class PayCallError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** To'lov markaziga so'rov. Xato javobi admin uchun tushunarli matnga aylantiriladi. */
async function payApi(env: PaymentsEnv, path: string, init: RequestInit = {}): Promise<PayOrder> {
  let response: Response;
  try {
    response = await fetch(`${env.PAY_API_URL!.replace(/\/+$/, "")}/api/v1${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${env.PAY_API_TOKEN}`,
        "content-type": "application/json",
        accept: "application/json",
      },
    });
  } catch {
    throw new PayCallError(502, "To‘lov markaziga ulanib bo‘lmadi. Birozdan keyin qayta urinib ko‘ring.");
  }
  const data = (await response.json().catch(() => null)) as (PayOrder & { error?: string }) | null;
  if (response.ok && data && typeof data.id === "string") return data;
  if (response.status === 400 || response.status === 409 || response.status === 404)
    throw new PayCallError(response.status === 404 ? 404 : 409, data?.error || "To‘lov markazi so‘rovni rad etdi.");
  throw new PayCallError(502, "To‘lov markazi javob bermadi. Birozdan keyin qayta urinib ko‘ring.");
}

async function loadOrder(env: PaymentsEnv, id: string) {
  return env.DB.prepare(
    "SELECT o.id,o.reference,o.name,o.contact,o.service,json_extract(s.data,'$.name') AS service_name,json_extract(c.data,'$.title') AS course_title,o.pay_order_id FROM orders o LEFT JOIN services s ON s.slug=o.service LEFT JOIN courses c ON o.service='kurs-'||c.slug WHERE o.id=?1",
  )
    .bind(id)
    .first<OrderRow>();
}

/** To'lov markazidagi holatni murojaatga yozadi. Eskiroq javob yangisining ustidan yozilmaydi. */
async function store(env: PaymentsEnv, orderId: string, pay: PayOrder, syncedAt: number) {
  await env.DB.prepare(
    "UPDATE orders SET pay_order_id=?2,pay_data=?3,pay_synced_at=?4 WHERE id=?1 AND (pay_order_id IS NULL OR pay_order_id=?2) AND pay_synced_at<=?4",
  )
    .bind(orderId, pay.id, JSON.stringify(pay), syncedAt)
    .run();
}

function title(order: OrderRow) {
  const name = order.service_name || (order.course_title ? `Kurs: ${order.course_title}` : "") || order.service;
  return name.length >= 2 ? name.slice(0, 150) : "AlifBit xizmati";
}

async function audit(env: PaymentsEnv, action: string, id: string) {
  await env.DB.prepare("INSERT INTO audit_log(action,entity_id) VALUES(?1,?2)").bind(action, id).run();
}

/**
 * Admin amallari: /api/admin/orders/:id/payment[/refresh|/balance].
 * Chaqiruvchi admin sessiyasini oldindan tekshirgan bo'lishi shart.
 */
export async function handleAdminPayment(
  request: Request,
  env: PaymentsEnv,
  orderId: string,
  action: string | undefined,
): Promise<Response> {
  if (request.method !== "POST") return fail(405, "Bu amal qo‘llab-quvvatlanmaydi.");
  if (!paymentsConfigured(env))
    return fail(503, "To‘lov markazi hali ulanmagan: PAY_API_URL va PAY_API_TOKEN sozlanmagan.");
  const order = await loadOrder(env, orderId);
  if (!order) return fail(404, "Murojaat topilmadi.");
  const now = Date.now();
  try {
    if (!action) {
      if (order.pay_order_id) return fail(409, "Bu murojaat uchun to‘lov havolasi allaqachon yaratilgan.");
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return fail(400, "Ma’lumot formati noto‘g‘ri.");
      }
      const parsed = paymentRequestSchema.safeParse(body);
      if (!parsed.success) return fail(400, parsed.error.issues[0]?.message || "Summa noto‘g‘ri.");
      const { total, advance } = parsed.data;
      const name = order.name.trim().length >= 2 ? order.name.trim().slice(0, 120) : "Mijoz";
      // Murojaat id'si external_id bo'ladi: takroriy so'rov to'lov markazida yangi buyurtma yaratmaydi.
      const pay = await payApi(env, "/orders", {
        method: "POST",
        body: JSON.stringify({
          external_id: order.id,
          title: title(order),
          description: `alifbit.org murojaati ${order.reference}`,
          customer: { name, contact: order.contact.slice(0, 150) },
          total_amount: total * 100,
          invoices: [
            advance === undefined
              ? { kind: "full", amount: total * 100 }
              : { kind: "advance", amount: advance * 100 },
          ],
          return_url: `${env.PUBLIC_ORIGIN}/`,
        }),
      });
      await store(env, order.id, pay, now);
      await audit(env, "order.payment.create", order.id);
      return reply(pay, 201);
    }
    if (!order.pay_order_id) return fail(404, "Bu murojaat uchun to‘lov havolasi yaratilmagan.");
    if (action === "refresh") {
      const pay = await payApi(env, `/orders/${encodeURIComponent(order.pay_order_id)}`);
      await store(env, order.id, pay, now);
      return reply(pay);
    }
    if (action === "balance") {
      // Qoldiq to'lovi: hali to'lov so'rovi ochilmagan qism uchun.
      const current = await payApi(env, `/orders/${encodeURIComponent(order.pay_order_id)}`);
      const allocated = current.invoices
        .filter((i) => i.status === "open" || i.status === "paid")
        .reduce((total, i) => total + i.amount, 0);
      const amount = current.total_amount - allocated;
      if (current.status !== "active") return fail(409, "To‘lov markazida buyurtma yopilgan.");
      if (amount <= 0) {
        await store(env, order.id, current, now);
        return fail(409, "Qoldiq uchun to‘lov allaqachon ochilgan yoki narx to‘liq to‘langan.");
      }
      const pay = await payApi(env, `/orders/${encodeURIComponent(order.pay_order_id)}/invoices`, {
        method: "POST",
        body: JSON.stringify({ kind: "balance", amount }),
      });
      await store(env, order.id, pay, now);
      await audit(env, "order.payment.balance", order.id);
      return reply(pay, 201);
    }
    return fail(404, "Amal topilmadi.");
  } catch (e) {
    if (e instanceof PayCallError) return fail(e.status, e.message);
    throw e;
  }
}

/** `t=<unix>,v1=<hex>` sarlavhasini tekshiradi: imzo HMAC-SHA256(`${t}.${body}`, secret). */
export async function verifySignature(header: string | null, body: string, secret: string, nowSeconds: number) {
  const parts = Object.fromEntries(
    (header || "").split(",").map((part) => {
      const index = part.indexOf("=");
      return [part.slice(0, index).trim(), part.slice(index + 1).trim()];
    }),
  ) as Record<string, string>;
  const timestamp = Number(parts.t);
  if (!/^\d{1,12}$/.test(parts.t || "") || !/^[a-f0-9]{64}$/.test(parts.v1 || "")) return false;
  if (Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false;
  return constantEqual(await keyedHash(`${parts.t}.${body}`, secret), parts.v1);
}

/**
 * POST /api/pay/callback — to'lov markazi to'lov holati o'zgarganini xabar qiladi.
 * Xabar tanasiga ishonilmaydi: imzo to'g'ri bo'lsa, haqiqiy holat to'lov markazining o'zidan qayta olinadi.
 * Xato javobida to'lov markazi xabarni keyinroq qayta yuboradi.
 */
export async function handlePayCallback(request: Request, env: PaymentsEnv): Promise<Response> {
  if (request.method !== "POST") return fail(405, "Method not allowed.");
  const secret = env.PAY_CALLBACK_SECRET;
  if (!secret || secret.length < 32 || !paymentsConfigured(env)) return fail(503, "Payments are not configured.");
  if (Number(request.headers.get("content-length") || 0) > MAX_CALLBACK_BYTES) return fail(413, "Too large.");
  const body = await request.text();
  if (body.length > MAX_CALLBACK_BYTES) return fail(413, "Too large.");
  const now = Date.now();
  if (!(await verifySignature(request.headers.get("x-alifbit-signature"), body, secret, Math.floor(now / 1000))))
    return fail(401, "Invalid signature.");
  let payOrderId = "";
  try {
    const data = JSON.parse(body) as { order?: { id?: unknown } };
    if (typeof data.order?.id === "string") payOrderId = data.order.id;
  } catch {
    return fail(400, "Invalid JSON.");
  }
  if (!payOrderId) return fail(400, "Invalid payload.");
  const row = await env.DB.prepare("SELECT id FROM orders WHERE pay_order_id=?1")
    .bind(payOrderId)
    .first<{ id: string }>();
  // Murojaat o'chirilgan bo'lsa ham xabar qabul qilinadi: aks holda to'lov markazi uni behuda qayta yuboradi.
  if (!row) return reply({ ok: true, matched: false });
  try {
    const pay = await payApi(env, `/orders/${encodeURIComponent(payOrderId)}`);
    await store(env, row.id, pay, now);
  } catch (e) {
    if (e instanceof PayCallError) return fail(502, "Payment state refresh failed.");
    throw e;
  }
  await audit(env, "order.payment.callback", row.id);
  return reply({ ok: true, matched: true });
}
