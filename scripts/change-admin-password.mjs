// Jonli admin panel parolini almashtiradi: yangi parol ikki marta so'raladi (ekranda ko'rinmaydi),
// PBKDF2 xeshi Cloudflare'dagi ADMIN_PASSWORD_HASH secret'iga yoziladi. Parolning o'zi hech qayerda saqlanmaydi.
// Ishga tushirish: node scripts/change-admin-password.mjs
import { randomBytes, pbkdf2Sync } from "node:crypto";
import { spawnSync } from "node:child_process";
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
if (password.length < 16) {
  console.error("Parol kamida 16 belgidan iborat bo‘lsin.");
  process.exit(1);
}
if ((await ask("Parolni yana bir marta kiriting: ")) !== password) {
  console.error("Parollar mos kelmadi. Hech narsa o‘zgarmadi.");
  process.exit(1);
}

const salt = randomBytes(24).toString("hex");
const hash = `pbkdf2-sha256$100000$${salt}$${pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex")}`;

console.log("Cloudflare'ga yozilmoqda…");
const result = spawnSync("npx", ["wrangler", "secret", "put", "ADMIN_PASSWORD_HASH"], {
  input: hash,
  stdio: ["pipe", "inherit", "inherit"],
  shell: process.platform === "win32",
});
if (result.status !== 0) {
  console.error("Cloudflare'ga yozib bo‘lmadi. Eski parol amalda qoladi.");
  process.exit(1);
}
console.log("Tayyor. https://alifbit.org/admin ga yangi parol bilan kiring (bir daqiqagacha vaqt olishi mumkin).");
