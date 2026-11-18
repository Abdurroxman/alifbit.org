// 3D qurilmalar ekranidagi maketlar: canvas'da chiziladi, tashqi rasm talab qilmaydi.
// Har maket saytning joriy mavzusida (to'q/yorug') va o'z xizmati rangida chiziladi.
// Haqiqiy ishlar (DALOLAT) esa rasm sifatida yuklanadi — IMAGE_SCREENS.

export type DrawnScreen =
  | "home"
  | "web"
  | "design"
  | "telegram"
  | "app"
  | "course"
  | "sado"
  | "ai"
  | "integration"
  | "seo"
  | "support";
export type ImageScreen = "dalolat-site" | "dalolat-feed";
export type ScreenKey = DrawnScreen | ImageScreen;
export type Device = "laptop" | "phone";
export type ScreenTheme = "dark" | "light";

export const IMAGE_SCREENS: Record<ImageScreen, string> = {
  "dalolat-site": "/images/works/dalolat-site.webp",
  "dalolat-feed": "/images/dalolat/feed.webp",
};

export function isImageScreen(key: ScreenKey): key is ImageScreen {
  return key in IMAGE_SCREENS;
}

/** Ekran o'lchami modellardagi ekran nisbatiga teng: MacBook 1,69 : 1, iPhone 1 : 2,17. */
export const SCREEN_SIZE: Record<Device, [number, number]> = {
  laptop: [1352, 800],
  phone: [540, 1172],
};

const HEAD = "Manrope, 'Segoe UI', Arial, sans-serif";
const BODY = "Inter, 'Segoe UI', Arial, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";

type Pal = {
  bg: string;
  surface: string;
  surface2: string;
  line: string;
  ink: string;
  muted: string;
  faint: string;
  brand: string;
  gold: string;
  ok: string;
  dark: boolean;
};

const PAL: Record<ScreenTheme, Pal> = {
  dark: {
    bg: "#0b0d0c",
    surface: "#141816",
    surface2: "#1c211e",
    line: "#ffffff1c",
    ink: "#eef0ea",
    muted: "#98a29a",
    faint: "#ffffff14",
    brand: "#7fcb98",
    gold: "#d2ae6d",
    ok: "#2fd39b",
    dark: true,
  },
  light: {
    bg: "#f9f8f5",
    surface: "#ffffff",
    surface2: "#f1efe9",
    line: "#e2dfd6",
    ink: "#1f2622",
    muted: "#6d766f",
    faint: "#2445340d",
    brand: "#244534",
    gold: "#a8844c",
    ok: "#0c9a6f",
    dark: false,
  },
};

/** Xizmat ranglari: base.css dagi --svc-* bilan bir xil. */
const SVC: Record<ScreenTheme, Record<string, string>> = {
  dark: {
    web: "#5b8cff",
    telegram: "#3db4f2",
    ai: "#a183ff",
    app: "#ff8f3d",
    design: "#ff5fa8",
    integration: "#2fd39b",
    seo: "#f6c343",
    support: "#ff6b6b",
  },
  light: {
    web: "#2357e8",
    telegram: "#0e87c9",
    ai: "#7445e6",
    app: "#e2620a",
    design: "#d6337f",
    integration: "#0c9a6f",
    seo: "#b98500",
    support: "#d63a3a",
  },
};
const SERVICE_ORDER: Array<[string, string]> = [
  ["web", "Veb-sayt"],
  ["telegram", "Telegram bot"],
  ["ai", "AI yordamchi"],
  ["app", "Ilova"],
  ["design", "Dizayn"],
  ["integration", "Integratsiyalar"],
  ["seo", "SEO"],
  ["support", "Texnik yordam"],
];

type Ctx = CanvasRenderingContext2D;
type Draw = (c: Ctx, w: number, h: number, phone: boolean, p: Pal, a: string, t: ScreenTheme) => void;

function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
}
function stroke(c: Ctx, x: number, y: number, w: number, h: number, r: number, color: string, lw = 2) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.strokeStyle = color;
  c.lineWidth = lw;
  c.stroke();
}
function txt(c: Ctx, s: string, x: number, y: number, size: number, color: string, weight = 500, font = BODY, align: CanvasTextAlign = "left") {
  c.font = `${weight} ${size}px ${font}`;
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = "alphabetic";
  c.fillText(s, x, y);
  c.textAlign = "left";
}
/** Rangning shaffof varianti: "#rrggbb" + alfa. */
function alpha(hex: string, a: number) {
  return hex + Math.round(a * 255).toString(16).padStart(2, "0");
}
/** Matn o'rnida ingichka chiziqlar — maketdagi «paragraf». */
function lines(c: Ctx, x: number, y: number, w: number, n: number, gap: number, color: string, h = 10) {
  for (let i = 0; i < n; i++) rr(c, x, y + i * gap, w * (i === n - 1 ? 0.6 : 1 - (i % 3) * 0.08), h, h / 2, color);
}
function dot(c: Ctx, x: number, y: number, r: number, fill: string) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
}
/** Fondagi nuqtalar to'ri (saytning o'zidagi kabi), aniq takrorlanadigan joylashuv bilan. */
function network(c: Ctx, w: number, h: number, color: string, n: number) {
  const pts: Array<[number, number]> = [];
  let s = 7;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) pts.push([rnd() * w, rnd() * h]);
  c.lineWidth = 1;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d > 150) continue;
      c.strokeStyle = alpha(color, 0.35 * (1 - d / 150));
      c.beginPath();
      c.moveTo(pts[i][0], pts[i][1]);
      c.lineTo(pts[j][0], pts[j][1]);
      c.stroke();
    }
  for (const [x, y] of pts) dot(c, x, y, 2, alpha(color, 0.6));
}
function glow(c: Ctx, x: number, y: number, r: number, color: string, a = 0.28) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, alpha(color, a));
  g.addColorStop(1, alpha(color, 0));
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}

/** iPhone holat qatori: soat chapda, aloqa va batareya o'ngda (o'rtada Dynamic Island turadi). */
function statusBar(c: Ctx, w: number, color: string) {
  txt(c, "9:41", 58, 58, 26, color, 600, BODY);
  const x = w - 132;
  for (let i = 0; i < 4; i++) rr(c, x + i * 9, 50 - i * 5, 6, 8 + i * 5, 2, color);
  c.beginPath();
  c.arc(x + 58, 56, 13, Math.PI * 1.22, Math.PI * 1.78);
  c.strokeStyle = color;
  c.lineWidth = 4;
  c.stroke();
  stroke(c, x + 78, 38, 40, 22, 6, alpha(color.slice(0, 7), 0.5), 2);
  rr(c, x + 81, 41, 30, 16, 4, color);
}
/** macOS oynasi: chapda uchta rangli tugma va manzil qatori. */
function windowBar(c: Ctx, w: number, p: Pal, url: string) {
  rr(c, 0, 0, w, 56, 0, p.surface);
  rr(c, 0, 55, w, 1, 0, p.line);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => dot(c, 28 + i * 24, 28, 7, col));
  rr(c, w / 2 - 230, 13, 460, 30, 9, p.surface2);
  txt(c, url, w / 2, 34, 15, p.muted, 500, BODY, "center");
}

