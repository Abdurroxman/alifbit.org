import {
  categories,
  COURSE_ORDER_PREFIX,
  SADO_URL,
} from "../shared/content";
import {
  orderSchema,
  projectSchema,
  serviceSchema,
  courseSchema,
  articleSchema,
  orderStatusSchema,
} from "./validation";
import {
  constantEqual,
  hash,
  keyedHash,
  verifyPassword,
  hashPassword,
  isLocalRequest,
  isSameOrigin,
  cookieValue,
  fileType,
} from "./security";
import { handleIntegration, isIntegrationPath } from "./integration";
import {
  buildPage,
  buildSitemap,
  renderHtml,
  type ContentSource,
} from "./seo";
import { sendOrderEmail } from "./mail";
import {
  handleAdminPayment,
  handlePayCallback,
  paymentsConfigured,
} from "./payments";
interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  PUBLIC_ORIGIN: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
  IP_HASH_SECRET?: string;
  LOCAL_DEV?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  INTEGRATION_TOKEN?: string;
  /** office.alifbit.org suhbatidan kelgan murojaat (Worker'dan Worker'ga): x-office-token shu qiymatga teng bo'lsa,
   * chastota chegarasi mijozning o'z IP'si (x-office-client) bo'yicha hisoblanadi. */
  OFFICE_LEAD_TOKEN?: string;
  PAY_API_URL?: string;
  PAY_API_TOKEN?: string;
  PAY_CALLBACK_SECRET?: string;
  /** Cloudflare Email Routing orqali xat yuborish (wrangler.jsonc `send_email`). */
  SEND_EMAIL?: SendEmail;
  /** Yangi murojaat xabari boradigan, Email Routing'da tasdiqlangan manzil (secret). */
  NOTIFY_EMAIL?: string;
  /** Saytdan ketadigan xatlar manzili va schema.org dagi aloqa manzili. */
  PUBLIC_EMAIL?: string;
}
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
async function rateLimit(
  env: Env,
  key: string,
  limit: number,
  seconds: number,
) {
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    "INSERT INTO rate_limits(key,count,expires) VALUES(?1,1,?2) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<=?3 THEN 1 ELSE count+1 END,expires=CASE WHEN expires<=?3 THEN ?2 ELSE expires END RETURNING count",
  )
    .bind(key, now + seconds, now)
    .first<{ count: number }>();
  if (!row || row.count > limit)
    throw new HttpError(
      429,
      "Juda ko‘p urinish. Birozdan keyin qayta urinib ko‘ring.",
    );
}
async function requireAdmin(request: Request, env: Env) {
  const token = cookieValue(request.headers.get("cookie"), "alifbit_session");
  if (!token || !env.SESSION_SECRET)
    throw new HttpError(401, "Administrator sifatida kiring.");
  const digest = await keyedHash(token, env.SESSION_SECRET);
  const row = await env.DB.prepare(
    "SELECT expires FROM sessions WHERE token_hash=?1 AND expires>?2",
  )
    .bind(digest, Math.floor(Date.now() / 1000))
    .first();
  if (!row) throw new HttpError(401, "Sessiya tugagan. Qayta kiring.");
}
async function clientKey(request: Request, env: Env) {
  if (!env.IP_HASH_SECRET)
    throw new HttpError(
      503,
      "Xizmat hali sozlanmagan. Telegram orqali bog‘laning: @alifbitbot.",
    );
  return keyedHash(
    request.headers.get("cf-connecting-ip") ||
      (isLocalRequest(request, env.LOCAL_DEV) ? "local" : "unknown"),
    env.IP_HASH_SECRET,
  );
}
async function readLimited(request: Request, max: number) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > max)
    throw new HttpError(413, "Yuborilgan ma’lumot hajmi juda katta.");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const parts: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new HttpError(413, "Fayl 5 MB dan kichik bo‘lishi kerak.");
    }
    parts.push(value);
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}
async function readJson(request: Request) {
  if (
    !(request.headers.get("content-type") || "").startsWith("application/json")
  )
    throw new HttpError(415, "JSON formati talab qilinadi.");
  const body = await readLimited(request, 100000);
  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    throw new HttpError(400, "Ma’lumot formati noto‘g‘ri.");
  }
}
/** Admin paneldan almashtirilgan parol xeshi bazada turadi; bo'lmasa Cloudflare secret'i ishlatiladi. */
const ADMIN_HASH_KEY = "admin_password_hash";
async function adminPasswordHash(env: Env) {
  const row = await env.DB.prepare("SELECT data FROM settings WHERE key=?1")
    .bind(ADMIN_HASH_KEY)
    .first<{ data: string }>();
  const stored = row ? JSON.parse(row.data) : "";
  return typeof stored === "string" && stored ? stored : env.ADMIN_PASSWORD_HASH || "";
}
async function audit(env: Env, action: string, id: string) {
  await env.DB.prepare("INSERT INTO audit_log(action,entity_id) VALUES(?1,?2)")
    .bind(action, id)
    .run();
}
function sessionCookie(token: string, local: boolean, clear = false) {
  return `alifbit_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear ? 0 : 28800}${local ? "" : "; Secure"}`;
}
type ContentTable = "projects" | "services" | "articles" | "courses";
const contentTables: ContentTable[] = ["projects", "services", "articles", "courses"];
async function listContent(
  env: Env,
  table: ContentTable,
  admin = false,
) {
  const { results } = await env.DB.prepare(
    `SELECT data,updated_at FROM ${table} ${admin ? "" : "WHERE published=1"} ORDER BY rowid`,
  ).all<{ data: string; updated_at: string }>();
  return results.map((row) => {
    const data = JSON.parse(row.data);
    // Saytdan yashirilgan paketlar ochiq javobga kirmaydi; admin hammasini ko'radi.
    if (table === "services" && !admin && Array.isArray(data.packages))
      data.packages = data.packages.filter((p: { hidden?: boolean }) => !p.hidden);
    return { ...data, updated_at: row.updated_at };
  });
}
/** Sahifa va sitemap uchun nashr qilingan kontent: ochiq API bilan bir xil filtr. */
function contentSource(env: Env): ContentSource {
  return {
    list: (table) => listContent(env, table),
    async get(table, slug) {
      const row = await env.DB.prepare(
        `SELECT data,updated_at FROM ${table} WHERE slug=?1 AND published=1`,
      )
        .bind(slug)
        .first<{ data: string; updated_at: string }>();
      return row ? { ...JSON.parse(row.data), updated_at: row.updated_at } : null;
    },
  };
}
async function notify(env: Env, ctx: ExecutionContext) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  const pending = await env.DB.prepare(
    "SELECT n.order_id,o.reference FROM notifications n JOIN orders o ON o.id=n.order_id WHERE delivered=0 AND attempts<8 AND last_attempt<?1 LIMIT 10",
  )
    .bind(Math.floor(Date.now() / 1000) - 60)
    .all<{ order_id: string; reference: string }>();
  for (const row of pending.results) {
    await env.DB.prepare(
      "UPDATE notifications SET attempts=attempts+1,last_attempt=?1 WHERE order_id=?2",
    )
      .bind(Math.floor(Date.now() / 1000), row.order_id)
      .run();
    try {
      const result = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: `AlifBit: yangi murojaat — ${row.reference}. Admin panelda ko‘ring: ${env.PUBLIC_ORIGIN}/admin`,
          }),
        },
      );
      const data = (await result.json()) as { ok?: boolean };
      if (result.ok && data.ok)
        await env.DB.prepare(
          "UPDATE notifications SET delivered=1 WHERE order_id=?1",
        )
          .bind(row.order_id)
          .run();
    } catch {
      console.error("Notification delivery failed; outbox retained.");
    }
  }
}
async function handleApi(request: Request, env: Env, ctx: ExecutionContext) {
  const url = new URL(request.url),
    path = url.pathname,
    method = request.method;
  // Bearer-token API for the server bot: no cookies, so the browser same-origin check does not apply.
  if (isIntegrationPath(path)) return handleIntegration(request, env);
  // pay.alifbit.org serverdan serverga yuboradigan xabar: Origin yo'q, imzo bilan tekshiriladi.
  if (path === "/api/pay/callback") return handlePayCallback(request, env);
  if (!["GET", "HEAD"].includes(method) && !isSameOrigin(request))
    throw new HttpError(403, "So‘rov manbasi tasdiqlanmadi.");
  if (path === "/api/health") return json({ ok: true });
  if (method === "GET" && path === "/api/projects")
    return json(await listContent(env, "projects"));
  if (method === "GET" && path === "/api/services")
    return json(await listContent(env, "services"));
  if (method === "GET" && path === "/api/articles")
    return json(await listContent(env, "articles"));
  if (method === "GET" && path === "/api/courses")
    return json(await listContent(env, "courses"));
  if (method === "GET" && path === "/api/categories") {
    const row = await env.DB.prepare("SELECT data FROM settings WHERE key=?1")
      .bind("categories")
      .first<{ data: string }>();
    return json(row ? JSON.parse(row.data) : categories.slice(1));
  }
  if (method === "POST" && path === "/api/orders") {
    // Virtual ofis suhbatidan kelgan murojaat Worker IP'sidan keladi: chegarani mijozning o'z IP'si bo'yicha hisoblaymiz
    const officeToken = request.headers.get("x-office-token") || "";
    const officeClient =
      env.OFFICE_LEAD_TOKEN && officeToken && constantEqual(officeToken, env.OFFICE_LEAD_TOKEN)
        ? (request.headers.get("x-office-client") || "unknown").slice(0, 64)
        : null;
    const limitKey =
      officeClient !== null && env.IP_HASH_SECRET
        ? `order:office:${await keyedHash(officeClient, env.IP_HASH_SECRET)}`
        : `order:${await clientKey(request, env)}`;
    await rateLimit(env, limitKey, 5, 3600);
    if (
      !(request.headers.get("content-type") || "").startsWith(
        "multipart/form-data",
      )
    )
      throw new HttpError(415, "Shakl formati noto‘g‘ri.");
    const raw = await readLimited(request, 5 * 1024 * 1024 + 100000);
    const form = await new Request(request.url, {
      method: "POST",
      headers: { "content-type": request.headers.get("content-type")! },
      body: raw,
    }).formData();
    const parsed = orderSchema.safeParse(
      Object.fromEntries(
        [...form.entries()].filter(([, v]) => typeof v === "string"),
      ),
    );
    if (!parsed.success)
      throw new HttpError(
        400,
        parsed.error.issues[0].message ===
          'Invalid literal value, expected "yes"'
          ? "Ma’lumotlarni qayta ishlashga rozilik kerak."
          : parsed.error.issues[0].message,
      );
    const d = parsed.data;
    // Kursga yozilish `kurs-<slug>` ko'rinishida keladi va nashr qilingan kurs bo'yicha tekshiriladi.
    const course = d.service.startsWith(COURSE_ORDER_PREFIX);
    const service = await env.DB.prepare(
      course
        ? "SELECT id FROM courses WHERE slug=?1 AND published=1"
        : "SELECT id FROM services WHERE slug=?1 AND published=1",
    )
      .bind(course ? d.service.slice(COURSE_ORDER_PREFIX.length) : d.service)
      .first();
    if (!service && d.service !== "other")
      throw new HttpError(400, "Xizmat yo‘nalishini tanlang.");
    const attachment = form.get("attachment");
    let key: string | null = null,
      name: string | null = null,
      type: string | null = null;
    if (attachment instanceof File && attachment.size) {
      if (attachment.size > 5 * 1024 * 1024)
        throw new HttpError(413, "Fayl 5 MB dan kichik bo‘lishi kerak.");
      const bytes = new Uint8Array(await attachment.arrayBuffer());
      type = fileType(bytes);
      if (!type || type !== attachment.type)
        throw new HttpError(
          400,
          "Faqat haqiqiy PDF, PNG, JPG yoki WEBP fayl qabul qilinadi.",
        );
      key = `private/${crypto.randomUUID()}`;
      name = attachment.name.replace(/[\r\n\x00-\x1f"\\/]/g, "_").slice(0, 160);
      await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: type } });
    }
    const id = crypto.randomUUID(),
      reference = `AB-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    try {
      await env.DB.batch([
        env.DB.prepare(
          "INSERT INTO orders(id,reference,name,contact,service,description,budget,deadline,attachment_key,attachment_name,attachment_type) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)",
        ).bind(
          id,
          reference,
          d.name,
          d.contact,
          d.service,
          d.description,
          d.budget,
          d.deadline,
          key,
          name,
          type,
        ),
        env.DB.prepare("INSERT INTO notifications(order_id) VALUES(?1)").bind(
          id,
        ),
      ]);
    } catch (e) {
      if (key) await env.MEDIA.delete(key);
      throw e;
    }
    ctx.waitUntil(notify(env, ctx));
    ctx.waitUntil(
      sendOrderEmail(env, {
        reference,
        name: d.name,
        contact: d.contact,
        service: d.service,
        description: d.description,
        budget: d.budget,
        deadline: d.deadline,
        attachment: Boolean(key),
      }),
    );
    return json({ reference }, 201);
  }
  if (path === "/api/admin/login" && method === "POST") {
    const passwordHash = await adminPasswordHash(env);
    if (!passwordHash || !env.SESSION_SECRET)
      throw new HttpError(503, "Administrator kirishi hali sozlanmagan.");
    await rateLimit(env, `login:${await clientKey(request, env)}`, 8, 900);
    const data = (await readJson(request)) as { password?: unknown };
    if (
      typeof data.password !== "string" ||
      data.password.length > 256 ||
      !(await verifyPassword(data.password, passwordHash))
    )
      throw new HttpError(401, "Kirish ma’lumoti noto‘g‘ri.");
    const token = crypto.randomUUID() + crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO sessions(token_hash,expires) VALUES(?1,?2)",
    )
      .bind(
        await keyedHash(token, env.SESSION_SECRET),
        Math.floor(Date.now() / 1000) + 28800,
      )
      .run();
    await audit(env, "session.login", "admin");
    return json({ ok: true }, 200, {
      "set-cookie": sessionCookie(
        token,
        isLocalRequest(request, env.LOCAL_DEV),
      ),
    });
  }
  if (path.startsWith("/api/admin/")) {
    await requireAdmin(request, env);
    if (path === "/api/admin/session") return json({ ok: true });
    if (path === "/api/admin/password" && method === "POST") {
      await rateLimit(env, `password:${await clientKey(request, env)}`, 10, 900);
      const data = (await readJson(request)) as { current?: unknown; next?: unknown };
      if (typeof data.current !== "string" || typeof data.next !== "string" || data.current.length > 256)
        throw new HttpError(400, "Joriy va yangi parolni kiriting.");
      if (data.next.length < 16 || data.next.length > 256)
        throw new HttpError(400, "Yangi parol 16–256 belgidan iborat bo‘lsin.");
      if (!(await verifyPassword(data.current, await adminPasswordHash(env))))
        throw new HttpError(400, "Joriy parol noto‘g‘ri.");
      if (data.next === data.current)
        throw new HttpError(400, "Yangi parol joriy paroldan farq qilsin.");
      await env.DB.prepare(
        "INSERT INTO settings(key,data) VALUES(?1,?2) ON CONFLICT(key) DO UPDATE SET data=excluded.data",
      )
        .bind(ADMIN_HASH_KEY, JSON.stringify(await hashPassword(data.next)))
        .run();
      // Boshqa qurilmalardagi kirishlar yopiladi, shu sessiya qoladi.
      const token = cookieValue(request.headers.get("cookie"), "alifbit_session") || "";
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash<>?1")
        .bind(await keyedHash(token, env.SESSION_SECRET || ""))
        .run();
      await audit(env, "admin.password", "admin");
      return json({ ok: true });
    }
    if (path === "/api/admin/payments" && method === "GET")
      return json({ configured: paymentsConfigured(env) });
    if (path === "/api/admin/categories") {
      if (method === "GET") {
        const row = await env.DB.prepare(
          "SELECT data FROM settings WHERE key=?1",
        )
          .bind("categories")
          .first<{ data: string }>();
        return json(row ? JSON.parse(row.data) : categories.slice(1));
      }
      if (method === "POST") {
        const data = await readJson(request);
        if (
          !Array.isArray(data) ||
          data.length < 1 ||
          data.length > 40 ||
          data.some(
            (x) =>
              typeof x !== "string" || x.trim().length < 2 || x.length > 80,
          )
        )
          throw new HttpError(
            400,
            "Har bir kategoriya 2–80 belgidan iborat bo‘lsin.",
          );
        const list = [...new Set(data.map((x) => x.trim()))];
        if (list.includes("Barchasi"))
          throw new HttpError(400, "«Barchasi» maxsus filtr nomi.");
        const used = await env.DB.prepare(
          "SELECT DISTINCT json_extract(data,'$.category') AS category FROM projects",
        ).all<{ category: string }>();
        const missing = used.results.filter((x) => !list.includes(x.category));
        if (missing.length)
          throw new HttpError(
            400,
            `Avval loyihalardagi kategoriyani o‘zgartiring: ${missing.map((x) => x.category).join(", ")}.`,
          );
        await env.DB.prepare(
          "INSERT INTO settings(key,data) VALUES(?1,?2) ON CONFLICT(key) DO UPDATE SET data=excluded.data",
        )
          .bind("categories", JSON.stringify(list))
          .run();
        await audit(env, "categories.save", "categories");
        return json({ ok: true });
      }
    }
    if (path === "/api/admin/logout" && method === "POST") {
      const token = cookieValue(
        request.headers.get("cookie"),
        "alifbit_session",
      );
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?1")
        .bind(await keyedHash(token, env.SESSION_SECRET!))
        .run();
      return json({ ok: true }, 200, {
        "set-cookie": sessionCookie(
          "",
          isLocalRequest(request, env.LOCAL_DEV),
          true,
        ),
      });
    }
    const table = path.split("/")[3];
    if ((contentTables as string[]).includes(table)) {
      const t = table as ContentTable;
      if (method === "GET") return json(await listContent(env, t, true));
      if (method === "DELETE" && t !== "services") {
        const id = path.split("/")[4];
        if (!id) throw new HttpError(400, "Obyektni tanlang.");
        const row = await env.DB.prepare(
          `SELECT published FROM ${t} WHERE id=?1`,
        )
          .bind(id)
          .first<{ published: number }>();
        if (!row) throw new HttpError(404, "Ma’lumot topilmadi.");
        if (row.published)
          throw new HttpError(
            409,
            "O‘chirishdan oldin nashrdan olib tashlang.",
          );
        await env.DB.batch([
          env.DB.prepare(`DELETE FROM ${t} WHERE id=?1`).bind(id),
          env.DB.prepare(
            "INSERT INTO audit_log(action,entity_id) VALUES(?1,?2)",
          ).bind(`${t}.delete`, id),
        ]);
        return json({ ok: true });
      }
      if (method === "POST") {
        const body = await readJson(request);
        const parsed = (
          t === "projects"
            ? projectSchema
            : t === "services"
              ? serviceSchema
              : t === "courses"
                ? courseSchema
                : articleSchema
        ).safeParse(body);
        if (!parsed.success)
          throw new HttpError(400, parsed.error.issues[0].message);
        const data = parsed.data as unknown as Record<string, unknown>;
        const id = t === "services" ? data.slug : data.id;
        if (t === "projects") {
          const row = await env.DB.prepare(
            "SELECT data FROM settings WHERE key=?1",
          )
            .bind("categories")
            .first<{ data: string }>();
          const list = row ? JSON.parse(row.data) : categories.slice(1);
          if (!list.includes(data.category))
            throw new HttpError(
              400,
              "Avval bu kategoriyani boshqaruv panelida qo‘shing.",
            );
        }
        try {
          await env.DB.batch([
            env.DB.prepare(
              `INSERT INTO ${t}(id,slug,data,published) VALUES(?1,?2,?3,?4) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,data=excluded.data,published=excluded.published,updated_at=CURRENT_TIMESTAMP`,
            ).bind(
              id,
              data.slug,
              JSON.stringify(data),
              data.published ? 1 : 0,
            ),
            env.DB.prepare(
              "INSERT INTO audit_log(action,entity_id) VALUES(?1,?2)",
            ).bind(`${t}.save`, id),
          ]);
        } catch (e) {
          if (String(e).includes("UNIQUE"))
            throw new HttpError(
              409,
              "Bu sahifa manzili band. Boshqa slug tanlang.",
            );
          throw e;
        }
        return json({ ok: true });
      }
    }
    if (table === "orders") {
      const id = path.split("/")[4];
      if (id && path.split("/")[5] === "payment")
        return handleAdminPayment(request, env, id, path.split("/")[6]);
      if (method === "GET" && !id) {
        const { results } = await env.DB.prepare(
          "SELECT * FROM orders ORDER BY created_at DESC LIMIT 500",
        ).all();
        return json(results);
      }
      if (method === "PATCH" && id) {
        const parsed = orderStatusSchema.safeParse(await readJson(request));
        if (!parsed.success) throw new HttpError(400, "Holat noto‘g‘ri.");
        const result = await env.DB.prepare(
          "UPDATE orders SET status=?1,updated_at=CURRENT_TIMESTAMP WHERE id=?2",
        )
          .bind(parsed.data.status, id)
          .run();
        if (!result.meta.changes)
          throw new HttpError(404, "Murojaat topilmadi.");
        await audit(env, "order.status", id);
        return json({ ok: true });
      }
      if (method === "DELETE" && id) {
        const row = await env.DB.prepare(
          "SELECT attachment_key FROM orders WHERE id=?1",
        )
          .bind(id)
          .first<{ attachment_key: string | null }>();
        if (!row) throw new HttpError(404, "Murojaat topilmadi.");
        if (row.attachment_key) await env.MEDIA.delete(row.attachment_key);
        await env.DB.batch([
          env.DB.prepare("DELETE FROM notifications WHERE order_id=?1").bind(
            id,
          ),
          env.DB.prepare("DELETE FROM orders WHERE id=?1").bind(id),
          env.DB.prepare(
            "INSERT INTO audit_log(action,entity_id) VALUES(?1,?2)",
          ).bind("order.delete", id),
        ]);
        return json({ ok: true });
      }
    }
    if (path === "/api/admin/upload" && method === "POST") {
      const bytes = await readLimited(request, 5 * 1024 * 1024);
      const type = fileType(bytes);
      if (!type || type === "application/pdf")
        throw new HttpError(
          400,
          "Muqova uchun PNG, JPG yoki WEBP rasm tanlang.",
        );
      const ext =
        type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";
      const key = `public/${crypto.randomUUID()}.${ext}`;
      await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: type } });
      await audit(env, "media.upload", key);
      return json({ url: `/media/${key}` }, 201);
    }
    if (path === "/api/admin/notifications" && method === "GET") {
      const row = await env.DB.prepare(
        "SELECT COUNT(*) AS pending FROM notifications WHERE delivered=0",
      ).first();
      return json({
        configured: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
        ...row,
      });
    }
    if (path === "/api/admin/audit" && method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM audit_log ORDER BY id DESC LIMIT 100",
      ).all();
      return json(results);
    }
  }
  throw new HttpError(404, "Sahifa yoki amal topilmadi.");
}
async function handle(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url),
    path = url.pathname;
  if (url.protocol === "http:" && !isLocalRequest(request, env.LOCAL_DEV)) {
    url.protocol = "https:";
    if (url.hostname === "www.alifbit.org") url.hostname = "alifbit.org";
    return Response.redirect(url.href, 308);
  }
  if (url.hostname === "www.alifbit.org") {
    url.hostname = "alifbit.org";
    return Response.redirect(url.href, 308);
  }
  if (path.length > 1 && path.endsWith("/")) {
    url.pathname = path.replace(/\/+$/, "");
    return Response.redirect(url.href, 308);
  }
  if (path.startsWith("/api/")) return handleApi(request, env, ctx);
  if (path === "/sado" || path.startsWith("/sado/"))
    return Response.redirect(`${SADO_URL}/`, 301);
  if (path === "/academy")
    return Response.redirect(`${url.origin}/courses`, 301);
  if (path.startsWith("/media/")) {
    if (!["GET", "HEAD"].includes(request.method))
      throw new HttpError(405, "Bu amal qo‘llab-quvvatlanmaydi.");
    const key = path.slice(7);
    if (key.startsWith("private/")) await requireAdmin(request, env);
    else if (!/^public\/[a-f0-9-]+\.(png|jpg|webp)$/.test(key))
      throw new HttpError(404, "Fayl topilmadi.");
    const object = await env.MEDIA.get(key);
    if (!object) throw new HttpError(404, "Fayl topilmadi.");
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set(
      "cache-control",
      key.startsWith("private/")
        ? "no-store"
        : "public, max-age=31536000, immutable",
    );
    if (key.startsWith("private/"))
      headers.set(
        "content-disposition",
        'attachment; filename="alifbit-attachment"',
      );
    return new Response(request.method === "HEAD" ? null : object.body, {
      headers,
    });
  }
  if (path === "/robots.txt")
    return new Response(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /media/private/\nSitemap: ${env.PUBLIC_ORIGIN}/sitemap.xml\n`,
      { headers: { "content-type": "text/plain" } },
    );
  if (path === "/sitemap.xml")
    return new Response(
      await buildSitemap(contentSource(env), env.PUBLIC_ORIGIN),
      { headers: { "content-type": "application/xml; charset=utf-8" } },
    );
  if (/\.[a-z0-9]+$/i.test(path)) return env.ASSETS.fetch(request);
  const page = await buildPage(path, contentSource(env), env.PUBLIC_ORIGIN);
  const index = await env.ASSETS.fetch(
    new Request(new URL("/index.html", url.origin), { method: "GET" }),
  );
  const html = renderHtml(await index.text(), page, env.PUBLIC_ORIGIN, {
    email: env.PUBLIC_EMAIL,
  });
  const status = page.status;
  return new Response(request.method === "HEAD" ? null : html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
      ...(path.startsWith("/admin")
        ? { "x-robots-tag": "noindex, nofollow" }
        : {}),
    },
  });
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    let response: Response;
    try {
      response = await handle(request, env, ctx);
    } catch (e) {
      if (e instanceof HttpError)
        response = json(
          { error: e.message },
          e.status,
          e.status === 429 ? { "retry-after": "900" } : {},
        );
      else {
        const id = crypto.randomUUID();
        console.error(
          "Request failed",
          id,
          e instanceof Error ? e.name : "Unknown",
        );
        response = json(
          {
            error:
              "Xizmat vaqtincha ishlamayapti. Telegram orqali yozing: @alifbitbot.",
            requestId: id,
          },
          503,
        );
      }
    }
    const headers = new Headers(response.headers);
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    headers.set("x-frame-options", "DENY");
    headers.set(
      "permissions-policy",
      "camera=(), microphone=(), geolocation=()",
    );
    headers.set(
      "content-security-policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
    );
    if (!isLocalRequest(request, env.LOCAL_DEV))
      headers.set("strict-transport-security", "max-age=31536000");
    return new Response(response.body, { status: response.status, headers });
  },
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM sessions WHERE expires<?1").bind(
        Math.floor(Date.now() / 1000),
      ),
      env.DB.prepare("DELETE FROM rate_limits WHERE expires<?1").bind(
        Math.floor(Date.now() / 1000),
      ),
    ]);
    await notify(env, ctx);
  },
};
