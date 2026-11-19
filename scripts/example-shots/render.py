"""«Boshqa kompaniyalardan misollar» uchun ekran rasmlari.

Manba rasmlarda yozuv o'rnida kulrang chiziqlar bor. Skript ularni topadi, o'rnini atrofdagi fon rangi
bilan bo'yaydi va ustiga `texts/<rasm>.json` dagi haqiqiy yozuvni chizadi. Keyin rasmni saytdagi
ramka nisbatiga keltiradi (yuqori va pastki qatorni cho'zib, hech narsa kesilmaydi) va WebP qiladi.

Ishlatish (Python 3, Pillow, numpy):
  python scripts/example-shots/render.py debug  <manba papka> <chiqish papka> [rasm ...]
      chiziqlarni raqamlab ko'rsatadigan kichik PNG (matn yozish uchun)
  python scripts/example-shots/render.py render <manba papka> <chiqish papka> [--lang uz] [rasm ...]
      tayyor WebP: <chiqish>/<til>/<rasm>.webp

texts/<rasm>.json: {"uz": [...]} — ro'yxatdagi i-element i-chiziqqa yoziladi (debug rasmdagi raqam).
Element: matn, null (chiziq tegilmaydi), "" (chiziq fon bilan o'chiriladi) yoki
{"t": matn, "align": "left|center|right", "bold": true|false, "scale": 1.0, "color": "#rrggbb"}.
Chiziq bo'lmagan joyga yozuv: {"extra": {"uz": [{"x": .., "y": .., "t": .., "size": 24, "align": "center",
"color": "#ffffff", "bold": true}]}} — koordinatalar manba rasm pikselida, (x, y) yozuv markazi/cheti.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
TEXTS = HERE / "texts"
FONT_REGULAR = "C:/Windows/Fonts/segoeui.ttf"
FONT_SEMIBOLD = "C:/Windows/Fonts/seguisb.ttf"
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
# Saytdagi ramkalar ekranining nisbati (bo'y / en): DeviceMock.tsx dagi ekran teshigiga teng.
RATIO = {"K": 1600 / 2704, "T": 2560 / 1248}


def components(mask):
    """Niqobdagi bog'langan sohalar: qatorma-qator bo'laklar + union-find. Qaytaradi: [x0, y0, x1, y1, maydon]."""
    parent = []

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    prev, runs = [], []
    for y in range(mask.shape[0]):
        d = np.diff(np.concatenate(([0], mask[y].astype(np.int8), [0])))
        starts, ends = np.where(d == 1)[0], np.where(d == -1)[0]
        cur, j = [], 0
        for s, e in zip(starts, ends):
            rid = len(parent)
            parent.append(rid)
            while j < len(prev) and prev[j][1] <= s:
                j += 1
            k = j
            while k < len(prev) and prev[k][0] < e:
                ra, rb = find(rid), find(prev[k][2])
                if ra != rb:
                    parent[rb] = ra
                k += 1
            cur.append((s, e, rid))
            runs.append((y, s, e, rid))
        prev = cur
    comps = {}
    for y, s, e, rid in runs:
        c = comps.setdefault(find(rid), [10**9, 10**9, -1, -1, 0])
        c[0], c[1] = min(c[0], s), min(c[1], y)
        c[2], c[3] = max(c[2], e), max(c[3], y + 1)
        c[4] += e - s
    return list(comps.values())


def detect(a):
    """Yozuv o'rnidagi chiziqlar: bir xil rangli, yumaloq uchli, gorizontal to'rtburchaklar."""
    mx, mn = a.max(-1), a.min(-1)
    sat = mx - mn
    masks = (
        ("gray", (sat < 34) & (mx > 60) & (mx < 228)),
        ("light", (mx > 200) & (sat < 90) & ~((sat < 34) & (mx < 228))),
    )
    bars = []
    for kind, mask in masks:
        for x0, y0, x1, y1, area in components(mask):
            w, h = x1 - x0, y1 - y0
            if h < 7 or h > 70 or w < 2.2 * h or w < 30 or area / (w * h) < 0.80:
                continue
            if kind == "light":
                ring = a[max(0, y0 - 6):y0, x0:x1].reshape(-1, 3)
                if ring.size == 0 or (ring.max(-1) - ring.min(-1)).mean() < 60:
                    continue
            col = np.median(a[y0:y1, x0:x1].reshape(-1, 3), 0)
            bars.append({"kind": kind, "x": int(x0), "y": int(y0), "w": int(w), "h": int(h),
                         "lum": float(col.mean())})
    bars.sort(key=lambda b: (b["y"] // 6, b["x"]))
    return bars


def ring_color(a, b, pad=4):
    """Chiziq atrofidagi fon rangi: tepasidagi, ostidagi va yonlaridagi piksellar medianasi."""
    H, W = a.shape[:2]
    x0, y0, x1, y1 = b["x"], b["y"], b["x"] + b["w"], b["y"] + b["h"]
    parts = [
        a[max(0, y0 - pad - 2):max(0, y0 - 2), x0:x1],
        a[min(H, y1 + 2):min(H, y1 + pad + 2), x0:x1],
        a[y0:y1, max(0, x0 - pad - 2):max(0, x0 - 2)],
        a[y0:y1, min(W, x1 + 2):min(W, x1 + pad + 2)],
    ]
    px = np.concatenate([p.reshape(-1, 3) for p in parts if p.size])
    return tuple(int(v) for v in np.median(px, 0))


def luminance(c):
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def hex_color(s):
    s = s.lstrip("#")
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def erase(img, a, x0, y0, x1, y1, pad=3):
    """Chiziqni o'chiradi: har ustunda tepadagi va ostidagi fon rangi orasida silliq o'tish chiziladi,
    shuning uchun gradient fonda ham dog' qolmaydi. Chiziq uchlari (yumaloq chetlar) ham qamraladi."""
    H, W = a.shape[:2]
    xa, xb = max(0, x0 - pad), min(W, x1 + pad)
    ya, yb = max(0, y0 - pad), min(H, y1 + pad)
    top = a[max(0, ya - 1), xa:xb].astype(float)
    bottom = a[min(H - 1, yb), xa:xb].astype(float)
    t = np.linspace(0, 1, yb - ya)[:, None, None]
    patch = (top[None] * (1 - t) + bottom[None] * t).round().clip(0, 255).astype(np.uint8)
    img.paste(Image.fromarray(patch), (xa, ya))