const home: Draw = (c, w, h, phone, p, _a, t) => {
  c.fillStyle = p.bg;
  c.fillRect(0, 0, w, h);
  glow(c, w * 0.15, h * 0.25, w * 0.6, t === "dark" ? "#2a6b47" : "#9cc5a6", t === "dark" ? 0.4 : 0.35);
  network(c, w, h, t === "dark" ? "#d2ae6d" : "#466b50", phone ? 22 : 40);
  const svc = SVC[t];
  if (phone) {
    statusBar(c, w, p.ink);
    txt(c, "Alif", 40, 132, 32, p.ink, 700, HEAD);
    txt(c, "Bit", 40 + c.measureText("Alif").width, 132, 32, p.gold, 700, HEAD);
    txt(c, "Sizga nima", 40, 240, 58, p.ink, 600, HEAD);
    txt(c, "kerak?", 40, 304, 58, p.ink, 600, HEAD);
    SERVICE_ORDER.slice(0, 7).forEach(([k, name], i) => {
      const y = 350 + i * 108;
      rr(c, 30, y, w - 60, 92, 18, alpha(p.surface.slice(0, 7), 0.92));
      stroke(c, 30, y, w - 60, 92, 18, p.line, 2);
      rr(c, 30, y + 14, 5, 64, 3, svc[k]);
      txt(c, `0${i + 1}`, 58, y + 56, 19, svc[k], 700);
      txt(c, name, 106, y + 56, 27, p.ink, 600, HEAD);
      txt(c, "→", w - 72, y + 57, 26, p.muted, 500);
    });
    return;
  }
  rr(c, 0, 0, w, 64, 0, alpha(p.bg, 0.85));
  txt(c, "Alif", 52, 42, 26, p.ink, 700, HEAD);
  txt(c, "Bit", 52 + c.measureText("Alif").width, 42, 26, p.gold, 700, HEAD);
  ["Xizmatlar", "Ishlar", "Kurslar", "Biz haqimizda"].forEach((s, i) => txt(c, s, 470 + i * 128, 40, 17, p.muted, 500));
  rr(c, w - 222, 14, 178, 38, 19, p.brand === "#7fcb98" ? "#1d5639" : p.brand);
  txt(c, "Buyurtma berish", w - 133, 39, 16, "#ffffff", 600, HEAD, "center");
  txt(c, "— ALIFBIT · STUDIYA", 52, 128, 15, p.gold, 700);
  txt(c, "Sizga nima kerak?", 52, 204, 66, p.ink, 600, HEAD);
  SERVICE_ORDER.forEach(([k, name], i) => {
    const y = 250 + i * 64;
    rr(c, 52, y, 560, 54, 13, alpha(p.surface.slice(0, 7), 0.9));
    stroke(c, 52, y, 560, 54, 13, p.line, 1.5);
    rr(c, 52, y + 10, 4, 34, 2, svc[k]);
    txt(c, `0${i + 1}`, 76, y + 34, 15, svc[k], 700);
    txt(c, name, 118, y + 34, 20, p.ink, 600, HEAD);
    txt(c, "→", 584, y + 35, 19, p.muted, 500);
  });
  // O'ng tomonda: xizmatlar chizmasi
  const cx = 1010;
  const cy = 470;
  SERVICE_ORDER.forEach(([k], i) => {
    const ang = -Math.PI / 2 + (i / 8) * Math.PI * 2;
    const x = cx + Math.cos(ang) * 230;
    const y = cy + Math.sin(ang) * 230;
    c.strokeStyle = alpha(svc[k], 0.8);
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx, cy);
    c.quadraticCurveTo((cx + x) / 2 + Math.sin(ang) * 40, (cy + y) / 2 - Math.cos(ang) * 40, x, y);
    c.stroke();
    rr(c, x - 26, y - 26, 52, 52, 13, p.surface);
    stroke(c, x - 26, y - 26, 52, 52, 13, svc[k], 2);
    dot(c, x, y, 8, svc[k]);
  });
  rr(c, cx - 56, cy - 46, 112, 92, 20, p.surface);
  stroke(c, cx - 56, cy - 46, 112, 92, 20, p.gold, 2.5);
  rr(c, cx - 22, cy - 22, 44, 44, 8, alpha(p.gold, 0.85));
};

const web: Draw = (c, w, h, phone, p, a) => {
  c.fillStyle = p.bg;
  c.fillRect(0, 0, w, h);
  const top = phone ? 90 : 56;
  if (phone) statusBar(c, w, p.ink);
  else windowBar(c, w, p, "sizning-saytingiz.uz");
  // Mijoz sayti: menyu, katta sarlavha, rasm o'rni va kartalar
  rr(c, phone ? 30 : 60, top + 26, phone ? 110 : 130, 22, 11, p.ink);
  if (!phone) ["Bosh sahifa", "Xizmatlar", "Narxlar", "Aloqa"].forEach((s, i) => txt(c, s, 640 + i * 130, top + 44, 16, p.muted, 500));
  rr(c, w - (phone ? 84 : 200), top + 16, phone ? 54 : 140, 42, 21, a);
  if (!phone) txt(c, "Qo‘ng‘iroq", w - 130, top + 43, 16, "#fff", 600, HEAD, "center");
  const hx = phone ? 30 : 60;
  const hy = top + (phone ? 130 : 120);
  txt(c, "Biznesingiz", hx, hy, phone ? 58 : 70, p.ink, 700, HEAD);
  txt(c, "internetda.", hx, hy + (phone ? 66 : 80), phone ? 58 : 70, a, 700, HEAD);
  lines(c, hx, hy + (phone ? 110 : 128), phone ? w - 120 : 470, 2, 26, p.faint, 12);
  rr(c, hx, hy + (phone ? 180 : 196), phone ? 230 : 210, 58, 29, a);
  txt(c, "Buyurtma berish", hx + (phone ? 115 : 105), hy + (phone ? 217 : 233), phone ? 22 : 19, "#fff", 600, HEAD, "center");
  const ix = phone ? 30 : 700;
  const iy = phone ? hy + 280 : top + 70;
  const iw = phone ? w - 60 : 590;
  const ih = phone ? 300 : 380;
  const g = c.createLinearGradient(ix, iy, ix + iw, iy + ih);
  g.addColorStop(0, alpha(a, 0.95));
  g.addColorStop(1, alpha(a, 0.35));
  rr(c, ix, iy, iw, ih, 24, p.surface2);
  c.save();
  c.beginPath();
  c.roundRect(ix, iy, iw, ih, 24);
  c.clip();
  c.fillStyle = g;
  c.fillRect(ix, iy, iw, ih);
  dot(c, ix + iw * 0.7, iy + ih * 0.35, ih * 0.22, "#ffffff40");
  c.beginPath();
  c.moveTo(ix, iy + ih);
  c.lineTo(ix + iw * 0.35, iy + ih * 0.5);
  c.lineTo(ix + iw * 0.6, iy + ih * 0.78);
  c.lineTo(ix + iw * 0.8, iy + ih * 0.6);
  c.lineTo(ix + iw, iy + ih);
  c.fillStyle = "#ffffff38";
  c.fill();
  c.restore();
  const cy = phone ? iy + ih + 30 : top + 500;
  const n = phone ? 2 : 3;
  const cw = (w - hx * 2 - (n - 1) * 22) / n;
  for (let i = 0; i < n; i++) {
    const x = hx + i * (cw + 22);
    rr(c, x, cy, cw, phone ? 200 : 210, 20, p.surface);
    stroke(c, x, cy, cw, phone ? 200 : 210, 20, p.line, 1.5);
    rr(c, x + 22, cy + 24, 46, 46, 13, alpha(a, 0.18));
    dot(c, x + 45, cy + 47, 9, a);
    lines(c, x + 22, cy + 96, cw - 44, 3, 28, p.faint, 11);
  }
};

