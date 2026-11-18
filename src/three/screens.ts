// 3D qurilmalar ekranidagi maketlar: canvas'da chiziladi, tashqi rasm talab qilmaydi.
// Haqiqiy ishlar (DALOLAT, Sado sayti) esa rasm sifatida yuklanadi — IMAGE_SCREENS.

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

export const IMAGE_SCREENS: Record<ImageScreen, string> = {
  "dalolat-site": "/images/works/dalolat-site.webp",
  "dalolat-feed": "/images/dalolat/feed.webp",
};

export function isImageScreen(key: ScreenKey): key is ImageScreen {
  return key in IMAGE_SCREENS;
}

const C = {
  ivory: "#f9f8f5",
  paper: "#fdfcfa",
  stone: "#edeae3",
  line: "#dddbd2",
  forest: "#244534",
  green: "#466b50",
  green2: "#8fae94",
  bronze: "#b69a70",
  ink: "#262d29",
  muted: "#7d857f",
};
const HEAD = "Manrope, 'Segoe UI', Arial, sans-serif";
const BODY = "Inter, 'Segoe UI', Arial, sans-serif";

export const SCREEN_SIZE: Record<Device, [number, number]> = {
  laptop: [1280, 800],
  phone: [540, 1156],
};

type Ctx = CanvasRenderingContext2D;

function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
}
function txt(c: Ctx, s: string, x: number, y: number, size: number, color: string, weight = 500, font = BODY) {
  c.font = `${weight} ${size}px ${font}`;
  c.fillStyle = color;
  c.textBaseline = "alphabetic";
  c.fillText(s, x, y);
}
/** Matn o'rnida ingichka chiziqlar — maketdagi «paragraf». */
function lines(c: Ctx, x: number, y: number, w: number, n: number, gap: number, color: string, h = 10) {
  for (let i = 0; i < n; i++) rr(c, x, y + i * gap, w * (i === n - 1 ? 0.6 : 1 - (i % 3) * 0.08), h, h / 2, color);
}

function home(c: Ctx, w: number, h: number, phone: boolean) {
  c.fillStyle = C.ivory;
  c.fillRect(0, 0, w, h);
  const glow = c.createRadialGradient(w * 0.2, h * 0.3, 10, w * 0.2, h * 0.3, w * 0.7);
  glow.addColorStop(0, "#dbe6d6");
  glow.addColorStop(1, "#f9f8f500");
  c.fillStyle = glow;
  c.fillRect(0, 0, w, h);
  const s = phone ? 1.15 : 1;
  txt(c, "Alif", 40 * s, 62 * s, 30 * s, C.forest, 700, HEAD);
  txt(c, "Bit", 40 * s + c.measureText("Alif").width, 62 * s, 30 * s, C.bronze, 700, HEAD);
  const top = phone ? 230 : 210;
  txt(c, "Sizga nima", 40 * s, top, (phone ? 62 : 74) * s, C.ink, 600, HEAD);
  txt(c, "kerak?", 40 * s, top + (phone ? 74 : 84) * s, (phone ? 62 : 74) * s, C.green, 600, HEAD);
  const opts = ["Veb-sayt", "Telegram bot", "AI yordamchi", "Integratsiyalar", "SEO"];
  const ow = phone ? w - 80 : 520;
  opts.forEach((o, i) => {
    const y = top + (phone ? 150 : 140) * s + i * (phone ? 92 : 74);
    rr(c, 40, y, ow, phone ? 72 : 58, 16, C.paper);
    c.strokeStyle = C.line;
    c.lineWidth = 2;
    c.stroke();
    txt(c, `0${i + 1}`, 64, y + (phone ? 45 : 37), phone ? 20 : 16, C.bronze, 600);
    txt(c, o, phone ? 112 : 104, y + (phone ? 45 : 37), phone ? 26 : 22, C.ink, 600, HEAD);
    txt(c, "→", 40 + ow - 44, y + (phone ? 45 : 37), phone ? 26 : 22, C.green, 600);
  });
  if (!phone) {
    rr(c, 680, 200, 520, 440, 28, C.paper);
    txt(c, "Xizmat 01", 720, 260, 20, C.bronze, 600);
    txt(c, "Veb-sayt", 720, 318, 46, C.ink, 600, HEAD);
    txt(c, "Ichiga nimalar kiradi", 720, 372, 18, C.muted, 600);
    for (let i = 0; i < 4; i++) {
      txt(c, "✓", 720, 412 + i * 34, 18, C.green, 700);
      rr(c, 750, 400 + i * 34, 330 - (i % 3) * 40, 12, 6, C.stone);
    }
    rr(c, 720, 568, 220, 52, 26, C.forest);
    txt(c, "Buyurtma berish", 748, 602, 20, "#fff", 600, HEAD);
  }
}

