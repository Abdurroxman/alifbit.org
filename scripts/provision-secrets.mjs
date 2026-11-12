import { randomBytes, pbkdf2Sync } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
if (existsSync("production-admin.txt")) {
  console.error(
    "Production credentials already exist; refusing to rotate them implicitly.",
  );
  process.exit(1);
}
const password = `AlifBit-${randomBytes(20).toString("base64url")}!`,
  salt = randomBytes(24).toString("hex");
const secrets = {
  ADMIN_PASSWORD_HASH: `pbkdf2-sha256$100000$${salt}$${pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex")}`,
  SESSION_SECRET: randomBytes(32).toString("hex"),
  IP_HASH_SECRET: randomBytes(32).toString("hex"),
};
const result = spawnSync(
  process.execPath,
  ["node_modules/wrangler/bin/wrangler.js", "secret", "bulk"],
  {
    input: JSON.stringify(secrets),
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env,
  },
);
if (result.status !== 0) {
  console.error(
    result.stdout || "",
    result.stderr || "Secret provisioning failed",
  );
  process.exit(result.status || 1);
}
writeFileSync(
  "production-admin.txt",
  `AlifBit — PRIVATE ADMIN CREDENTIAL\nURL: https://alifbit.org/admin\nPassword: ${password}\n\nKeep this file private. It is excluded from Git and delivery ZIP archives.\nCloudflare stores only a PBKDF2 password hash; the raw password is not deployed.\n`,
);
console.log(
  "Production secrets stored in Cloudflare. Private admin password saved to ignored production-admin.txt; no secret values printed.",
);