const telegram: Draw = (c, w, h, phone, p, a) => {
  c.fillStyle = p.bg;
  c.fillRect(0, 0, w, h);
  const x0 = phone ? 0 : 360;
  if (!phone) {
    rr(c, 0, 0, 360, h, 0, p.surface);
    rr(c, 359, 0, 1, h, 0, p.line);
    rr(c, 20, 20, 320, 44, 22, p.surface2);
    txt(c, "Qidirish", 48, 48, 16, p.muted, 500);
    const names = ["Do‘kon bot", "Navbat bot", "Kafe bot", "Klinika", "Kurslar", "Yetkazish", "Savollar"];
    names.forEach((n, i) => {
      const y = 84 + i * 96;
      if (i === 0) rr(c, 10, y - 6, 340, 86, 14, alpha(a, 0.16));
      dot(c, 52, y + 36, 28, i === 0 ? a : [p.gold, "#7d8a82", p.brand][i % 3]);
      txt(c, n, 96, y + 30, 18, p.ink, 600, HEAD);
      rr(c, 96, y + 46, 180 - (i % 3) * 30, 10, 5, p.faint);
      txt(c, ["12:40", "11:02", "Kecha"][i % 3], 330, y + 28, 13, p.muted, 500, BODY, "right");
    });
  }
  const cw = w - x0;
  const head = phone ? 170 : 84;
  rr(c, x0, 0, cw, head, 0, p.surface);
  rr(c, x0, head - 1, cw, 1, 0, p.line);
  if (phone) statusBar(c, w, p.ink);
  const hy = phone ? 100 : 18;
  dot(c, x0 + 60, hy + 28, 28, a);
  txt(c, "B", x0 + 60, hy + 38, 26, "#fff", 700, HEAD, "center");
  txt(c, "Do‘kon bot", x0 + 104, hy + 24, phone ? 26 : 21, p.ink, 600, HEAD);
  txt(c, "bot · onlayn", x0 + 104, hy + 50, phone ? 19 : 15, a, 500);
  // Chat foni: mayda naqsh
  for (let i = 0; i < 26; i++) dot(c, x0 + ((i * 97) % cw), head + 40 + ((i * 151) % (h - head - 120)), 3, p.faint);
  let y = head + (phone ? 30 : 28);
  const fs = phone ? 23 : 18;
  const bubble = (text: string[], mine: boolean) => {
    c.font = `400 ${fs}px ${BODY}`;
    const bw = Math.min(cw * 0.74, 48 + Math.max(...text.map((s) => c.measureText(s).width)));
    const bh = 26 + text.length * fs * 1.45;
    const bx = mine ? x0 + cw - bw - 26 : x0 + 26;
    rr(c, bx, y, bw, bh, 18, mine ? a : p.surface);
    text.forEach((s, i) => txt(c, s, bx + 22, y + 12 + fs * 1.12 + i * fs * 1.45, fs, mine ? "#fff" : p.ink, 400));
    y += bh + 14;
  };
  bubble(["Assalomu alaykum!", "Bo‘limni tanlang:"], false);
  const bw = (Math.min(cw * 0.74, 520) - 12) / 2;
  ["🛍 Katalog", "🧺 Savat", "📦 Buyurtma", "☎ Aloqa"].forEach((b, i) => {
    const bx = x0 + 26 + (i % 2) * (bw + 12);
    const by = y + Math.floor(i / 2) * (phone ? 70 : 56);
    rr(c, bx, by, bw, phone ? 58 : 46, 12, alpha(a, 0.16));
    txt(c, b, bx + bw / 2, by + (phone ? 38 : 30), fs - 2, a, 600, BODY, "center");
  });
  y += (phone ? 70 : 56) * 2 + 10;
  bubble(["📦 Buyurtma"], true);
  bubble(["Qabul qilindi: №1024 ✓", "Yetkazish — 40 daqiqa."], false);
  if (!phone) bubble(["Rahmat!"], true);
  rr(c, x0 + 18, h - (phone ? 100 : 70), cw - 36, phone ? 70 : 52, 26, p.surface);
  txt(c, "Xabar yozing…", x0 + 46, h - (phone ? 56 : 37), fs - 2, p.muted, 400);
  dot(c, x0 + cw - 52, h - (phone ? 65 : 44), phone ? 24 : 19, a);
};

