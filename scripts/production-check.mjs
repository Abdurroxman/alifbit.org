import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const base = "https://alifbit.org";
const results = [];
for (const path of [
  "/",
  "/projects",
  "/projects/ovozdan-matnga",
  "/services/integratsiyalar",
  "/services",
  "/about",
  "/contact",
  "/privacy",
  "/journal",
  "/admin",
  "/api/health",
  "/api/projects",
  "/api/categories",
  "/sitemap.xml",
  "/robots.txt",
  "/fonts/manrope-latin.woff2",
  "/fonts/inter-latin.woff2",
  "/brand/mark-left-s.webp",
  "/favicon.ico",
  "/brand/social.png",
]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  results.push({ path, status: 200 });
}
const page = await (await fetch(base + "/")).text();
assert.match(page, /<title>AlifBit/);
const scripts = [...page.matchAll(/src="(\/assets\/[^" ]+\.js)"/g)].map(
  (x) => x[1],
);
assert.ok(scripts.length);
for (const file of scripts) {
  const response = await fetch(base + file);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /javascript/);
}
const projects = await (await fetch(base + "/api/projects")).json();
assert.ok(projects.length >= 1);
assert.equal(
  projects.some((p) => p.name.startsWith("QA")),
  false,
);
assert.equal(projects.some((p) => p.id.startsWith("dalolat")), false);
assert.equal((await fetch(base + "/projects/dalolat")).status, 404);
const services = await (await fetch(base + "/api/services")).json();
assert.equal(services.length, 8);
assert.ok(services.every((s) => s.features.length >= 7 && s.packages.length >= 1));
assert.equal((await fetch(base + "/api/admin/orders")).status, 401);
const www = await fetch("https://www.alifbit.org/", { redirect: "manual" });
assert.equal(www.status, 308);
assert.equal(www.headers.get("location"), base + "/");
const password = readFileSync("production-admin.txt", "utf8").match(
  /Password: (.+)/,
)[1];
const origin = { origin: base };
const login = await fetch(base + "/api/admin/login", {
  method: "POST",
  headers: { ...origin, "content-type": "application/json" },
  body: JSON.stringify({ password }),
});
assert.equal(login.status, 200, await login.clone().text());
const session = login.headers.get("set-cookie");
assert.match(session, /Secure/);
assert.match(session, /HttpOnly/);
const headers = { ...origin, cookie: session.split(";")[0] };
assert.equal(
  (await fetch(base + "/api/admin/orders", { headers })).status,
  200,
);
const logout = await fetch(base + "/api/admin/logout", {
  method: "POST",
  headers,
});
assert.equal(logout.status, 200);
assert.equal(
  (await fetch(base + "/api/admin/session", { headers })).status,
  401,
);
mkdirSync("test-artifacts", { recursive: true });
writeFileSync(
  "test-artifacts/production.json",
  JSON.stringify(
    {
      at: new Date().toISOString(),
      base,
      results,
      adminSecureLoginAndLogout: true,
      wwwRedirect: true,
      publicProjects: projects.length,
    },
    null,
    2,
  ),
);
console.log(
  `Live verification passed: ${results.length} endpoints, production assets, ${projects.length} public projects, www redirect and Secure/HttpOnly administrator login/logout. No customer data or order fixtures created.`,
);