/** Suhbat pufakchalari: chapdagi — yordamchi, o'ngdagi — mijoz. */
function chat(c: Ctx, x0: number, cw: number, y0: number, fs: number, items: Array<[boolean, string[]]>, mineBg: string, theirBg: string) {
  let y = y0;
  for (const [mine, text] of items) {
    c.font = `400 ${fs}px ${BODY}`;
    const bw = Math.min(cw * 0.78, 44 + Math.max(...text.map((t) => c.measureText(t).width)));
    const bh = 26 + text.length * fs * 1.45;
    const bx = mine ? x0 + cw - bw - 24 : x0 + 24;
    rr(c, bx, y, bw, bh, 20, mine ? mineBg : theirBg);
    text.forEach((t, i) => txt(c, t, bx + 22, y + 12 + fs * 1.15 + i * fs * 1.45, fs, C.ink, 400));
    y += bh + 14;
  }
  return y;
}

function ai(c: Ctx, w: number, h: number, phone: boolean) {
  c.fillStyle = "#eef1ec";
  c.fillRect(0, 0, w, h);
  const x0 = phone ? 0 : 380;
  if (!phone) {
    c.fillStyle = C.forest;
    c.fillRect(0, 0, 380, h);
    txt(c, "Bilimlar bazasi", 32, 62, 24, "#fff", 700, HEAD);
    ["Narxlar", "Xizmatlar", "Savol-javob", "Yetkazib berish", "Ish vaqti"].forEach((t, i) => {
      rr(c, 24, 96 + i * 72, 332, 56, 14, "#ffffff14");
      rr(c, 44, 112 + i * 72, 24, 24, 6, i % 2 ? C.bronze : C.green2);
      txt(c, t, 84, 131 + i * 72, 19, "#e8eee9", 500);
      txt(c, "✓", 322, 131 + i * 72, 19, C.green2, 700);
    });
    txt(c, "Bugun: 46 ta savol, 9 ta ariza", 32, h - 48, 17, "#b3c0b0", 500);
  }
  const cw = w - x0;
  rr(c, x0, 0, cw, phone ? 124 : 88, 0, "#ffffff");
  rr(c, x0 + 28, phone ? 32 : 18, phone ? 64 : 52, phone ? 64 : 52, 32, C.forest);
  txt(c, "AI", x0 + (phone ? 44 : 40), phone ? 74 : 52, phone ? 24 : 20, "#fff", 700, HEAD);
  txt(c, "AI yordamchi", x0 + (phone ? 112 : 96), phone ? 66 : 44, phone ? 30 : 24, C.ink, 600, HEAD);
  rr(c, x0 + (phone ? 112 : 96), phone ? 84 : 58, 12, 12, 6, "#3fae6a");
  txt(c, "onlayn", x0 + (phone ? 132 : 114), phone ? 96 : 69, phone ? 21 : 16, C.muted, 400);
  const fs = phone ? 24 : 20;
  const y = chat(
    c,
    x0,
    cw,
    phone ? 160 : 120,
    fs,
    [
      [true, ["Vizitka sayt qancha turadi?"]],
      [false, ["2 400 000 so‘mdan, 2 haftada.", "5 sahifa, admin panel, 2 til."]],
      [true, ["Buyurtma bermoqchiman"]],
      [false, ["Ajoyib! Raqamingizni yozing —", "menejer bugun qo‘ng‘iroq qiladi."]],
      [true, ["+998 90 123 45 67"]],
      [false, ["Ariza qabul qilindi ✓"]],
    ],
    "#d6ecd3",
    "#ffffff",
  );
  if (y < h - 120) [0, 1, 2].forEach((i) => rr(c, x0 + 44 + i * 22, y + 18, 12, 12, 6, C.green2));
  rr(c, x0 + 16, h - (phone ? 96 : 72), cw - 32, phone ? 72 : 54, 26, "#ffffff");
  rr(c, x0 + 44, h - (phone ? 66 : 51), 240, 12, 6, C.line);
}