const ai: Draw = (c, w, h, phone, p, a) => {
  c.fillStyle = p.bg;
  c.fillRect(0, 0, w, h);
  const x0 = phone ? 0 : 380;
  if (!phone) {
    rr(c, 0, 0, 380, h, 0, p.surface);
    rr(c, 379, 0, 1, h, 0, p.line);
    txt(c, "Bilimlar bazasi", 32, 64, 24, p.ink, 700, HEAD);
    ["Narxlar", "Xizmatlar", "Savol-javob", "Yetkazib berish", "Ish vaqti", "Qaytarish"].forEach((s, i) => {
      rr(c, 22, 96 + i * 70, 336, 56, 14, p.surface2);
      rr(c, 42, 112 + i * 70, 24, 24, 7, alpha(a, 0.3 + (i % 3) * 0.2));
      txt(c, s, 82, 131 + i * 70, 18, p.ink, 500);
      txt(c, "✓", 330, 131 + i * 70, 18, p.ok, 700);
    });
    rr(c, 22, h - 110, 336, 80, 16, alpha(a, 0.14));
    txt(c, "Bugun: 46 ta savol", 42, h - 74, 17, p.ink, 600);
    txt(c, "9 ta ariza yozildi", 42, h - 48, 15, p.muted, 500);
  }
  const cw = w - x0;
  const head = phone ? 170 : 86;
  rr(c, x0, 0, cw, head, 0, p.surface);
  rr(c, x0, head - 1, cw, 1, 0, p.line);
  if (phone) statusBar(c, w, p.ink);
  const hy = phone ? 100 : 18;
  rr(c, x0 + 30, hy, 54, 54, 16, a);
  txt(c, "✦", x0 + 57, hy + 38, 26, "#fff", 700, BODY, "center");
  txt(c, "AI yordamchi", x0 + 102, hy + 24, phone ? 26 : 22, p.ink, 600, HEAD);
  dot(c, x0 + 108, hy + 44, 6, p.ok);
  txt(c, "onlayn · o‘zbek, rus", x0 + 122, hy + 50, phone ? 18 : 15, p.muted, 500);
  const fs = phone ? 23 : 19;
  let y = head + 30;
  const items: Array<[boolean, string[]]> = [
    [true, ["Ertaga qabulingizga yozilsam", "bo‘ladimi?"]],
    [false, ["Ha, ertaga 10:00 va 15:30 bo‘sh.", "Qaysi vaqt qulay?"]],
    [true, ["10:00 ga yozing"]],
    [false, ["Ismingiz va raqamingizni qoldiring —", "arizani menejerga yuboraman ✓"]],
  ];
  for (const [mine, text] of items) {
    c.font = `400 ${fs}px ${BODY}`;
    const bw = Math.min(cw * 0.8, 48 + Math.max(...text.map((s) => c.measureText(s).width)));
    const bh = 26 + text.length * fs * 1.45;
    const bx = mine ? x0 + cw - bw - 28 : x0 + 28;
    rr(c, bx, y, bw, bh, 20, mine ? alpha(a, 0.9) : p.surface);
    if (!mine) stroke(c, bx, y, bw, bh, 20, alpha(a, 0.35), 1.5);
    text.forEach((s, i) => txt(c, s, bx + 22, y + 12 + fs * 1.12 + i * fs * 1.45, fs, mine ? "#fff" : p.ink, 400));
    y += bh + 16;
  }
  [0, 1, 2].forEach((i) => dot(c, x0 + 52 + i * 22, y + 16, 6, alpha(a, 0.5 + i * 0.2)));
  rr(c, x0 + 18, h - (phone ? 100 : 72), cw - 36, phone ? 70 : 54, 27, p.surface);
  stroke(c, x0 + 18, h - (phone ? 100 : 72), cw - 36, phone ? 70 : 54, 27, p.line, 1.5);
  txt(c, "Savolingizni yozing…", x0 + 48, h - (phone ? 56 : 38), fs - 2, p.muted, 400);
  dot(c, x0 + cw - 54, h - (phone ? 65 : 45), phone ? 24 : 19, a);
};

const app: Draw = (c, w, h, phone, p, a) => {
  c.fillStyle = p.bg;
  c.fillRect(0, 0, w, h);
  const x0 = phone ? 0 : 230;
  if (!phone) {
    rr(c, 0, 0, 230, h, 0, p.surface);
    rr(c, 229, 0, 1, h, 0, p.line);
    rr(c, 26, 26, 40, 40, 12, a);
    txt(c, "CRM", 80, 54, 22, p.ink, 700, HEAD);
    ["Bosh panel", "Buyurtmalar", "Mijozlar", "Vazifalar", "Ombor", "Hisobotlar", "Sozlamalar"].forEach((s, i) => {
      const y = 104 + i * 54;
      if (i === 0) rr(c, 14, y - 6, 202, 44, 11, alpha(a, 0.16));
      rr(c, 32, y + 6, 18, 18, 5, i === 0 ? a : p.faint);
      txt(c, s, 64, y + 22, 16, i === 0 ? p.ink : p.muted, i === 0 ? 600 : 500);
    });
  }
  const pad = phone ? 28 : 36;
  const top = phone ? 96 : 0;
  if (phone) statusBar(c, w, p.ink);
  txt(c, "Bosh panel", x0 + pad, top + (phone ? 70 : 64), phone ? 40 : 30, p.ink, 700, HEAD);
  if (!phone) txt(c, "18-noyabr, dushanba", w - pad, 62, 16, p.muted, 500, BODY, "right");
  const kpis: Array<[string, string, string]> = [
    ["128", "Buyurtma", "+12%"],
    ["42", "Yangi mijoz", "+8%"],
    ["24,6 mln", "Tushum", "+18%"],
  ];
  const n = phone ? 2 : 3;
  const kw = (w - x0 - pad * 2 - (n - 1) * 18) / n;
  kpis.slice(0, n).forEach(([v, l, d], i) => {
    const x = x0 + pad + i * (kw + 18);
    const y = top + (phone ? 100 : 92);
    rr(c, x, y, kw, phone ? 150 : 128, 18, p.surface);
    stroke(c, x, y, kw, phone ? 150 : 128, 18, p.line, 1.5);
    txt(c, l, x + 22, y + 40, phone ? 20 : 16, p.muted, 500);
    txt(c, v, x + 22, y + (phone ? 98 : 88), phone ? 40 : 36, i === 2 ? a : p.ink, 700, HEAD);
    rr(c, x + kw - 82, y + 20, 62, 28, 14, alpha(p.ok, 0.16));
    txt(c, d, x + kw - 51, y + 40, 14, p.ok, 700, BODY, "center");
  });
  const cy = top + (phone ? 274 : 244);
  const chW = phone ? w - pad * 2 : (w - x0 - pad * 2) * 0.58;
  const chH = phone ? 280 : 300;
  rr(c, x0 + pad, cy, chW, chH, 18, p.surface);
  stroke(c, x0 + pad, cy, chW, chH, 18, p.line, 1.5);
  txt(c, "Haftalik buyurtmalar", x0 + pad + 24, cy + 40, phone ? 20 : 17, p.ink, 600, HEAD);
  const bars = [0.42, 0.55, 0.48, 0.7, 0.62, 0.85, 0.74];
  const bwid = (chW - 48) / bars.length;
  bars.forEach((v, i) => {
    const bh = v * (chH - 100);
    rr(c, x0 + pad + 24 + i * bwid + 6, cy + chH - 26 - bh, bwid - 12, bh, 8, i === 5 ? a : alpha(a, 0.3));
  });
  const ty = phone ? cy + chH + 20 : cy;
  const tx = phone ? x0 + pad : x0 + pad + chW + 18;
  const tw = phone ? w - pad * 2 : w - tx - pad;
  const rowsN = phone ? 5 : 6;
  rr(c, tx, ty, tw, phone ? 440 : chH + 200, 18, p.surface);
  stroke(c, tx, ty, tw, phone ? 440 : chH + 200, 18, p.line, 1.5);
  txt(c, "So‘nggi buyurtmalar", tx + 22, ty + 40, phone ? 20 : 17, p.ink, 600, HEAD);
  const st: Array<[string, string]> = [
    ["Yangi", a],
    ["Yo‘lda", "#3db4f2"],
    ["Bajarildi", p.ok],
  ];
  for (let i = 0; i < rowsN; i++) {
    const y = ty + 66 + i * (phone ? 72 : 76);
    dot(c, tx + 40, y + 20, 18, alpha([a, p.gold, p.brand][i % 3], 0.85));
    rr(c, tx + 72, y + 8, tw * 0.34, 11, 6, p.ink);
    rr(c, tx + 72, y + 28, tw * 0.22, 9, 5, p.faint);
    const [label, col] = st[i % 3];
    rr(c, tx + tw - 128, y + 6, 106, 30, 15, alpha(col.slice(0, 7), 0.16));
    txt(c, label, tx + tw - 75, y + 27, 14, col, 600, BODY, "center");
  }
  if (!phone) {
    const y = cy + chH + 18;
    rr(c, x0 + pad, y, chW, 182, 18, p.surface);
    stroke(c, x0 + pad, y, chW, 182, 18, p.line, 1.5);
    txt(c, "Vazifalar", x0 + pad + 24, y + 40, 17, p.ink, 600, HEAD);
    ["Mijozga qo‘ng‘iroq", "Ombor qoldig‘i", "Hisobot yuborish"].forEach((s, i) => {
      stroke(c, x0 + pad + 24, y + 62 + i * 38, 22, 22, 6, i === 0 ? a : p.line, 2);
      if (i === 0) txt(c, "✓", x0 + pad + 35, y + 80, 16, a, 700, BODY, "center");
      txt(c, s, x0 + pad + 60, y + 80 + i * 38, 16, i === 0 ? p.muted : p.ink, 500);
    });
  }
};

