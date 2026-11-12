import { randomBytes, pbkdf2Sync } from "node:crypto";
import readline from "node:readline";
if (!process.stdin.isTTY) {
  console.error("Run this script in an interactive terminal.");
  process.exit(1);
}
process.stdout.write("Production admin password (16+ characters; hidden): ");
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
let password = "";
process.stdin.on("keypress", (str, key) => {
  if (key?.ctrl && key.name === "c") process.exit(1);
  if (key?.name === "backspace") {
    password = password.slice(0, -1);
    return;
  }
  if (key?.name === "return") {
    process.stdin.setRawMode(false);
    if (password.length < 16) {
      console.error("\nUse at least 16 characters.");
      process.exit(1);
    }
    const salt = randomBytes(24).toString("hex"),
      digest = pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex");
    console.log(`\npbkdf2-sha256$100000$${salt}$${digest}`);
    process.exit(0);
  }
  if (str && !key?.ctrl) password += str;
});