function integration(c: Ctx, w: number, h: number, phone: boolean) {
  c.fillStyle = "#f4f3ee";
  c.fillRect(0, 0, w, h);
  if (phone) {
    txt(c, "To‘lov", 40, 96, 44, C.ink, 700, HEAD);
    rr(c, 40, 130, w - 80, 150, 22, "#ffffff");
    txt(c, "Buyurtma №1024", 70, 184, 22, C.muted, 500);
    txt(c, "2 400 000 so‘m", 70, 246, 44, C.forest, 700, HEAD);
    ["Payme", "Click", "Uzum", "Uzcard / Humo"].forEach((m, i) => {
      const y = 310 + i * 96;
      rr(c, 40, y, w - 80, 80, 18, "#ffffff");
      if (i === 0) {
        c.strokeStyle = C.green;
        c.lineWidth = 3;
        c.beginPath();
        c.roundRect(40, y, w - 80, 80, 18);
        c.stroke();
      }
      rr(c, 66, y + 22, 36, 36, 18, i === 0 ? C.green : C.line);
      txt(c, m, 124, y + 50, 26, C.ink, 600);
    });
    rr(c, 40, 712, w - 80, 76, 38, C.forest);
    c.textAlign = "center";
    txt(c, "To‘lash", w / 2, 760, 28, "#fff", 600, HEAD);
    c.textAlign = "left";
    rr(c, 30, h - 250, w - 60, 120, 22, C.forest);
    txt(c, "✓ To‘lov qabul qilindi", 64, h - 196, 28, "#fff", 600, HEAD);
    txt(c, "CRM va SMS yuborildi", 64, h - 156, 21, "#b3c0b0", 500);
    return;
  }
  txt(c, "Buyurtma yo‘li", 48, 76, 34, C.ink, 700, HEAD);
  const steps = [["Sayt", "Buyurtma"], ["To‘lov", "Payme · Click"], ["CRM", "amoCRM"], ["SMS", "Mijozga"], ["Telegram", "Sizga xabar"]];
  const bw = 196;
  const gap = (w - 96 - steps.length * bw) / (steps.length - 1);
  steps.forEach(([t, s], i) => {
    const x = 48 + i * (bw + gap);
    rr(c, x, 120, bw, 130, 20, i === 1 ? C.forest : "#ffffff");
    txt(c, t, x + 22, 172, 26, i === 1 ? "#fff" : C.ink, 700, HEAD);
    txt(c, s, x + 22, 212, 17, i === 1 ? "#b3c0b0" : C.muted, 500);
    if (i < steps.length - 1) {
      rr(c, x + bw + 8, 182, gap - 16, 4, 2, C.green2);
      txt(c, "›", x + bw + gap - 18, 192, 26, C.green, 700);
    }
  });
  rr(c, 48, 290, w - 96, h - 340, 22, "#ffffff");
  txt(c, "So‘nggi to‘lovlar", 80, 344, 22, C.ink, 600, HEAD);
  const rows = [["№1024", "2 400 000 so‘m", "Payme"], ["№1023", "1 200 000 so‘m", "Click"], ["№1022", "860 000 so‘m", "Uzum"], ["№1021", "3 600 000 so‘m", "Payme"], ["№1020", "540 000 so‘m", "Click"]];
  rows.forEach(([n, sum, m], i) => {
    const y = 384 + i * 66;
    rr(c, 80, y, w - 160, 1, 0, C.line);
    txt(c, n, 80, y + 42, 19, C.muted, 500);
    txt(c, sum, 260, y + 42, 20, C.ink, 600);
    txt(c, m, 560, y + 42, 19, C.muted, 500);
    rr(c, w - 260, y + 18, 150, 36, 18, "#e6efe7");
    txt(c, "To‘landi ✓", w - 238, y + 43, 17, C.green, 600);
  });
}