const design: Draw = (c, w, h, phone, p, a, t) => {
  const bg = p.dark ? "#1e1e1e" : "#f0efeb";
  const panel = p.dark ? "#2c2c2c" : "#ffffff";
  c.fillStyle = bg;
  c.fillRect(0, 0, w, h);
  const svc = SVC[t];
  if (!phone) {
    rr(c, 0, 0, 240, h, 0, panel);
    rr(c, w - 260, 0, 260, h, 0, panel);
    txt(c, "Qatlamlar", 22, 40, 15, p.muted, 600);
    ["Bosh sahifa", "  Menyu", "  Sarlavha", "  Rasm", "  Tugma", "  Kartalar", "Mobil", "Narxlar"].forEach((s, i) => {
      if (i === 4) rr(c, 10, 56 + i * 36, 220, 30, 6, alpha(a, 0.25));
      rr(c, 22 + (s.startsWith(" ") ? 16 : 0), 66 + i * 36, 12, 12, 3, i === 4 ? a : p.muted);
      txt(c, s.trim(), 44 + (s.startsWith(" ") ? 16 : 0), 77 + i * 36, 14, p.ink, 500);
    });
    txt(c, "Ranglar", w - 236, 40, 15, p.muted, 600);
    Object.values(svc).forEach((col, i) => rr(c, w - 236 + (i % 4) * 54, 58 + Math.floor(i / 4) * 54, 42, 42, 10, col));
    txt(c, "Shrift", w - 236, 210, 15, p.muted, 600);
    txt(c, "Manrope", w - 236, 252, 28, p.ink, 700, HEAD);
    txt(c, "Aa Bb 123", w - 236, 284, 16, p.muted, 500);
    txt(c, "O‘lcham", w - 236, 334, 15, p.muted, 600);
    ["W 520", "H 320", "R 24"].forEach((s, i) => {
      rr(c, w - 236 + (i % 2) * 112, 352 + Math.floor(i / 2) * 46, 100, 36, 8, p.dark ? "#383838" : "#f1efe9");
      txt(c, s, w - 222 + (i % 2) * 112, 376 + Math.floor(i / 2) * 46, 14, p.ink, 500);
    });
  }
  const ax = phone ? 34 : 290;
  const ay = phone ? 110 : 60;
  const fw = phone ? w - 68 : 470;
  const fh = phone ? 700 : 680;
  if (phone) statusBar(c, w, p.ink);
  txt(c, "Bosh sahifa", ax, ay - 14, 14, p.muted, 500);
  rr(c, ax, ay, fw, fh, 8, p.dark ? "#121212" : "#ffffff");
  rr(c, ax + 26, ay + 30, 90, 16, 8, p.dark ? "#eeeeee" : "#1f2622");
  rr(c, ax + 26, ay + 80, fw * 0.75, 26, 8, p.dark ? "#eeeeee" : "#1f2622");
  rr(c, ax + 26, ay + 116, fw * 0.55, 26, 8, a);
  const ix = ax + 26;
  const iy = ay + 170;
  const iw = fw - 52;
  const ih = fh * 0.38;
  const g = c.createLinearGradient(ix, iy, ix + iw, iy + ih);
  g.addColorStop(0, a);
  g.addColorStop(1, svc.ai);
  rr(c, ix, iy, iw, ih, 18, a);
  c.save();
  c.beginPath();
  c.roundRect(ix, iy, iw, ih, 18);
  c.clip();
  c.fillStyle = g;
  c.fillRect(ix, iy, iw, ih);
  dot(c, ix + iw * 0.75, iy + ih * 0.3, ih * 0.22, "#ffffff40");
  c.restore();
  // Tanlangan element ramkasi va o'lcham yorlig'i
  c.strokeStyle = "#0d99ff";
  c.lineWidth = 2;
  c.strokeRect(ix - 4, iy - 4, iw + 8, ih + 8);
  [[ix - 4, iy - 4], [ix + iw + 4, iy - 4], [ix - 4, iy + ih + 4], [ix + iw + 4, iy + ih + 4]].forEach(([x, y]) => {
    rr(c, x - 6, y - 6, 12, 12, 2, "#ffffff");
    stroke(c, x - 6, y - 6, 12, 12, 2, "#0d99ff", 2);
  });
  rr(c, ix + iw / 2 - 52, iy + ih + 14, 104, 26, 6, "#0d99ff");
  txt(c, `${Math.round(iw)} × ${Math.round(ih)}`, ix + iw / 2, iy + ih + 33, 14, "#fff", 600, BODY, "center");
  lines(c, ax + 26, iy + ih + 66, fw - 52, 3, 26, p.dark ? "#ffffff26" : "#1f262222", 11);
  rr(c, ax + 26, ay + fh - 84, 190, 52, 26, a);
  if (!phone) {
    const mx = ax + fw + 50;
    txt(c, "Mobil", mx, ay - 14, 14, p.muted, 500);
    rr(c, mx, ay, 250, 500, 8, p.dark ? "#121212" : "#ffffff");
    rr(c, mx + 20, ay + 24, 70, 12, 6, p.dark ? "#eeeeee" : "#1f2622");
    rr(c, mx + 20, ay + 60, 200, 20, 6, p.dark ? "#eeeeee" : "#1f2622");
    rr(c, mx + 20, ay + 88, 150, 20, 6, a);
    rr(c, mx + 20, ay + 130, 210, 160, 14, alpha(a, 0.75));
    lines(c, mx + 20, ay + 312, 210, 3, 24, p.dark ? "#ffffff26" : "#1f262222", 9);
    rr(c, mx + 20, ay + 420, 130, 42, 21, a);
    // Hamkasb kursori
    c.beginPath();
    c.moveTo(mx + 190, ay + 230);
    c.lineTo(mx + 190, ay + 262);
    c.lineTo(mx + 199, ay + 253);
    c.lineTo(mx + 210, ay + 270);
    c.lineTo(mx + 215, ay + 266);
    c.lineTo(mx + 205, ay + 250);
    c.lineTo(mx + 218, ay + 248);
    c.closePath();
    c.fillStyle = svc.integration;
    c.fill();
    rr(c, mx + 216, ay + 266, 66, 24, 6, svc.integration);
    txt(c, "Dilnoza", mx + 249, ay + 283, 13, "#fff", 600, BODY, "center");
  } else {
    Object.values(svc)
      .slice(0, 6)
      .forEach((col, i) => rr(c, 34 + i * 80, h - 170, 64, 64, 14, col));
  }
};

