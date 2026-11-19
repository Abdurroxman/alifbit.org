import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { createD1 } from "./helpers/d1.ts";
import {
  handleAdminPayment,
  handlePayCallback,
  verifySignature,
  type PayOrder,
  type PaymentsEnv,
} from "../server/payments.ts";

const TOKEN = `apb_${randomBytes(32).toString("hex")}`;
const SECRET = randomBytes(32).toString("hex");
const PAY = "https://pay.example.test";

type Call = { url: string; method: string; body: unknown; auth: string | null };

/** To'lov markazining soxta nusxasi: buyurtmalarni xotirada saqlaydi va har chaqiruvni yozib boradi. */
function fakePay() {
  const calls: Call[] = [];
  const orders = new Map<string, PayOrder>();
  let down = false;
  const view = (o: PayOrder) => {
    const paid = o.invoices.filter((i) => i.status === "paid").reduce((t, i) => t + i.amount, 0);
    return { ...o, paid_amount: paid, remaining_amount: o.total_amount - paid, progress: paid >= o.total_amount ? "paid" : paid ? "partial" : "unpaid" };
  };
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method || "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url, method, body, auth: new Headers(init?.headers).get("authorization") });
    if (down) throw new TypeError("fetch failed");
    const path = url.slice(`${PAY}/api/v1`.length);
    const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
    if (path === "/orders" && method === "POST") {
      const existing = [...orders.values()].find((o) => o.external_id === body.external_id);
      if (existing) return reply(view(existing));
      if (body.title.length < 2) return reply({ error: "title" }, 400);
      const id = `po_${orders.size + 1}`;
      const order: PayOrder = {
        id,
        external_id: body.external_id,
        reference: `AP-2026-0000000${orders.size + 1}`,
        title: body.title,
        status: "active",
        total_amount: body.total_amount,
        paid_amount: 0,
        refunded_amount: 0,
        remaining_amount: body.total_amount,
        progress: "unpaid",
        pay_url: `${PAY}/p/token${orders.size + 1}`,
        invoices: body.invoices.map((i: { kind: string; amount: number }, n: number) => ({
          no: 100001 + n,
          kind: i.kind,
          title: i.kind,
          amount: i.amount,
          status: "open",
        })),
        created_at: 1,
      };
      orders.set(id, order);
      return reply(view(order), 201);
    }
    const match = path.match(/^\/orders\/([^/]+)(\/invoices)?$/);
    const order = match && orders.get(decodeURIComponent(match[1]));
    if (!order) return reply({ error: "Buyurtma topilmadi." }, 404);
    if (match[2] && method === "POST") {
      const allocated = order.invoices.filter((i) => i.status !== "cancelled").reduce((t, i) => t + i.amount, 0);
      if (allocated + body.amount > order.total_amount)
        return reply({ error: "To‘lov summasi buyurtmaning to‘lanmagan qismidan oshmasligi kerak." }, 409);
      order.invoices.push({ no: 100001 + order.invoices.length, kind: body.kind, title: body.kind, amount: body.amount, status: "open" });
      return reply(view(order), 201);
    }
    return reply(view(order));
  }) as typeof fetch;
  return {
    calls,
    orders,
    setDown: (value: boolean) => (down = value),
    payInvoice(id: string, no: number) {
      const invoice = orders.get(id)!.invoices.find((i) => i.no === no)!;
      invoice.status = "paid";
    },
  };
}

function setup(overrides: Partial<PaymentsEnv> = {}) {
  const DB = createD1();
  const env: PaymentsEnv = {
    DB,
    PUBLIC_ORIGIN: "https://alifbit.org",
    PAY_API_URL: PAY,
    PAY_API_TOKEN: TOKEN,
    PAY_CALLBACK_SECRET: SECRET,
    ...overrides,
  };
  DB.raw
    .prepare("INSERT INTO orders(id,reference,name,contact,service,description) VALUES(?,?,?,?,?,?)")
    .run("ord-1", "AB-2026-AAAA1111", "Ali Valiyev", "@ali", "veb-sayt", "Sayt kerak");
  return { env, DB, pay: fakePay() };
}

