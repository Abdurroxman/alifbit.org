import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const base = process.env.BASE || "http://127.0.0.1:8787",
  origin = {
    origin: base,
    "cf-connecting-ip": `192.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`,
  };
const results = [];
async function check(name, fn) {
  await fn();
  results.push({ name, passed: true });
  console.log(`PASS ${name}`);
}
const req = (path, init = {}) =>
  fetch(base + path, { ...init, headers: { ...origin, ...init.headers } });
let cookie = "",
  orderId = "",
  original = null,
  originalCourse = null,
  courseOrderId = "",
  qaProject = null;
const auth = () => ({ ...origin, cookie });
try {
  await check(
    "public routes, metadata, fonts, artwork and security headers",
    async () => {
      for (const route of [
        "/",
        "/projects",
        "/services",
        "/courses",
        "/about",
        "/contact",
        "/privacy",
        "/journal",
        "/projects/dalolat",
        "/services/veb-sayt",
        "/fonts/manrope-latin.woff2",
        "/fonts/inter-latin.woff2",
        "/brand/mark.svg",
        "/brand/social.png",
      ]) {
        const response = await req(route);
        assert.equal(response.status, 200, route);
        assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      }
      const detail = await (await req("/projects/dalolat")).text();
      assert.match(detail, /<title>DALOLAT — AlifBit<\/title>/);
      assert.match(
        detail,
        /rel="canonical" href="https:\/\/alifbit.org\/projects\/dalolat"/,
      );
      assert.equal((await req("/missing-page")).status, 404);
      for (const gone of ["/library", "/films", "/render", "/services/development"])
        assert.equal((await req(gone)).status, 404, gone);
      const academy = await req("/academy", { redirect: "manual" });
      assert.equal(academy.status, 301);
      assert.match(academy.headers.get("location"), /\/courses$/);
      const services = await (await req("/api/services")).json();
      assert.ok(services.some((s) => s.slug === "veb-sayt" && s.packages?.length));
      assert.ok(services.every((s) => s.need), "every service has an intro answer");
      assert.ok(
        services.find((s) => s.slug === "veb-sayt").packages.every((p) => p.fit),
        "every website package has an intro answer",
      );
      const sitemap = await (await req("/sitemap.xml")).text();
      assert.match(sitemap, /projects\/dalolat/);
    },
  );
  await check(
    "private endpoints and cross-origin mutations are denied",
    async () => {
      assert.equal((await req("/api/admin/orders")).status, 401);
      const cross = await req("/api/orders", {
        method: "POST",
        headers: { origin: "https://evil.example" },
        body: "bad",
      });
      assert.equal(cross.status, 403);
      assert.equal((await req("/media/private/not-a-real-file")).status, 401);
    },
  );
  await check("admin can sign in with HttpOnly SameSite session", async () => {
    const password = readFileSync("local-admin.txt", "utf8").match(
      /Password: (.+)/,
    )[1];
    const response = await req("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    assert.equal(response.status, 200, await response.clone().text());
    const header = response.headers.get("set-cookie");
    assert.match(header, /HttpOnly/);
    assert.match(header, /SameSite=Strict/);
    cookie = header.split(";")[0];
    assert.equal(
      (await req("/api/admin/session", { headers: auth() })).status,
      200,
    );
  });
  await check(
    "real order and attachment are persisted, visible to admin and private",
    async () => {
      const data = new FormData();
      Object.entries({
        name: "QA — local verification",
        contact: "qa@example.test",
        service: "veb-sayt",
        description:
          "Local verification order: persistence, workflow and attachment privacy.",
        consent: "yes",
        website: "",
      }).forEach(([k, v]) => data.set(k, v));
      data.set(
        "attachment",
        new Blob(["%PDF-1.7\nQA local test only"], { type: "application/pdf" }),
        "qa-test.pdf",
      );
      const response = await req("/api/orders", { method: "POST", body: data });
      assert.equal(response.status, 201, await response.clone().text());
      const { reference } = await response.json();
      assert.match(reference, /^AB-/);
      const orders = await (
        await req("/api/admin/orders", { headers: auth() })
      ).json();
      const saved = orders.find((o) => o.reference === reference);
      assert.ok(saved);
      orderId = saved.id;
      assert.equal(saved.contact, "qa@example.test");
      assert.ok(saved.attachment_key);
      assert.equal((await req(`/media/${saved.attachment_key}`)).status, 401);
      const file = await req(`/media/${saved.attachment_key}`, {
        headers: auth(),
      });
      assert.equal(file.status, 200);
      assert.match(file.headers.get("content-disposition"), /attachment/);
      assert.match(await file.text(), /%PDF/);
      const patch = await req(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { ...auth(), "content-type": "application/json" },
        body: JSON.stringify({ status: "Ko‘rib chiqilmoqda" }),
      });
      assert.equal(patch.status, 200);
      const refreshed = await (
        await req("/api/admin/orders", { headers: auth() })
      ).json();
      assert.equal(
        refreshed.find((o) => o.id === orderId).status,
        "Ko‘rib chiqilmoqda",
      );
    },
  );
  await check("invalid form and forged attachment are rejected", async () => {
    const data = new FormData();
    Object.entries({
      name: "QA",
      contact: "invalid",
      service: "veb-sayt",
      description: "A legitimate description longer than twenty characters.",
      consent: "yes",
      website: "",
    }).forEach(([k, v]) => data.set(k, v));
    assert.equal(
      (await req("/api/orders", { method: "POST", body: data })).status,
      400,
    );
    data.set("contact", "qa@example.test");
    data.set(
      "attachment",
      new Blob(['<svg onload="alert(1)"/>'], { type: "image/png" }),
      "fake.png",
    );
    assert.equal(
      (await req("/api/orders", { method: "POST", body: data })).status,
      400,
    );
  });
  await check(
    "CMS changes control public catalogue and dynamic page publication",
    async () => {
      const list = await (
        await req("/api/admin/projects", { headers: auth() })
      ).json();
      original = list.find((p) => p.id === "dalolat");
      assert.ok(original);
      const unpublished = await req("/api/admin/projects", {
        method: "POST",
        headers: { ...auth(), "content-type": "application/json" },
        body: JSON.stringify({ ...original, published: false }),
      });
      assert.equal(unpublished.status, 200);
      const hidden = await (await req("/api/projects")).json();
      assert.equal(
        hidden.some((p) => p.id === "dalolat"),
        false,
      );
      assert.equal((await req("/projects/dalolat")).status, 404);
      const restore = await req("/api/admin/projects", {
        method: "POST",
        headers: { ...auth(), "content-type": "application/json" },
        body: JSON.stringify(original),
      });
      assert.equal(restore.status, 200);
      assert.equal((await req("/projects/dalolat")).status, 200);
    },
  );
  await check(
    "course page and course sign-up follow the publication flag",
    async () => {
      const options = (value) => ({
        method: "POST",
        headers: { ...auth(), "content-type": "application/json" },
        body: JSON.stringify(value),
      });
      const list = await (await req("/api/admin/courses", { headers: auth() })).json();
      originalCourse = list.find((c) => c.slug === "vayb-koding");
      assert.ok(originalCourse);
      const signUp = () => {
        const data = new FormData();
        Object.entries({
          name: "QA — course sign-up",
          contact: "qa@example.test",
          service: "kurs-vayb-koding",
          description: "Local verification of a course sign-up request.",
          consent: "yes",
          website: "",
        }).forEach(([k, v]) => data.set(k, v));
        return req("/api/orders", { method: "POST", body: data });
      };
      assert.equal((await req("/api/admin/courses", options({ ...originalCourse, published: false }))).status, 200);
      assert.equal((await req("/courses/vayb-koding")).status, 404);
      assert.equal((await signUp()).status, 400);
      const hidden = await (await req("/api/courses")).json();
      assert.equal(hidden.some((c) => c.slug === "vayb-koding"), false);
      assert.equal((await req("/api/admin/courses", options({ ...originalCourse, published: true }))).status, 200);
      const page = await req("/courses/vayb-koding");
      assert.equal(page.status, 200);
      assert.match(await page.text(), /<title>Vayb koding — AlifBit<\/title>/);
      assert.match(await (await req("/sitemap.xml")).text(), /courses\/vayb-koding/);
      const accepted = await signUp();
      assert.equal(accepted.status, 201, await accepted.clone().text());
      const { reference } = await accepted.json();
      const orders = await (await req("/api/admin/orders", { headers: auth() })).json();
      courseOrderId = orders.find((o) => o.reference === reference).id;
      assert.equal((await req(`/api/admin/orders/${courseOrderId}`, { method: "DELETE", headers: auth() })).status, 200);
      courseOrderId = "";
      assert.equal((await req("/api/admin/courses", options(originalCourse))).status, 200);
      originalCourse = null;
    },
  );
  await check(
    "notification outbox reports unconfigured delivery honestly",
    async () => {
      const n = await (
        await req("/api/admin/notifications", { headers: auth() })
      ).json();
      assert.equal(n.configured, false);
      assert.ok(n.pending >= 1);
    },
  );
  await check(
    "a new CMS project gets a real dynamic page without code changes",
    async () => {
      const id = crypto.randomUUID();
      qaProject = {
        ...original,
        id,
        slug: `qa-${id}`,
        name: "QA dynamic project",
        published: false,
      };
      const options = (value) => ({
        method: "POST",
        headers: { ...auth(), "content-type": "application/json" },
        body: JSON.stringify(value),
      });
      assert.equal(
        (await req("/api/admin/projects", options(qaProject))).status,
        200,
      );
      assert.equal((await req(`/projects/${qaProject.slug}`)).status, 404);
      qaProject.published = true;
      assert.equal(
        (await req("/api/admin/projects", options(qaProject))).status,
        200,
      );
      const page = await req(`/projects/${qaProject.slug}`);
      assert.equal(page.status, 200);
      assert.match(await page.text(), /QA dynamic project/);
      assert.equal(
        (
          await req(`/api/admin/projects/${id}`, {
            method: "DELETE",
            headers: auth(),
          })
        ).status,
        409,
      );
      qaProject.published = false;
      await req("/api/admin/projects", options(qaProject));
      assert.equal(
        (
          await req(`/api/admin/projects/${id}`, {
            method: "DELETE",
            headers: auth(),
          })
        ).status,
        200,
      );
      qaProject = null;
    },
  );
  await check(
    "categories are editable and cannot break existing project categories",
    async () => {
      const originalCategories = await (
        await req("/api/admin/categories", { headers: auth() })
      ).json();
      const options = (value) => ({
        method: "POST",
        headers: { ...auth(), "content-type": "application/json" },
        body: JSON.stringify(value),
      });
      assert.equal(
        (
          await req(
            "/api/admin/categories",
            options([...originalCategories, "QA kategoriya"]),
          )
        ).status,
        200,
      );
      const updated = await (await req("/api/categories")).json();
      assert.ok(updated.includes("QA kategoriya"));
      assert.equal(
        (await req("/api/admin/categories", options(["QA kategoriya"]))).status,
        400,
      );
      assert.equal(
        (await req("/api/admin/categories", options(originalCategories)))
          .status,
        200,
      );
    },
  );
  await check(
    "local QA order and attachment can be permanently removed",
    async () => {
      const result = await req(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: auth(),
      });
      assert.equal(result.status, 200);
      const orders = await (
        await req("/api/admin/orders", { headers: auth() })
      ).json();
      assert.equal(
        orders.some((o) => o.id === orderId),
        false,
      );
      orderId = "";
    },
  );
  await check("logout invalidates the session on the server", async () => {
    const response = await req("/api/admin/logout", {
      method: "POST",
      headers: auth(),
    });
    assert.equal(response.status, 200);
    assert.equal(
      (await req("/api/admin/session", { headers: auth() })).status,
      401,
    );
  });
} finally {
  if (qaProject && cookie) {
    await req("/api/admin/projects", {
      method: "POST",
      headers: { ...auth(), "content-type": "application/json" },
      body: JSON.stringify({ ...qaProject, published: false }),
    });
    await req(`/api/admin/projects/${qaProject.id}`, {
      method: "DELETE",
      headers: auth(),
    });
  }
  if (original && cookie)
    await req("/api/admin/projects", {
      method: "POST",
      headers: { ...auth(), "content-type": "application/json" },
      body: JSON.stringify(original),
    });
  if (orderId && cookie)
    await req(`/api/admin/orders/${orderId}`, {
      method: "DELETE",
      headers: auth(),
    });
  if (courseOrderId && cookie)
    await req(`/api/admin/orders/${courseOrderId}`, {
      method: "DELETE",
      headers: auth(),
    });
  if (originalCourse && cookie)
    await req("/api/admin/courses", {
      method: "POST",
      headers: { ...auth(), "content-type": "application/json" },
      body: JSON.stringify(originalCourse),
    });
  mkdirSync("test-artifacts", { recursive: true });
  writeFileSync(
    "test-artifacts/integration.json",
    JSON.stringify({ at: new Date().toISOString(), results }, null, 2),
  );
}
console.log(`${results.length} integration checks passed.`);