const integration: Draw = (c, w, h, phone, p, a) => {
  c.fillStyle = p.bg;
  c.fillRect(0, 0, w, h);
  if (phone) {
    statusBar(c, w, p.ink);
    txt(c, "To‘lov", 34, 160, 46, p.ink, 700, HEAD);
    rr(c, 30, 196, w - 60, 168, 22, p.surface);
    stroke(c, 30, 196, w - 60, 168, 22, p.line, 1.5);
    txt(c, "Buyurtma №1024", 60, 250, 21, p.muted, 500);
    txt(c, "2 400 000 so‘m", 60, 316, 44, p.ink, 700, HEAD);
    ["Payme", "Click", "Uzum", "Uzcard / Humo"].forEach((m, i) => {
      const y = 392 + i * 98;
      rr(c, 30, y, w - 60, 82, 18, p.surface);
      stroke(c, 30, y, w - 60, 82, 18, i === 0 ? a : p.line, i === 0 ? 3 : 1.5);
      dot(c, 76, y + 41, 16, i === 0 ? a : p.faint);
      if (i === 0) dot(c, 76, y + 41, 7, "#fff");
      txt(c, m, 112, y + 50, 26, p.ink, 600);
    });
    rr(c, 30, 800, w - 60, 78, 39, a);
    txt(c, "To‘lash", w / 2, 849, 28, "#fff", 700, HEAD, "center");
    rr(c, 30, h - 230, w - 60, 140, 22, alpha(a, 0.16));
    txt(c, "✓ To‘lov qabul qilindi", 60, h - 172, 27, p.ink, 700, HEAD);
    txt(c, "CRM yangilandi · SMS yuborildi", 60, h - 130, 20, p.muted, 500);
    return;
  }
  windowBar(c, w, p, "panel.sizning-saytingiz.uz");
  txt(c, "Buyurtma yo‘li", 52, 118, 30, p.ink, 700, HEAD);
  txt(c, "Hammasi avtomatik — hech narsani qo‘lda ko‘chirmaysiz", 52, 150, 17, p.muted, 500);
  const steps: Array<[string, string]> = [
    ["Sayt", "Buyurtma"],
    ["Payme · Click", "To‘lov"],
    ["amoCRM", "Mijoz kartasi"],
    ["Eskiz SMS", "Mijozga xabar"],
    ["Telegram", "Sizga xabar"],
  ];
  const bw = 210;
  const gap = (w - 104 - steps.length * bw) / (steps.length - 1);
  steps.forEach(([tl, s], i) => {
    const x = 52 + i * (bw + gap);
    const y = 190;
    rr(c, x, y, bw, 140, 20, i === 1 ? a : p.surface);
    stroke(c, x, y, bw, 140, 20, i === 1 ? a : p.line, 1.5);
    dot(c, x + 40, y + 42, 18, i === 1 ? "#ffffff40" : alpha(a, 0.2));
    txt(c, String(i + 1), x + 40, y + 49, 17, i === 1 ? "#fff" : a, 700, BODY, "center");
    txt(c, tl, x + 22, y + 96, 21, i === 1 ? "#fff" : p.ink, 700, HEAD);
    txt(c, s, x + 22, y + 122, 15, i === 1 ? "#ffffffcc" : p.muted, 500);
    if (i < steps.length - 1) {
      c.strokeStyle = a;
      c.lineWidth = 3;
      c.setLineDash([6, 6]);
      c.beginPath();
      c.moveTo(x + bw + 8, y + 70);
      c.lineTo(x + bw + gap - 8, y + 70);
      c.stroke();
      c.setLineDash([]);
      dot(c, x + bw + gap / 2, y + 70, 6, a);
    }
  });
  rr(c, 52, 366, w - 104, h - 400, 22, p.surface);
  stroke(c, 52, 366, w - 104, h - 400, 22, p.line, 1.5);
  txt(c, "So‘nggi to‘lovlar", 84, 414, 20, p.ink, 600, HEAD);
  const rows: Array<[string, string, string]> = [
    ["№1024", "2 400 000 so‘m", "Payme"],
    ["№1023", "1 200 000 so‘m", "Click"],
    ["№1022", "860 000 so‘m", "Uzum"],
    ["№1021", "3 600 000 so‘m", "Payme"],
    ["№1020", "540 000 so‘m", "Click"],
  ];
  rows.forEach(([n, sum, m], i) => {
    const y = 436 + i * 62;
    rr(c, 84, y, w - 168, 1, 0, p.line);
    txt(c, n, 84, y + 40, 17, p.muted, 500);
    txt(c, sum, 270, y + 40, 18, p.ink, 600);
    txt(c, m, 590, y + 40, 17, p.muted, 500);
    rr(c, w - 270, y + 14, 160, 34, 17, alpha(p.ok, 0.16));
    txt(c, "To‘landi ✓", w - 190, y + 37, 15, p.ok, 600, BODY, "center");
  });
};