function seo(c: Ctx, w: number, h: number, phone: boolean) {
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, w, h);
  const pad = phone ? 32 : 60;
  const colW = phone ? w - pad * 2 : w * 0.56;
  rr(c, pad, phone ? 56 : 40, colW, phone ? 72 : 60, 36, "#f1f3f1");
  txt(c, "sayt yaratish toshkent", pad + 34, phone ? 102 : 79, phone ? 25 : 22, C.ink, 400);
  txt(c, "⌕", pad + colW - 56, phone ? 104 : 80, phone ? 30 : 26, C.green, 600);
  let y = phone ? 180 : 140;
  for (let i = 0; i < (phone ? 5 : 5); i++) {
    const top = i === 0;
    const bh = phone ? 150 : 104;
    if (top) {
      rr(c, pad - 16, y - 14, colW + 32, bh + 4, 18, "#e9f3ea");
      c.strokeStyle = C.green;
      c.lineWidth = 3;
      c.beginPath();
      c.roundRect(pad - 16, y - 14, colW + 32, bh + 4, 18);
      c.stroke();
    }
    txt(c, top ? "sizning-saytingiz.uz" : `boshqa-sayt-${i}.uz`, pad, y + (phone ? 22 : 18), phone ? 19 : 16, top ? C.green : C.muted, 500);
    if (top) txt(c, "Saytingiz — 1-o‘rinda", pad, y + (phone ? 62 : 52), phone ? 30 : 25, "#1a4d8f", 600);
    else rr(c, pad, y + (phone ? 40 : 32), colW * (0.62 - (i % 3) * 0.08), phone ? 20 : 16, 8, "#c9d6e8");
    lines(c, pad, y + (phone ? 84 : 70), colW - 20, 2, phone ? 26 : 20, top ? "#cfe0d2" : C.stone, phone ? 11 : 9);
    y += bh + (phone ? 36 : 30);
  }
  if (!phone) {
    const x = w * 0.56 + 110;
    const cw = w - x - 50;
    rr(c, x, 40, cw, 360, 22, "#f4f3ee");
    txt(c, "Qidiruvdan tashriflar", x + 28, 92, 20, C.muted, 500);
    txt(c, "+240%", x + 28, 150, 48, C.forest, 700, HEAD);
    c.beginPath();
    const pts = [0.9, 0.84, 0.86, 0.7, 0.62, 0.48, 0.4, 0.22];
    pts.forEach((p, i) => {
      const px = x + 28 + (i * (cw - 56)) / (pts.length - 1);
      const py = 190 + p * 170;
      if (i) c.lineTo(px, py);
      else c.moveTo(px, py);
    });
    c.strokeStyle = C.green;
    c.lineWidth = 5;
    c.stroke();
    rr(c, x, 430, cw, 300, 22, "#f4f3ee");
    txt(c, "Hisobot", x + 28, 480, 22, C.ink, 600, HEAD);
    ["Texnik audit", "Sarlavha va tavsiflar", "Sitemap", "Google Biznes"].forEach((t, i) => {
      txt(c, "✓", x + 28, 530 + i * 46, 20, C.green, 700);
      txt(c, t, x + 60, 530 + i * 46, 19, C.ink, 500);
    });
  }
}

function support(c: Ctx, w: number, h: number, phone: boolean) {
  c.fillStyle = "#f4f3ee";
  c.fillRect(0, 0, w, h);
  const pad = phone ? 32 : 56;
  txt(c, "Holat", pad, phone ? 100 : 82, phone ? 44 : 36, C.ink, 700, HEAD);
  rr(c, phone ? pad : w - 380, phone ? 130 : 44, phone ? w - pad * 2 : 320, phone ? 70 : 56, 35, "#e1efe3");
  rr(c, (phone ? pad : w - 380) + 26, phone ? 157 : 64, 16, 16, 8, "#3fae6a");
  txt(c, "Hammasi ishlayapti", (phone ? pad : w - 380) + 56, phone ? 175 : 81, phone ? 25 : 21, C.forest, 600);
  const rows: Array<[string, string]> = [
    ["Sayt", "99,98% ishlagan"],
    ["Zaxira nusxa", "Bugun 03:00 ✓"],
    ["SSL sertifikat", "284 kun qoldi"],
    ["Xavfsizlik", "Yangilangan ✓"],
    ["Tezlik", "0,8 s"],
  ];
  const cols = phone ? 1 : 2;
  const cw = (w - pad * 2 - (cols - 1) * 24) / cols;
  rows.forEach(([t, v], i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * (cw + 24);
    const y = (phone ? 236 : 140) + row * (phone ? 132 : 150);
    rr(c, x, y, cw, phone ? 112 : 128, 20, "#ffffff");
    txt(c, t, x + 26, y + (phone ? 44 : 48), phone ? 22 : 20, C.muted, 500);
    txt(c, v, x + 26, y + (phone ? 88 : 96), phone ? 30 : 30, C.forest, 700, HEAD);
  });
  if (!phone) {
    const x = pad + cw + 24;
    const y = 140 + 2 * 150;
    rr(c, x, y, cw, 128, 20, "#ffffff");
    txt(c, "So‘nggi 30 kun", x + 26, y + 44, 20, C.muted, 500);
    for (let i = 0; i < 30; i++) rr(c, x + 26 + i * ((cw - 52) / 30), y + 66, (cw - 52) / 30 - 4, 36, 4, i === 17 ? C.bronze : "#7fb48a");
  }
}

