// Server-bot integration API test: starts its own local Worker (own port, own temporary D1/R2 state),
// runs the checks, then stops exactly that process tree and deletes the temporary state.
import assert from "node:assert/strict";
import { execSync, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const state = join(root, ".integration-test-state");
const port = 8797;
const base = `http://127.0.0.1:${port}`;
const token = randomBytes(32).toString("base64url");
const ip = () => `10.${[...randomBytes(3)].join(".")}`;

const api = (path, init = {}, bearer = token) =>
  fetch(`${base}/api/integration${path}`, {
    ...init,
    headers: { authorization: `Bearer ${bearer}`, ...init.headers },
  });

async function submitOrder(name, withFile) {
  const data = new FormData();
  Object.entries({
    name,
    contact: "qa@example.test",
    service: "other",
    description: "Integration API check: list, status, attachment and delete.",
    consent: "yes",
    website: "",
  }).forEach(([k, v]) => data.set(k, v));
  if (withFile)
    data.set(
      "attachment",
      new Blob(["%PDF-1.7\nintegration test"], { type: "application/pdf" }),
      "brief.pdf",
    );
  const r = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { origin: base, "cf-connecting-ip": ip() },
    body: data,
  });
  assert.equal(r.status, 201, await r.clone().text());
  const { orders } = await (await api("/orders")).json();
  const order = orders.find((o) => o.name === name);
  assert.ok(order);
  return order;
}

let worker;
let exitCode = 1;
rmSync(state, { recursive: true, force: true });
mkdirSync(state, { recursive: true });
try {
  execSync(
    `npx wrangler d1 migrations apply alifbit-db --local --persist-to "${state}"`,
    { cwd: root, stdio: "inherit", env: { ...process.env, CI: "1" } },
  );
  const args = [
    "wrangler", "dev", "--ip", "127.0.0.1", "--port", String(port),
    "--persist-to", state, "--infer-origin-from-routes", "false",
    "--show-interactive-dev-session=false",
    "--var", `INTEGRATION_TOKEN:${token}`, "--var", "LOCAL_DEV:true",
  ];
  worker = spawn("npx", args, {
    cwd: root,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, CI: "1" },
  });
  let log = "";
  worker.stdout.on("data", (d) => (log += d));
  worker.stderr.on("data", (d) => (log += d));
  const deadline = Date.now() + 180_000;
  for (;;) {
    try {
      if ((await fetch(`${base}/api/health`)).ok) break;
    } catch {}
    if (Date.now() > deadline) {
      console.error(log.slice(-4000));
      throw new Error("Local Worker did not start in 180 s");
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  // Token is required and does not open the admin API
  assert.equal((await api("/orders", {}, "")).status, 401);
  assert.equal((await api("/orders", {}, `${token}x`)).status, 401);
  assert.equal((await api("/orders", {}, token.slice(1))).status, 401);
  assert.equal(
    (await fetch(`${base}/api/admin/orders`, { headers: { authorization: `Bearer ${token}` } })).status,
    401,
  );
  console.log("PASS token");

  const order = await submitOrder("Integratsiya QA", true);
  const list = await (await api("/orders")).json();
  assert.ok(list.statuses.includes("Yangi"));
  assert.equal(order.status, "Yangi");
  assert.equal(order.attachment_name, "brief.pdf");
  assert.equal("attachment_key" in order, false);
  assert.equal(typeof order.service_name, "string");
  console.log("PASS list");

  const file = await api(`/orders/${order.id}/attachment`);
  assert.equal(file.status, 200);
  assert.equal(file.headers.get("content-type"), "application/pdf");
  assert.match(file.headers.get("content-disposition"), /attachment/);
  assert.match(await file.text(), /%PDF/);
  console.log("PASS attachment");

  const patch = (status) =>
    api(`/orders/${order.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  assert.equal((await patch("Kelishildi")).status, 200);
  assert.equal((await patch("Noma'lum")).status, 400);
  const after = (await (await api("/orders")).json()).orders.find((o) => o.id === order.id);
  assert.equal(after.status, "Kelishildi");
  console.log("PASS status");

  assert.equal((await api(`/orders/${order.id}`, { method: "DELETE" })).status, 200);
  assert.equal((await api(`/orders/${order.id}`, { method: "DELETE" })).status, 404);
  assert.equal((await api(`/orders/${order.id}/attachment`)).status, 404);
  const gone = (await (await api("/orders")).json()).orders.find((o) => o.id === order.id);
  assert.equal(gone, undefined);
  console.log("PASS delete");
  exitCode = 0;
} catch (error) {
  console.error(error);
} finally {
  if (worker?.pid) {
    try {
      if (process.platform === "win32")
        execSync(`taskkill /pid ${worker.pid} /t /f`, { stdio: "ignore" });
      else process.kill(-worker.pid);
    } catch {}
  }
  for (let i = 0; i < 10 && existsSync(state); i++) {
    try {
      rmSync(state, { recursive: true, force: true });
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  if (existsSync(state)) console.error(`Could not delete ${state}`);
  process.exit(exitCode);
}