const seo: Draw = (c, w, h, phone, p, a) => {
  c.fillStyle = p.bg;
  c.fillRect(0, 0, w, h);
  const top = phone ? 96 : 56;
  if (phone) statusBar(c, w, p.ink);
  else windowBar(c, w, p, "google.com/search");
  const pad = phone ? 30 : 56;
  const colW = phone ? w - pad * 2 : 760;
  rr(c, pad, top + 24, colW, phone ? 66 : 54, 33, p.surface);
  stroke(c, pad, top + 24, colW, phone ? 66 : 54, 33, p.line, 1.5);
  txt(c, "sayt yaratish toshkent", pad + 30, top + (phone ? 66 : 58), phone ? 23 : 19, p.ink, 400);
  dot(c, pad + colW - 34, top + (phone ? 57 : 51), phone ? 16 : 14, a);
  let y = top + (phone ? 130 : 110);
  for (let i = 0; i < 5; i++) {
    const first = i === 0;
    const bh = phone ? 150 : 102;
    if (first) {
      rr(c, pad - 14, y - 14, colW + 28, bh + 4, 16, alpha(a, 0.12));
      stroke(c, pad - 14, y - 14, colW + 28, bh + 4, 16, a, 2);
      rr(c, pad + colW - 70, y - 2, 70, 30, 15, a);
      txt(c, "1-o‘rin", pad + colW - 35, y + 19, 15, p.dark ? "#1a1300" : "#fff", 700, BODY, "center");
    }
    dot(c, pad + 12, y + 12, 12, first ? a : p.faint);
    txt(c, first ? "sizning-saytingiz.uz" : `boshqa-sayt-${i}.uz`, pad + 34, y + (phone ? 20 : 18), phone ? 18 : 15, first ? p.ink : p.muted, 500);
    if (first) txt(c, "Sayt yaratish — 2 haftada, narxi oldindan", pad, y + (phone ? 62 : 52), phone ? 25 : 22, p.dark ? "#8ab4f8" : "#1a4d8f", 600);
    else rr(c, pad, y + (phone ? 40 : 32), colW * (0.62 - (i % 3) * 0.08), phone ? 20 : 16, 8, p.dark ? "#8ab4f855" : "#1a4d8f40");
    lines(c, pad, y + (phone ? 84 : 70), colW - 20, 2, phone ? 24 : 18, p.faint, phone ? 10 : 8);
    y += bh + (phone ? 30 : 26);
  }
  if (!phone) {
    const x = 870;
    const cw = w - x - 50;
    rr(c, x, top + 24, cw, 330, 22, p.surface);
    stroke(c, x, top + 24, cw, 330, 22, p.line, 1.5);
    txt(c, "Qidiruvdan tashriflar", x + 26, top + 70, 17, p.muted, 500);
    txt(c, "+240%", x + 26, top + 126, 46, a, 800, HEAD);
    const pts = [0.92, 0.86, 0.88, 0.72, 0.66, 0.5, 0.42, 0.22];
    const px = (i: number) => x + 26 + (i * (cw - 52)) / (pts.length - 1);
    const py = (v: number) => top + 160 + v * 160;
    c.beginPath();
    pts.forEach((v, i) => (i ? c.lineTo(px(i), py(v)) : c.moveTo(px(i), py(v))));
    c.lineTo(px(pts.length - 1), top + 330);
    c.lineTo(px(0), top + 330);
    c.closePath();
    c.fillStyle = alpha(a, 0.16);
    c.fill();
    c.beginPath();
    pts.forEach((v, i) => (i ? c.lineTo(px(i), py(v)) : c.moveTo(px(i), py(v))));
    c.strokeStyle = a;
    c.lineWidth = 4;
    c.stroke();
    dot(c, px(pts.length - 1), py(pts[pts.length - 1]), 8, a);
    rr(c, x, top + 380, cw, 300, 22, p.surface);
    stroke(c, x, top + 380, cw, 300, 22, p.line, 1.5);
    txt(c, "Oylik hisobot", x + 26, top + 426, 19, p.ink, 600, HEAD);
    ["Texnik audit", "Sarlavha va tavsiflar", "Sitemap va schema", "Google Biznes profili"].forEach((s, i) => {
      dot(c, x + 38, top + 466 + i * 48, 12, alpha(p.ok, 0.18));
      txt(c, "✓", x + 38, top + 472 + i * 48, 15, p.ok, 700, BODY, "center");
      txt(c, s, x + 62, top + 472 + i * 48, 17, p.ink, 500);
    });
  }
};

const support: Draw = (c, w, h, phone, p, a) => {
  c.fillStyle = p.bg;
  c.fillRect(0, 0, w, h);
  const pad = phone ? 30 : 52;
  const top = phone ? 96 : 0;
  if (phone) statusBar(c, w, p.ink);
  txt(c, "Holat", pad, top + (phone ? 72 : 76), phone ? 42 : 34, p.ink, 700, HEAD);
  const bx = phone ? pad : w - 400;
  const by = top + (phone ? 100 : 40);
  rr(c, bx, by, phone ? w - pad * 2 : 348, phone ? 66 : 56, 33, alpha(p.ok, 0.14));
  dot(c, bx + 34, by + (phone ? 33 : 28), 9, p.ok);
  txt(c, "Hammasi ishlayapti", bx + 58, by + (phone ? 42 : 36), phone ? 23 : 19, p.ok, 700);
  const rows: Array<[string, string, string]> = [
    ["Sayt", "99,98%", "ishlagan vaqt"],
    ["Zaxira nusxa", "03:00 ✓", "har kuni"],
    ["SSL sertifikat", "284 kun", "qoldi"],
    ["Xavfsizlik", "Yangi ✓", "18-noyabr"],
    ["Tezlik", "0,8 s", "o‘rtacha"],
    ["Xatolar", "0", "so‘nggi 7 kun"],
  ];
  const cols = phone ? 2 : 3;
  const cw = (w - pad * 2 - (cols - 1) * 20) / cols;
  const ch = phone ? 150 : 140;
  rows.slice(0, phone ? 4 : 6).forEach(([tl, v, s], i) => {
    const x = pad + (i % cols) * (cw + 20);
    const y = top + (phone ? 196 : 130) + Math.floor(i / cols) * (ch + 20);
    rr(c, x, y, cw, ch, 20, p.surface);
    stroke(c, x, y, cw, ch, 20, p.line, 1.5);
    rr(c, x, y + 22, 4, 36, 2, i === 5 ? a : p.ok);
    txt(c, tl, x + 24, y + 46, phone ? 19 : 17, p.muted, 500);
    txt(c, v, x + 24, y + (phone ? 100 : 94), phone ? 32 : 32, p.ink, 700, HEAD);
    txt(c, s, x + 24, y + (phone ? 130 : 122), phone ? 16 : 15, p.muted, 500);
  });
  const uy = top + (phone ? 560 : 450);
  const uw = w - pad * 2;
  rr(c, pad, uy, uw, phone ? 210 : 170, 20, p.surface);
  stroke(c, pad, uy, uw, phone ? 210 : 170, 20, p.line, 1.5);
  txt(c, "So‘nggi 30 kun", pad + 24, uy + 42, phone ? 19 : 17, p.ink, 600, HEAD);
  const n = 30;
  const bw2 = (uw - 48) / n;
  for (let i = 0; i < n; i++) rr(c, pad + 24 + i * bw2, uy + 66, bw2 - 4, phone ? 70 : 54, 4, i === 17 ? a : alpha(p.ok, 0.75));
  txt(c, "1 ta qisqa uzilish — 3 daqiqada tiklandi", pad + 24, uy + (phone ? 176 : 150), phone ? 17 : 15, p.muted, 500);
  if (!phone) {
    const ly = uy + 190;
    rr(c, pad, ly, uw, h - ly - 30, 20, p.surface);
    stroke(c, pad, ly, uw, h - ly - 30, 20, p.line, 1.5);
    ["03:00  Zaxira nusxa olindi", "02:14  Xavfsizlik yangilanishi o‘rnatildi"].forEach((s, i) =>
      txt(c, s, pad + 24, ly + 40 + i * 30, 15, i ? p.muted : p.ink, 500, MONO),
    );
  }
};