function web(c: Ctx, w: number, h: number, phone: boolean) {
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, w, h);
  rr(c, 0, 0, w, phone ? 90 : 72, 0, "#ffffff");
  rr(c, 32, phone ? 30 : 24, 120, 26, 13, C.forest);
  if (!phone) [0, 1, 2, 3].forEach((i) => rr(c, w - 520 + i * 100, 32, 72, 10, 5, C.line));
  rr(c, w - (phone ? 80 : 168), phone ? 26 : 20, phone ? 48 : 136, phone ? 36 : 34, 17, C.green);
  const heroH = phone ? 520 : 380;
  const g = c.createLinearGradient(0, 0, w, heroH);
  g.addColorStop(0, "#2f5a43");
  g.addColorStop(1, "#1b3628");
  c.fillStyle = g;
  c.fillRect(0, phone ? 90 : 72, w, heroH);
  txt(c, "Biznesingiz", 40, phone ? 230 : 200, phone ? 56 : 64, "#fff", 700, HEAD);
  txt(c, "internetda.", 40, phone ? 298 : 272, phone ? 56 : 64, "#d9c39c", 700, HEAD);
  lines(c, 40, phone ? 340 : 312, phone ? w - 120 : 460, 2, 26, "#ffffff55", 12);
  rr(c, 40, phone ? 420 : 380, phone ? 220 : 190, phone ? 60 : 52, 30, C.bronze);
  if (!phone) {
    rr(c, 720, 120, 480, 290, 22, "#ffffff22");
    rr(c, 760, 160, 180, 180, 90, "#ffffff2e");
    rr(c, 980, 180, 180, 24, 12, "#ffffff40");
    rr(c, 980, 224, 140, 16, 8, "#ffffff30");
  }
  const cardsY = (phone ? 90 : 72) + heroH + 36;
  const n = phone ? 2 : 3;
  const cw = (w - 80 - (n - 1) * 24) / n;
  for (let i = 0; i < (phone ? 4 : 3); i++) {
    const col = i % n;
    const row = Math.floor(i / n);
    const x = 40 + col * (cw + 24);
    const y = cardsY + row * 250;
    rr(c, x, y, cw, phone ? 220 : 240, 20, "#f4f2ec");
    rr(c, x + 22, y + 24, 48, 48, 14, [C.green2, C.bronze, C.green][i % 3]);
    lines(c, x + 22, y + 100, cw - 44, 3, 28, C.line, 12);
  }
}

