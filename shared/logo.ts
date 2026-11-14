// AlifBit belgisi: 200×200 maydon. Chap qavs ikki yelkadan iborat buklangan lenta,
// o'ng qavs uning ko'zgudagi aksi, markazda oltin Alif.
export const LOGO = {
  viewBox: "0 0 200 200",
  upperArm:
    "M63 61H85.5Q89.4 61 86.7 63.8L34.8 116H10.6Q6.2 116 9.2 112.8L59.6 62.4Q61 61 63 61Z",
  lowerArm:
    "M10.6 116H34.8L86.7 168.2Q89.4 171 85.5 171H63Q61 171 59.6 169.6L9.2 119.2Q6.2 116 10.6 116Z",
  foldLine: "M12 116H33",
  innerEdge: "M84 63.5L33.5 114.6M33.5 117.4L84 168.5",
  alif: "M117.5 6C112 25 85 26 78 50C87 43 93.5 40 93.5 52V139C93.5 160 89.5 174 81.5 189C100 176 113.5 160 114.5 138V24Q115.5 15 117.5 6Z",
  colors: {
    armTop: ["#6a8f6e", "#4c7155"],
    armBottom: ["#3e6248", "#264a36"],
    edge: "#b69a70",
    alif: ["#c7a265", "#ecd39d", "#a7834b"],
  },
} as const;

// Mustaqil SVG fayllar uchun (favicon, logo variantlari, ijtimoiy rasm).
export function markSvgBody(options: {
  armTop: string;
  armBottom: string;
  edge: string;
  alif: string;
  idPrefix?: string;
}) {
  const { armTop, armBottom, edge, alif } = options;
  const arms = `<path d="${LOGO.lowerArm}" fill="${armBottom}" stroke="${edge}" stroke-width="1.1" stroke-linejoin="round"/><path d="${LOGO.upperArm}" fill="${armTop}" stroke="${edge}" stroke-width="1.1" stroke-linejoin="round"/>`;
  return `<g>${arms}</g><g transform="matrix(-1 0 0 1 200 0)">${arms}</g><path d="${LOGO.alif}" fill="${alif}" stroke="${edge}" stroke-width=".8" stroke-linejoin="round"/>`;
}