const course: Draw = (c, w, h, phone, p, a) => {
  const bg = p.dark ? "#0f1311" : "#1b221e";
  c.fillStyle = bg;
  c.fillRect(0, 0, w, h);
  if (phone) statusBar(c, w, "#e8eee9");
  const codeW = phone ? w : w * 0.6;
  const palette = ["#7fcb98", "#d2ae6d", "#8ab4f8", "#c9cfca", "#ff8f3d", "#a183ff"];
  const rows = phone ? 13 : 20;
  const cy0 = phone ? 110 : 40;
  for (let i = 0; i < rows; i++) {
    const y = cy0 + i * 34;
    txt(c, String(i + 1).padStart(2, " "), 20, y + 12, 15, "#4f5a54", 500, MONO);
    let x = 64 + (i % 4 === 0 ? 0 : (i % 3) * 28);
    const parts = 2 + (i % 3);
    for (let k = 0; k < parts; k++) {
      const pw = 40 + ((i * 7 + k * 13) % 90);
      if (x + pw > codeW - 30) break;
      rr(c, x, y, pw, 13, 6, palette[(i + k) % palette.length]);
      x += pw + 14;
    }
  }
  const ax = phone ? 24 : codeW + 20;
  const ay = phone ? 580 : 40;
  const aw = phone ? w - 48 : w - codeW - 40;
  rr(c, ax, ay, aw, phone ? h - ay - 40 : h - 80, 22, "#ffffff10");
  txt(c, "AI yordamchi", ax + 24, ay + 46, phone ? 25 : 21, "#e8eee9", 600, HEAD);
  const msgs: Array<[number, string]> = [
    [0, "Telegram bot yasaymiz"],
    [1, "Reja tayyor: 3 qadam."],
    [0, "Kodni tekshir"],
    [1, "Hammasi ishlayapti ✓"],
  ];
  msgs.forEach(([fromAi, m], i) => {
    const y = ay + 80 + i * (phone ? 90 : 84);
    const bw = aw - 70;
    rr(c, fromAi ? ax + 20 : ax + 50, y, bw, phone ? 68 : 62, 16, fromAi ? "#ffffff14" : alpha(a, 0.85));
    txt(c, m, (fromAi ? ax + 20 : ax + 50) + 18, y + (phone ? 42 : 39), phone ? 21 : 17, "#f1f3ec", 500);
  });
};

const sado: Draw = (c, w, h, phone) => {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#123029");
  g.addColorStop(1, "#0a1d19");
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  if (phone) statusBar(c, w, "#f1ede2");
  const cx = w / 2;
  const cy = h * (phone ? 0.38 : 0.42);
  const r = phone ? 110 : 96;
  for (let k = 3; k >= 1; k--) dot(c, cx, cy, r + k * (phone ? 34 : 30), `rgba(52, 211, 182, ${0.07 * k})`);
  dot(c, cx, cy, r, "#2fd0b3");
  rr(c, cx - 22, cy - 50, 44, 72, 22, "#0d2620");
  c.strokeStyle = "#0d2620";
  c.lineWidth = 8;
  c.beginPath();
  c.arc(cx, cy - 2, 40, 0.15 * Math.PI, 0.85 * Math.PI);
  c.stroke();
  const bars = phone ? 23 : 41;
  const bw = phone ? 12 : 10;
  const gap = phone ? 8 : 9;
  const span = bars * (bw + gap);
  for (let i = 0; i < bars; i++) {
    const v = Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37));
    const bh = 14 + v * (phone ? 120 : 110);
    rr(c, cx - span / 2 + i * (bw + gap), cy + r + (phone ? 150 : 110) - bh / 2, bw, bh, bw / 2, i % 5 ? "#34d3b6" : "#a7f0e1");
  }
  txt(c, "Gapiring — Sado yozadi", cx, h - (phone ? 210 : 110), 34, "#f1ede2", 600, HEAD, "center");
  txt(c, "Alt tugmasini bosib turing", cx, h - (phone ? 160 : 70), phone ? 24 : 20, "#a9bdb0", 500, BODY, "center");
};

/** Maket qaysi xizmat rangida chiziladi. */
const ACCENT: Record<DrawnScreen, string> = {
  home: "web",
  web: "web",
  design: "design",
  telegram: "telegram",
  app: "app",
  course: "integration",
  sado: "integration",
  ai: "ai",
  integration: "integration",
  seo: "seo",
  support: "support",
};

const DRAW: Record<DrawnScreen, Draw> = {
  home,
  web,
  design,
  telegram,
  app,
  course,
  sado,
  ai,
  integration,
  seo,
  support,
};

/** Maketni yangi canvas'ga chizadi. */
export function drawScreen(key: DrawnScreen, device: Device, theme: ScreenTheme): HTMLCanvasElement {
  const [w, h] = SCREEN_SIZE[device];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d");
  if (c) DRAW[key](c, w, h, device === "phone", PAL[theme], SVC[theme][ACCENT[key]], theme);
  return canvas;
}