function design(c: Ctx, w: number, h: number, phone: boolean) {
  c.fillStyle = "#1f2321";
  c.fillRect(0, 0, w, h);
  if (!phone) {
    c.fillStyle = "#2a2f2c";
    c.fillRect(0, 0, 220, h);
    c.fillRect(w - 240, 0, 240, h);
    for (let i = 0; i < 12; i++) rr(c, 24, 70 + i * 42, 120 + (i % 4) * 14, 12, 6, i === 3 ? C.green2 : "#4a524d");
    txt(c, "Ranglar", w - 216, 72, 18, "#c9cfca", 600, BODY);
    [C.forest, C.green, C.bronze, C.ivory, C.ink, C.green2].forEach((col, i) => {
      rr(c, w - 216 + (i % 3) * 66, 96 + Math.floor(i / 3) * 66, 52, 52, 12, col);
    });
    for (let i = 0; i < 6; i++) rr(c, w - 216, 270 + i * 40, 180 - (i % 3) * 30, 12, 6, "#4a524d");
  }
  const ax = phone ? 40 : 280;
  const aw = phone ? w - 80 : w - 560;
  const frames = phone ? [[ax, 70, aw, 600]] : [[ax, 80, aw * 0.58, 600], [ax + aw * 0.64, 80, aw * 0.36, 600]];
  frames.forEach(([x, y, fw, fh], i) => {
    rr(c, x, y, fw, fh, 10, C.ivory);
    rr(c, x + 24, y + 28, fw * 0.4, 18, 9, C.forest);
    rr(c, x + 24, y + 80, fw - 48, fh * 0.34, 16, i ? C.bronze : C.green);
    lines(c, x + 24, y + 110 + fh * 0.34, fw - 48, 3, 26, C.line, 12);
    rr(c, x + 24, y + fh - 88, fw * 0.42, 50, 25, C.forest);
  });
  // Tanlangan element ramkasi
  const [fx, fy, fw] = frames[0];
  c.strokeStyle = "#5aa0ff";
  c.lineWidth = 3;
  c.strokeRect(fx + 20, fy + 76, fw - 40, 600 * 0.34 + 8);
  [[fx + 20, fy + 76], [fx + fw - 20, fy + 76]].forEach(([x, y]) => rr(c, x - 7, y - 7, 14, 14, 2, "#fff"));
  if (phone) {
    [C.forest, C.green, C.bronze, C.ivory].forEach((col, i) => rr(c, 40 + i * 116, 720, 96, 96, 20, col));
    for (let i = 0; i < 6; i++) rr(c, 40, 860 + i * 44, w - 120 - (i % 3) * 60, 14, 7, "#4a524d");
  }
}

function telegram(c: Ctx, w: number, h: number, phone: boolean) {
  c.fillStyle = "#e7ebe4";
  c.fillRect(0, 0, w, h);
  const x0 = phone ? 0 : 340;
  if (!phone) {
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, 340, h);
    for (let i = 0; i < 8; i++) {
      const y = 24 + i * 92;
      if (i === 0) rr(c, 10, y - 8, 320, 84, 14, "#e6efe7");
      rr(c, 24, y + 4, 56, 56, 28, [C.green, C.bronze, C.green2, "#9aa39d"][i % 4]);
      rr(c, 96, y + 12, 150 - (i % 3) * 20, 14, 7, C.ink);
      rr(c, 96, y + 40, 190 - (i % 4) * 22, 11, 6, C.line);
    }
  }
  const cw = w - x0;
  rr(c, x0, 0, cw, phone ? 120 : 84, 0, "#ffffff");
  rr(c, x0 + 28, phone ? 34 : 18, phone ? 64 : 48, phone ? 64 : 48, 32, C.forest);
  txt(c, "AlifBit bot", x0 + (phone ? 110 : 92), phone ? 66 : 42, phone ? 30 : 24, C.ink, 600, HEAD);
  txt(c, "bot", x0 + (phone ? 110 : 92), phone ? 98 : 68, phone ? 22 : 17, C.muted, 400);
  let y = phone ? 160 : 120;
  const fs = phone ? 25 : 20;
  const bubble = (text: string[], mine: boolean) => {
    const bw = Math.min(cw * 0.72, 40 + Math.max(...text.map((t) => t.length)) * fs * 0.52);
    const bh = 28 + text.length * fs * 1.45;
    const bx = mine ? x0 + cw - bw - 28 : x0 + 28;
    rr(c, bx, y, bw, bh, 20, mine ? "#d6ecd3" : "#ffffff");
    text.forEach((t, i) => txt(c, t, bx + 20, y + 14 + fs * 1.15 + i * fs * 1.45, fs, C.ink, 400));
    y += bh + 16;
  };
  bubble(["Assalomu alaykum!", "Menyudan tanlang:"], false);
  const bw = (Math.min(cw * 0.72, 560) - 12) / 2;
  ["Menyu", "Savat", "Buyurtma", "Aloqa"].forEach((b, i) => {
    const bx = x0 + 28 + (i % 2) * (bw + 12);
    const by = y + Math.floor(i / 2) * (phone ? 74 : 60);
    rr(c, bx, by, bw, phone ? 62 : 50, 14, "#ffffffcc");
    c.font = `600 ${fs}px ${BODY}`;
    c.fillStyle = C.green;
    c.textAlign = "center";
    c.fillText(b, bx + bw / 2, by + (phone ? 40 : 32));
    c.textAlign = "left";
  });
  y += (phone ? 74 : 60) * 2 + 16;
  bubble(["Buyurtma"], true);
  bubble(["Qabul qilindi: №1024", "Yetkazish — 40 daqiqa."], false);
  rr(c, x0 + 16, h - (phone ? 96 : 70), cw - 32, phone ? 72 : 52, 26, "#ffffff");
  rr(c, x0 + 44, h - (phone ? 66 : 50), 220, 12, 6, C.line);
}