def draw_text(img, a, b, spec):
    if spec is None:
        return
    if isinstance(spec, str):
        spec = {"t": spec}
    text = spec.get("t", "")
    bg = ring_color(a, b)
    erase(img, a, b["x"], b["y"], b["x"] + b["w"], b["y"] + b["h"])
    d = ImageDraw.Draw(img)
    if not text:
        return
    dark_bg = luminance(bg) < 150
    title = b["kind"] == "gray" and b["lum"] < 140
    button = b["kind"] == "light"
    bold = spec.get("bold", title or button)
    if "color" in spec:
        color = hex_color(spec["color"])
    elif dark_bg:
        color = (255, 255, 255) if (title or button) else (236, 241, 247)
    else:
        color = (24, 30, 42) if title else (92, 101, 116)
    if b["h"] >= 40:
        size = b["h"] * 0.86
    elif button:
        size = b["h"] * 1.2
    elif title:
        size = b["h"] * 1.0
    else:
        size = b["h"] * 0.95
    size = max(11, size * spec.get("scale", 1.0))
    path = FONT_BOLD if (bold and b["h"] >= 40) else FONT_SEMIBOLD if bold else FONT_REGULAR
    limit = b["w"] * (1.3 if button else 1.12 if spec.get("align", "left") == "left" else 1.05)
    font = ImageFont.truetype(path, round(size))
    while font.getlength(text) > limit and size > 9:
        size *= 0.94
        font = ImageFont.truetype(path, round(size))
    align = spec.get("align", "center" if button else "left")
    cy = b["y"] + b["h"] / 2
    if align == "center":
        x, anchor = b["x"] + b["w"] / 2, "mm"
    elif align == "right":
        x, anchor = b["x"] + b["w"], "rm"
    else:
        x, anchor = b["x"], "lm"
    d.text((x, cy), text, font=font, fill=color, anchor=anchor)


