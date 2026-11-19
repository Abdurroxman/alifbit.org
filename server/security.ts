export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function safeUrl(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}
export function validSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 100;
}
export function isLocalRequest(request: Request, localFlag?: string) {
  return (
    localFlag === "true" &&
    ["127.0.0.1", "localhost", "[::1]"].includes(new URL(request.url).hostname)
  );
}
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}
export async function hash(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function keyedHash(value: string, key: string) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const result = await crypto.subtle.sign(
    "HMAC",
    material,
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(result)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export function constantEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++)
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
export async function verifyPassword(password: string, stored: string) {
  const [algorithm, iterations, salt, digest] = stored.split("$");
  const rounds = Number(iterations);
  if (
    algorithm !== "pbkdf2-sha256" ||
    !salt ||
    !digest ||
    rounds < 100000 ||
    rounds > 1000000
  )
    return false;
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: rounds,
      hash: "SHA-256",
    },
    material,
    256,
  );
  return constantEqual(
    [...new Uint8Array(derived)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
    digest,
  );
}
/** Parol xeshi verifyPassword va scripts/hash-password.mjs bilan bir xil formatda: pbkdf2-sha256$100000$tuz$xesh. */
export async function hashPassword(password: string) {
  const salt = [...crypto.getRandomValues(new Uint8Array(24))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256" },
    material,
    256,
  );
  const digest = [...new Uint8Array(derived)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `pbkdf2-sha256$100000$${salt}$${digest}`;
}
export function fileType(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  )
    return "application/pdf";
  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)
  )
    return "image/png";
  if (
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    return "image/jpeg";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
  return null;
}
export function cookieValue(header: string | null, name: string) {
  return (
    (header || "")
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${name}=`))
      ?.slice(name.length + 1) || ""
  );
}