function app(c: Ctx, w: number, h: number, phone: boolean) {
  c.fillStyle = "#f4f3ee";
  c.fillRect(0, 0, w, h);
  const x0 = phone ? 0 : 220;
  if (!phone) {
    c.fillStyle = C.forest;
    c.fillRect(0, 0, 220, h);
    txt(c, "CRM", 32, 56, 26, "#fff", 700, HEAD);
    for (let i = 0; i < 7; i++) {
      if (i === 1) rr(c, 16, 90 + i * 52, 188, 40, 10, "#ffffff22");
      rr(c, 32, 104 + i * 52, 110 + (i % 3) * 18, 12, 6, i === 1 ? "#ffffff" : "#ffffff66");
    }
  }
  const pad = phone ? 28 : 36;
  txt(c, "Bugun", x0 + pad, phone ? 80 : 70, phone ? 40 : 32, C.ink, 700, HEAD);
  const kpis = [["128", "Buyurtma"], ["42", "Yangi mijoz"], ["96%", "Bajarildi"]];
  const n = phone ? 2 : 3;
  const kw = (w - x0 - pad * 2 - (n - 1) * 18) / n;
  kpis.slice(0, phone ? 2 : 3).forEach(([v, l], i) => {
    const x = x0 + pad + i * (kw + 18);
    rr(c, x, phone ? 110 : 100, kw, phone ? 150 : 130, 18, "#ffffff");
    txt(c, v, x + 22, phone ? 186 : 170, phone ? 48 : 44, i === 2 ? C.bronze : C.forest, 700, HEAD);
    txt(c, l, x + 22, phone ? 228 : 210, phone ? 22 : 18, C.muted, 500);
  });
  const cy = phone ? 290 : 260;
  const chW = phone ? w - pad * 2 : (w - x0 - pad * 2) * 0.58;
  rr(c, x0 + pad, cy, chW, phone ? 300 : 300, 18, "#ffffff");
  c.beginPath();
  const pts = [0.62, 0.5, 0.56, 0.38, 0.44, 0.28, 0.33, 0.2];
  pts.forEach((p, i) => {
    const x = x0 + pad + 30 + (i * (chW - 60)) / (pts.length - 1);
    const y = cy + 40 + p * 220;
    if (i) c.lineTo(x, y);
    else c.moveTo(x, y);
  });
  c.strokeStyle = C.green;
  c.lineWidth = phone ? 6 : 5;
  c.stroke();
  const ty = phone ? cy + 330 : cy;
  const tx = phone ? x0 + pad : x0 + pad + chW + 18;
  const tw = phone ? w - pad * 2 : w - tx - pad;
  rr(c, tx, ty, tw, phone ? 460 : 300, 18, "#ffffff");
  for (let i = 0; i < (phone ? 7 : 5); i++) {
    const y = ty + 28 + i * (phone ? 62 : 54);
    rr(c, tx + 20, y, 36, 36, 18, [C.green2, C.bronze, C.green][i % 3]);
    rr(c, tx + 72, y + 6, tw * 0.4, 11, 6, C.ink);
    rr(c, tx + 72, y + 24, tw * 0.28, 9, 5, C.line);
    rr(c, tx + tw - 90, y + 8, 64, 22, 11, i % 2 ? "#e6efe7" : "#f3ead9");
  }
}

