// Jonli admin panel parolini almashtiradi: yangi parol ikki marta so'raladi (ekranda ko'rinmaydi),
// PBKDF2 xeshi jonli D1 bazasidagi settings jadvaliga (admin_password_hash) yoziladi va barcha kirishlar yopiladi.
// Admin paneldagi «Sozlamalar» ham shu yozuvni almashtiradi; Cloudflare secret'i faqat zaxira bo'lib qoladi.
// Parolning o'zi hech qayerda saqlanmaydi. Ishga tushirish: node scripts/change-admin-password.mjs
import { randomBytes, pbkdf2Sync } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import readline from "node:readline";

if (!process.stdin.isTTY) {
  console.error("Bu skriptni terminalda ishga tushiring.");
  process.exit(1);
}

function ask(label) {
  return new Promise((resolve) => {
    process.stdout.write(label);
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    let value = "";
    const onKey = (str, key) => {
      if (key?.ctrl && key.name === "c") {
        process.stdin.setRawMode(false);
        process.stdout.write("\n");
        process.exit(1);
      }
      if (key?.name === "backspace") {
        value = value.slice(0, -1);
        return;
      }
      if (key?.name === "return" || key?.name === "enter") {
        process.stdin.off("keypress", onKey);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write("\n");
        resolve(value);
        return;
      }
      if (str && !key?.ctrl) value += str;
    };
    process.stdin.on("keypress", onKey);
  });
}

const password = await ask("Yangi admin paroli (kamida 16 belgi, ekranda ko‘rinmaydi): ");
if (password.length < 16 || password.length > 256) {
  console.error("Parol 16–256 belgidan iborat bo‘lsin.");
  process.exit(1);
}
if ((await ask("Parolni yana bir marta kiriting: ")) !== password) {
  console.error("Parollar mos kelmadi. Hech narsa o‘zgarmadi.");
  process.exit(1);
}

const salt = randomBytes(24).toString("hex");
const hash = `pbkdf2-sha256$100000$${salt}$${pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex")}`;
// Xesh faqat [a-z0-9$] belgilaridan iborat, SQL ichiga xavfsiz qo'yiladi.
const sql =
  `INSERT INTO settings(key,data) VALUES('admin_password_hash','"${hash}"') ON CONFLICT(key) DO UPDATE SET data=excluded.data;\n` +
  "DELETE FROM sessions;\n";

const dir = mkdtempSync(join(tmpdir(), "alifbit-pass-"));
const file = join(dir, "password.sql");
writeFileSync(file, sql);
console.log("Jonli bazaga yozilmoqda…");
const result = spawnSync("npx", ["wrangler", "d1", "execute", "alifbit-db", "--remote", "--yes", `--file=${file}`], {
  stdio: ["ignore", "inherit", "inherit"],
  shell: process.platform === "win32",
});
rmSync(dir, { recursive: true, force: true });
if (result.status !== 0) {
  console.error("Bazaga yozib bo‘lmadi. Eski parol amalda qoladi.");
  process.exit(1);
}
console.log("Tayyor. https://alifbit.org/admin ga yangi parol bilan kiring.");