const admin = (env: PaymentsEnv, action?: string, body?: unknown) =>
  handleAdminPayment(
    new Request(`https://alifbit.org/api/admin/orders/ord-1/payment${action ? `/${action}` : ""}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    }),
    env,
    "ord-1",
    action,
  );

const sign = (body: string, secret = SECRET, t = Math.floor(Date.now() / 1000)) =>
  `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")}`;

const callback = (env: PaymentsEnv, body: string, signature: string) =>
  handlePayCallback(
    new Request("https://alifbit.org/api/pay/callback", {
      method: "POST",
      headers: { "content-type": "application/json", "x-alifbit-signature": signature },
      body,
    }),
    env,
  );

const stored = (DB: ReturnType<typeof createD1>) =>
  DB.raw.prepare("SELECT pay_order_id,pay_data,pay_synced_at FROM orders WHERE id='ord-1'").get() as {
    pay_order_id: string | null;
    pay_data: string | null;
    pay_synced_at: number;
  };

test("signature: valid, wrong secret, stale, malformed", async () => {
  const body = '{"event":"payment.paid"}';
  const now = Math.floor(Date.now() / 1000);
  assert.equal(await verifySignature(sign(body), body, SECRET, now), true);
  assert.equal(await verifySignature(sign(body, "x".repeat(64)), body, SECRET, now), false);
  assert.equal(await verifySignature(sign(body), body + " ", SECRET, now), false);
  assert.equal(await verifySignature(sign(body, SECRET, now - 301), body, SECRET, now), false);
  assert.equal(await verifySignature(sign(body, SECRET, now + 301), body, SECRET, now), false);
  assert.equal(await verifySignature(null, body, SECRET, now), false);
  assert.equal(await verifySignature("t=abc,v1=00", body, SECRET, now), false);
});

test("admin: not configured → 503, nothing sent", async () => {
  const { env, pay } = setup({ PAY_API_TOKEN: "" });
  const response = await admin(env, undefined, { total: 1_500_000 });
  assert.equal(response.status, 503);
  assert.equal(pay.calls.length, 0);
});

test("admin: full payment link is created once, amounts go in tiyin", async () => {
  const { env, DB, pay } = setup();
  const response = await admin(env, undefined, { total: 1_500_000 });
  assert.equal(response.status, 201);
  const call = pay.calls[0];
  assert.equal(call.url, `${PAY}/api/v1/orders`);
  assert.equal(call.auth, `Bearer ${TOKEN}`);
  const body = call.body as Record<string, unknown>;
  assert.equal(body.external_id, "ord-1");
  assert.equal(body.total_amount, 150_000_000);
  assert.deepEqual(body.invoices, [{ kind: "full", amount: 150_000_000 }]);
  assert.equal(body.title, "Sayt yaratish");
  const row = stored(DB);
  assert.equal(row.pay_order_id, "po_1");
  assert.equal((JSON.parse(row.pay_data!) as PayOrder).pay_url, `${PAY}/p/token1`);

  const again = await admin(env, undefined, { total: 2_000_000 });
  assert.equal(again.status, 409);
  assert.equal(pay.calls.length, 1);
});

test("admin: validation of total and advance", async () => {
  const { env, pay } = setup();
  for (const body of [{ total: 500 }, { total: 1_000_000, advance: 1_000_000 }, { total: 1.5 }, { total: "100000" }, {}]) {
    const response = await admin(env, undefined, body);
    assert.equal(response.status, 400, JSON.stringify(body));
  }
  assert.equal(pay.calls.length, 0);
});

test("admin: advance, then balance for exactly the unallocated part", async () => {
  const { env, DB, pay } = setup();
  assert.equal((await admin(env, undefined, { total: 3_000_000, advance: 1_000_000 })).status, 201);
  assert.deepEqual((pay.calls[0].body as { invoices: unknown }).invoices, [{ kind: "advance", amount: 100_000_000 }]);
  pay.payInvoice("po_1", 100001);

  const balance = await admin(env, "balance");
  assert.equal(balance.status, 201);
  const last = pay.calls.at(-1)!;
  assert.equal(last.url, `${PAY}/api/v1/orders/po_1/invoices`);
  assert.deepEqual(last.body, { kind: "balance", amount: 200_000_000 });
  const data = JSON.parse(stored(DB).pay_data!) as PayOrder;
  assert.equal(data.invoices.length, 2);
  assert.equal(data.paid_amount, 100_000_000);

  // Hammasi taqsimlangan: ikkinchi qoldiq ochilmaydi.
  const second = await admin(env, "balance");
  assert.equal(second.status, 409);
  assert.equal(pay.calls.filter((c) => c.method === "POST").length, 2);
});

test("admin: refresh before link exists → 404; pay unreachable → 502", async () => {
  const { env, pay } = setup();
  assert.equal((await admin(env, "refresh")).status, 404);
  pay.setDown(true);
  const response = await admin(env, undefined, { total: 1_000_000 });
  assert.equal(response.status, 502);
  assert.match(((await response.json()) as { error: string }).error, /ulanib bo‘lmadi/);
});

test("callback: bad signature rejected; good one refreshes state from pay", async () => {
  const { env, DB, pay } = setup();
  await admin(env, undefined, { total: 1_000_000 });
  pay.payInvoice("po_1", 100001);
  // Tanadagi summa yolg'on bo'lsa ham hisobga olinmaydi: holat to'lov markazidan qayta olinadi.
  const body = JSON.stringify({ event: "payment.paid", order: { id: "po_1", paid_amount: 999 } });

  assert.equal((await callback(env, body, sign(body, "y".repeat(64)))).status, 401);
  assert.equal((JSON.parse(stored(DB).pay_data!) as PayOrder).paid_amount, 0);

  const response = await callback(env, body, sign(body));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, matched: true });
  const data = JSON.parse(stored(DB).pay_data!) as PayOrder;
  assert.equal(data.paid_amount, 100_000_000);
  assert.equal(data.invoices[0].status, "paid");
});

test("callback: unknown order is acknowledged; pay down → 502 so it is retried", async () => {
  const { env, pay } = setup();
  const unknown = JSON.stringify({ event: "payment.paid", order: { id: "po_404" } });
  const ack = await callback(env, unknown, sign(unknown));
  assert.equal(ack.status, 200);
  assert.deepEqual(await ack.json(), { ok: true, matched: false });

  await admin(env, undefined, { total: 1_000_000 });
  pay.setDown(true);
  const body = JSON.stringify({ event: "payment.paid", order: { id: "po_1" } });
  assert.equal((await callback(env, body, sign(body))).status, 502);
});

test("callback: missing secret → 503; older snapshot never overwrites a newer one", async () => {
  const { env, DB } = setup({ PAY_CALLBACK_SECRET: "" });
  const body = JSON.stringify({ order: { id: "po_1" } });
  assert.equal((await callback(env, body, sign(body))).status, 503);

  const full = { ...env, PAY_CALLBACK_SECRET: SECRET };
  await admin(full, undefined, { total: 1_000_000 });
  DB.raw.prepare("UPDATE orders SET pay_synced_at=?1, pay_data='{\"marker\":1}' WHERE id='ord-1'").run(Date.now() + 60_000);
  assert.equal((await callback(full, body, sign(body))).status, 200);
  assert.equal(stored(DB).pay_data, '{"marker":1}');
});
