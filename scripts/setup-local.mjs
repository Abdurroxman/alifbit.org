import { randomBytes, pbkdf2Sync } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
if (existsSync(".dev.vars")) {
  console.log("Local configuration exists; preserved.");
  process.exit(0);
}
const password = `AlifBit-${randomBytes(14).toString("base64url")}!`;
const salt = randomBytes(24).toString("hex");
const digest = pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex");
writeFileSync(
  ".dev.vars",
  `LOCAL_DEV=true\nADMIN_PASSWORD_HASH="pbkdf2-sha256$100000$${salt}$${digest}"\nSESSION_SECRET=${randomBytes(32).toString("hex")}\nIP_HASH_SECRET=${randomBytes(32).toString("hex")}\n`,
);
writeFileSync(
  "local-admin.txt",
  `AlifBit LOCAL PREVIEW ONLY\nURL: http://127.0.0.1:8787/admin\nPassword: ${password}\n\nNever upload this file or .dev.vars to GitHub.\nCreate new production secrets using README.md.\n`,
);
console.log("Local-only admin credentials created in ignored local-admin.txt.");