def draw_extra(img, a, items):
    """Chiziq bo'lmagan joyga qo'shimcha yozuv (masalan, logotip o'rnidagi rangli plashka ustiga).
    "erase": [x0, y0, x1, y1] — avval shu sohani atrofidagi fon rangi bilan bo'yaydi (topilmagan chiziq uchun)."""
    d = ImageDraw.Draw(img)
    for it in items or []:
        if "erase" in it:
            x0, y0, x1, y1 = it["erase"]
            erase(img, a, x0, y0, x1, y1)
        if not it.get("t"):
            continue
        path = FONT_BOLD if it.get("bold", True) else FONT_REGULAR
        font = ImageFont.truetype(path, it.get("size", 24))
        anchor = {"left": "lm", "center": "mm", "right": "rm"}[it.get("align", "center")]
        d.text((it["x"], it["y"]), it["t"], font=font, fill=hex_color(it.get("color", "#ffffff")), anchor=anchor)


def fit_ratio(img, kind):
    """Rasmni ramka nisbatiga keltiradi: yetmagan bo'yni yuqori va pastki qatorlarni cho'zib to'ldiradi."""
    w, h = img.size
    target = round(w * RATIO[kind])
    if target <= h:
        top = (h - target) // 2
        return img.crop((0, top, w, top + target))
    a = np.asarray(img)
    add = target - h
    top, bottom = add // 2, add - add // 2
    top_row = a[:3].mean(0, keepdims=True).astype(np.uint8)
    bottom_row = a[-3:].mean(0, keepdims=True).astype(np.uint8)
    out = np.concatenate([np.repeat(top_row, top, 0), a, np.repeat(bottom_row, bottom, 0)], 0)
    return Image.fromarray(out)


def load_texts(name, lang):
    """Qaytaradi: (chiziqlar matni, qo'shimcha yozuvlar). Qo'shimchalar: {"extra": {"uz": [...]}}."""
    f = TEXTS / f"{name}.json"
    if not f.exists():
        return None, None
    data = json.loads(f.read_text(encoding="utf-8"))
    return data.get(lang), (data.get("extra") or {}).get(lang)


def main():
    mode, src, out = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
    rest = sys.argv[4:]
    lang = "uz"
    if "--lang" in rest:
        i = rest.index("--lang")
        lang = rest[i + 1]
        rest = rest[:i] + rest[i + 2:]
    names = rest or sorted(p.stem for p in src.glob("*.png"))
    problems = []
    for name in names:
        img = Image.open(src / f"{name}.png").convert("RGB")
        a = np.asarray(img).astype(np.int16)
        bars = detect(a)
        if mode == "debug":
            out.mkdir(parents=True, exist_ok=True)
            dbg = img.copy()
            d = ImageDraw.Draw(dbg)
            f = ImageFont.truetype(FONT_BOLD, 26)
            for i, b in enumerate(bars):
                c = (230, 0, 0) if b["kind"] == "gray" else (0, 150, 0)
                d.rectangle([b["x"], b["y"], b["x"] + b["w"], b["y"] + b["h"]], outline=c, width=3)
                d.text((b["x"] - 4, b["y"] - 24), str(i), fill=c, font=f, stroke_width=3, stroke_fill="white")
            scale = 1000 / max(dbg.size)
            dbg.resize((round(dbg.width * scale), round(dbg.height * scale)), Image.LANCZOS).save(out / f"{name}.png")
            print(name, len(bars))
            continue
        texts, extra = load_texts(name, lang)
        if texts is None:
            problems.append(f"{name}: matn yo'q")
            continue
        if len(texts) != len(bars):
            problems.append(f"{name}: chiziqlar {len(bars)}, matnlar {len(texts)}")
            continue
        for b, spec in zip(bars, texts):
            draw_text(img, a, b, spec)
        draw_extra(img, a, extra)
        img = fit_ratio(img, name.rsplit("-", 1)[1])
        (out / lang).mkdir(parents=True, exist_ok=True)
        img.save(out / lang / f"{name}.webp", "WEBP", quality=90, method=6)
        print(name, img.size)
    if problems:
        print("MUAMMOLAR:\n  " + "\n  ".join(problems))
        sys.exit(1)


if __name__ == "__main__":
    main()
