import test from "node:test";
import assert from "node:assert/strict";
import { pbkdf2Sync } from "node:crypto";
import {
  escapeHtml,
  safeUrl,
  validSlug,
  verifyPassword,
  hashPassword,
  fileType,
  isSameOrigin,
  isLocalRequest,
  cookieValue,
} from "../server/security.ts";
import { orderSchema, projectSchema } from "../server/validation.ts";
import { initialProjects } from "../shared/content.ts";
test("HTML and script schemes cannot enter metadata or external links", () => {
  assert.equal(escapeHtml('<script>"&'), "&lt;script&gt;&quot;&amp;");
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("data:text/html,test"), "");
  assert.equal(safeUrl("https://user:pass@example.com"), "");
  assert.equal(safeUrl("https://example.com"), "https://example.com/");
  assert.equal(validSlug("../admin"), false);
  assert.equal(validSlug("foydali-loyiha-2"), true);
});
test("only matching origin is accepted for mutations", () => {
  assert.equal(
    isSameOrigin(
      new Request("https://alifbit.org/api/orders", {
        headers: { origin: "https://evil.example" },
      }),
    ),
    false,
  );
  assert.equal(
    isSameOrigin(
      new Request("https://alifbit.org/api/orders", {
        headers: { origin: "https://alifbit.org" },
      }),
    ),
    true,
  );
  assert.equal(
    isSameOrigin(new Request("https://alifbit.org/api/orders")),
    false,
  );
});
test("development flag cannot enable insecure cookies on public domain", () => {
  assert.equal(
    isLocalRequest(new Request("https://alifbit.org"), "true"),
    false,
  );
  assert.equal(
    isLocalRequest(new Request("http://127.0.0.1:8787"), "true"),
    true,
  );
  assert.equal(isLocalRequest(new Request("http://127.0.0.1:8787")), false);
});
test("file signatures enforce allowed formats, excluding SVG and HTML", () => {
  assert.equal(
    fileType(new TextEncoder().encode("<svg><script>alert(1)</script></svg>")),
    null,
  );
  assert.equal(
    fileType(new TextEncoder().encode("%PDF-1.7")),
    "application/pdf",
  );
  assert.equal(
    fileType(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])),
    "image/png",
  );
  assert.equal(fileType(new Uint8Array([255, 216, 255, 1])), "image/jpeg");
  assert.equal(
    fileType(new TextEncoder().encode("RIFF1234WEBP")),
    "image/webp",
  );
});
test("password verification rejects wrong passwords and malformed hashes", async () => {
  const salt = "test-salt-not-a-production-secret";
  const digest = pbkdf2Sync(
    "correct-test-password",
    salt,
    100000,
    32,
    "sha256",
  ).toString("hex");
  const stored = `pbkdf2-sha256$100000$${salt}$${digest}`;
  assert.equal(await verifyPassword("correct-test-password", stored), true);
  assert.equal(await verifyPassword("wrong-test-password", stored), false);
  assert.equal(await verifyPassword("test", "broken"), false);
  // Admin paneldan yaratilgan xesh shu formatda va o'sha tekshiruvdan o'tadi.
  const made = await hashPassword("panel-new-password-123");
  assert.match(made, /^pbkdf2-sha256\$100000\$[0-9a-f]{48}\$[0-9a-f]{64}$/);
  assert.equal(await verifyPassword("panel-new-password-123", made), true);
  assert.equal(await verifyPassword("panel-new-password-124", made), false);
  assert.notEqual(await hashPassword("panel-new-password-123"), made);
  assert.equal(
    cookieValue(
      "another=one; alifbit_session=abc; theme=ivory",
      "alifbit_session",
    ),
    "abc",
  );
});
test("orders require consent, valid contact and substantial description", () => {
  const order = {
    name: "Test User",
    contact: "@id799",
    service: "development",
    description: "A real project description with enough context.",
    consent: "yes",
    website: "",
  };
  assert.equal(orderSchema.safeParse(order).success, true);
  assert.equal(
    orderSchema.safeParse({ ...order, consent: "no" }).success,
    false,
  );
  assert.equal(
    orderSchema.safeParse({ ...order, contact: "invalid-contact" }).success,
    false,
  );
  assert.equal(
    orderSchema.safeParse({ ...order, website: "spam-site" }).success,
    false,
  );
  assert.equal(
    orderSchema.safeParse({ ...order, description: "short" }).success,
    false,
  );
});
test("CMS data cannot publish unsafe URLs, traversal slugs or SVG covers", () => {
  assert.equal(projectSchema.safeParse(initialProjects[0]).success, true);
  assert.equal(
    projectSchema.safeParse({
      ...initialProjects[0],
      url: "javascript:alert(1)",
    }).success,
    false,
  );
  assert.equal(
    projectSchema.safeParse({ ...initialProjects[0], slug: "../../admin" })
      .success,
    false,
  );
  assert.equal(
    projectSchema.safeParse({
      ...initialProjects[0],
      cover: "/media/public/file.svg",
    }).success,
    false,
  );
});