function course(c: Ctx, w: number, h: number, phone: boolean) {
  c.fillStyle = "#18201c";
  c.fillRect(0, 0, w, h);
  const codeW = phone ? w : w * 0.6;
  const palette = ["#8fae94", "#d9c39c", "#9fb8d9", "#c9cfca", "#e3a985"];
  const rows = phone ? 13 : 20;
  for (let i = 0; i < rows; i++) {
    const y = 60 + i * 34;
    txt(c, String(i + 1).padStart(2, " "), 20, y + 12, 16, "#4f5a54", 500, "monospace");
    let x = 64 + (i % 4 === 0 ? 0 : (i % 3) * 28);
    const parts = 2 + (i % 3);
    for (let p = 0; p < parts; p++) {
      const pw = 40 + ((i * 7 + p * 13) % 90);
      if (x + pw > codeW - 30) break;
      rr(c, x, y, pw, 14, 7, palette[(i + p) % palette.length]);
      x += pw + 14;
    }
  }
  const ax = phone ? 24 : codeW + 20;
  const ay = phone ? 540 : 40;
  const aw = phone ? w - 48 : w - codeW - 40;
  rr(c, ax, ay, aw, phone ? h - ay - 30 : h - 80, 22, "#22302a");
  txt(c, "AI yordamchi", ax + 24, ay + 46, phone ? 26 : 22, "#e8eee9", 600, HEAD);
  const msgs: Array<[number, string]> = [[0, "Telegram bot yasaymiz:"], [1, "Reja tayyor. 3 qadam."], [0, "Kodni tekshiraman."], [1, "Hammasi ishlayapti ✓"]];
  msgs.forEach(([ai, m], i) => {
    const y = ay + 80 + i * (phone ? 92 : 86);
    const bw = aw - 70;
    rr(c, ai ? ax + 20 : ax + 50, y, bw, phone ? 70 : 64, 16, ai ? "#2f4a3c" : "#355c46");
    txt(c, m, (ai ? ax + 20 : ax + 50) + 18, y + (phone ? 44 : 40), phone ? 22 : 18, "#e8eee9", 500);
  });
}

function sado(c: Ctx, w: number, h: number, phone: boolean) {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#123029");
  g.addColorStop(1, "#0a1d19");
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h * (phone ? 0.38 : 0.42);
  const r = phone ? 110 : 96;
  for (let k = 3; k >= 1; k--) {
    c.beginPath();
    c.arc(cx, cy, r + k * (phone ? 34 : 30), 0, Math.PI * 2);
    c.fillStyle = `rgba(52, 211, 182, ${0.07 * k})`;
    c.fill();
  }
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.fillStyle = "#2fd0b3";
  c.fill();
  rr(c, cx - 22, cy - 50, 44, 72, 22, "#0d2620");
  c.strokeStyle = "#0d2620";
  c.lineWidth = 8;
  c.beginPath();
  c.arc(cx, cy - 2, 40, 0.15 * Math.PI, 0.85 * Math.PI);
  c.stroke();
  const bars = phone ? 23 : 41;
  const bw = phone ? 12 : 10;
  const span = bars * (bw + (phone ? 8 : 9));
  for (let i = 0; i < bars; i++) {
    const a = Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37));
    const bh = 14 + a * (phone ? 120 : 110);
    rr(c, cx - span / 2 + i * (bw + (phone ? 8 : 9)), cy + r + (phone ? 150 : 110) - bh / 2, bw, bh, bw / 2, i % 5 ? "#34d3b6" : "#a7f0e1");
  }
  c.textAlign = "center";
  txt(c, "Gapiring — Sado yozadi", cx, h - (phone ? 210 : 110), phone ? 34 : 34, "#f1ede2", 600, HEAD);
  txt(c, "Alt tugmasini bosib turing", cx, h - (phone ? 160 : 70), phone ? 24 : 20, "#a9bdb0", 500);
  c.textAlign = "left";
}

const DRAW: Record<DrawnScreen, (c: Ctx, w: number, h: number, phone: boolean) => void> = {
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
export function drawScreen(key: DrawnScreen, device: Device): HTMLCanvasElement {
  const [w, h] = SCREEN_SIZE[device];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d");
  if (c) DRAW[key](c, w, h, device === "phone");
  return canvas;
}
