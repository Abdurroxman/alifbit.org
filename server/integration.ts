import { orderStatuses } from "../shared/content";
import { orderStatusSchema } from "./validation";
import { constantEqual, keyedHash } from "./security";

/**
 * Narrow machine API for the owner's server bot: contact-form orders only.
 * Authenticated by one bearer token (`INTEGRATION_TOKEN`), separate from the admin password,
 * so a leaked token cannot edit site content or sign in to the admin panel.
 */
export interface IntegrationEnv {
  DB: D1Database;
  MEDIA: R2Bucket;
  INTEGRATION_TOKEN?: string;
}

const PREFIX = "/api/integration/";

const reply = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
const fail = (status: number, error: string) => reply({ error }, status);

async function authorized(request: Request, expected: string) {
  const given = (request.headers.get("authorization") || "").replace(
    /^Bearer\s+/i,
    "",
  );
  // Both sides are hashed first so the comparison is constant-time regardless of the token length.
  const [a, b] = await Promise.all([
    keyedHash(given, expected),
    keyedHash(expected, expected),
  ]);
  return constantEqual(a, b);
}

async function audit(env: IntegrationEnv, action: string, id: string) {
  await env.DB.prepare("INSERT INTO audit_log(action,entity_id) VALUES(?1,?2)")
    .bind(action, id)
    .run();
}

interface OrderRow {
  id: string;
  reference: string;
  name: string;
  contact: string;
  service: string;
  service_data: string | null;
  description: string;
  budget: string;
  deadline: string;
  status: string;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
  updated_at: string;
}

function serviceName(row: OrderRow) {
  if (!row.service_data) return row.service;
  try {
    const data = JSON.parse(row.service_data) as { name?: unknown };
    return typeof data.name === "string" ? data.name : row.service;
  } catch {
    return row.service;
  }
}

export function isIntegrationPath(path: string) {
  return path.startsWith(PREFIX);
}

export async function handleIntegration(
  request: Request,
  env: IntegrationEnv,
): Promise<Response> {
  const expected = env.INTEGRATION_TOKEN;
  if (!expected || expected.length < 32)
    return fail(503, "Integration is not configured.");
  if (!(await authorized(request, expected)))
    return fail(401, "Unauthorized.");

  const url = new URL(request.url);
  const parts = url.pathname.slice(PREFIX.length).split("/").filter(Boolean);
  const method = request.method;
  if (parts[0] !== "orders") return fail(404, "Not found.");
  const id = parts[1];

  if (!id && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT o.id,o.reference,o.name,o.contact,o.service,s.data AS service_data,o.description,o.budget,o.deadline,o.status,o.attachment_name,o.attachment_type,o.created_at,o.updated_at FROM orders o LEFT JOIN services s ON s.slug=o.service ORDER BY o.created_at DESC LIMIT 500",
    ).all<OrderRow>();
    const orders = results.map((row) => {
      const { service_data: _data, ...rest } = row;
      return { ...rest, service_name: serviceName(row) };
    });
    return reply({ statuses: orderStatuses, orders });
  }
  if (!id) return fail(405, "Method not allowed.");

  if (parts[2] === "attachment" && parts.length === 3 && method === "GET") {
    const row = await env.DB.prepare(
      "SELECT attachment_key,attachment_name,attachment_type FROM orders WHERE id=?1",
    )
      .bind(id)
      .first<{
        attachment_key: string | null;
        attachment_name: string | null;
        attachment_type: string | null;
      }>();
    if (!row?.attachment_key) return fail(404, "Not found.");
    const object = await env.MEDIA.get(row.attachment_key);
    if (!object) return fail(404, "Not found.");
    return new Response(object.body, {
      headers: {
        "content-type": row.attachment_type || "application/octet-stream",
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(row.attachment_name || "file")}`,
        "cache-control": "no-store",
      },
    });
  }
  if (parts.length !== 2) return fail(404, "Not found.");

  if (method === "PATCH") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Invalid JSON.");
    }
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) return fail(400, "Invalid status.");
    const result = await env.DB.prepare(
      "UPDATE orders SET status=?1,updated_at=CURRENT_TIMESTAMP WHERE id=?2",
    )
      .bind(parsed.data.status, id)
      .run();
    if (!result.meta.changes) return fail(404, "Not found.");
    await audit(env, "order.status.bot", id);
    return reply({ ok: true });
  }

  if (method === "DELETE") {
    const row = await env.DB.prepare(
      "SELECT attachment_key FROM orders WHERE id=?1",
    )
      .bind(id)
      .first<{ attachment_key: string | null }>();
    if (!row) return fail(404, "Not found.");
    if (row.attachment_key) await env.MEDIA.delete(row.attachment_key);
    await env.DB.batch([
      env.DB.prepare("DELETE FROM notifications WHERE order_id=?1").bind(id),
      env.DB.prepare("DELETE FROM orders WHERE id=?1").bind(id),
      env.DB.prepare(
        "INSERT INTO audit_log(action,entity_id) VALUES(?1,?2)",
      ).bind("order.delete.bot", id),
    ]);
    return reply({ ok: true });
  }

  return fail(405, "Method not allowed.");
}
