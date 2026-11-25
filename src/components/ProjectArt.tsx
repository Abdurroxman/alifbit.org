import type { DemoScript } from "../../shared/content";

const KINDS = ["dalolat", "voice"];

/** AlifBit belgisi `size`×`size` kvadrat ichida, nisbati saqlangan holda. */
function Mark({ x, y, size }: { x: number; y: number; size: number }) {
  return <image href="/brand/mark.webp" x={x} y={y} width={size} height={size} preserveAspectRatio="xMidYMid meet" />;
}

/** DALOLAT muqovasi: ilova ranglari (bej, bordo, oltin), oltin ravoq va telefon ichida ilovaning haqiqiy ekrani. */
function Dalolat() {
  return (
    <>
      <defs>
        <radialGradient id="pa-dl-bg" cx="0.72" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#fbefd2" />
          <stop offset="1" stopColor="#f1e5d2" />
        </radialGradient>
        <linearGradient id="pa-dl-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8c6a2e" />
          <stop offset="0.5" stopColor="#c9a55a" />
          <stop offset="1" stopColor="#a47b43" />
        </linearGradient>
        <clipPath id="pa-dl-screen">
          <rect x="245" y="41" width="114" height="248" rx="17" />
        </clipPath>
      </defs>
      <rect width="400" height="300" fill="url(#pa-dl-bg)" />
      <g fill="none" stroke="#a47b43" strokeOpacity="0.16">
        {[40, 112, 184].map((x) =>
          [36, 108, 180, 252].map((y) => (
            <g key={`${x}-${y}`}>
              <rect x={x - 12} y={y - 12} width="24" height="24" />
              <rect x={x - 12} y={y - 12} width="24" height="24" transform={`rotate(45 ${x} ${y})`} />
            </g>
          )),
        )}
      </g>
      <g className="pa-back">
        <path d="M222 300V128c0-46 36-74 80-106 44 32 80 60 80 106v172" fill="#fffaf1" stroke="#c9a55a" strokeWidth="1.4" />
        <image href="/images/dalolat/wordmark.webp" x="32" y="104" width="150" height="25" />
        <text x="33" y="160" className="pa-serif" fill="#302525" fontSize="17" style={{ fontStyle: "normal" }}>
          Munosib juft —
        </text>
        <text x="33" y="182" className="pa-serif" fill="url(#pa-dl-gold)" fontSize="17" style={{ fontStyle: "normal" }}>
          mustahkam oila
        </text>
        <rect x="33" y="198" width="96" height="20" rx="10" fill="#742d3d" />
        <text x="81" y="211.5" className="pa-small" fill="#fffcf7" fontSize="8.5" textAnchor="middle" fontWeight="600">
          Telegram Mini App
        </text>
      </g>
      <g className="pa-front">
        <rect x="237" y="33" width="130" height="264" rx="24" fill="#151012" stroke="#c5b097" strokeWidth="1.5" />
        <image href="/images/dalolat/feed.webp" x="245" y="41" width="114" height="248" preserveAspectRatio="xMidYMin slice" clipPath="url(#pa-dl-screen)" />
        <rect x="285" y="45" width="34" height="9" rx="4.5" fill="#050505" />
      </g>
    </>
  );
}

function Voice() {
  const bars = Array.from({ length: 34 }, (_, i) => 6 + Math.abs(Math.sin(i * 1.7)) * 30 + Math.abs(Math.sin(i * 0.4)) * 14);
  return (
    <>
      <defs>
        <radialGradient id="pa-sado-bg" cx="0.7" cy="0.35" r="0.9">
          <stop offset="0" stopColor="#1d4a43" />
          <stop offset="1" stopColor="#0b1c19" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#pa-sado-bg)" />
      <ellipse className="pa-back pa-orbit" cx="200" cy="150" rx="178" ry="118" style={{ stroke: "#2ccfb840" }} />
      <g className="pa-front">
        <rect x="64" y="66" width="272" height="168" rx="16" fill="#132b27" stroke="#2ccfb8" strokeOpacity="0.28" />
        <circle cx="88" cy="90" r="8" fill="none" stroke="#2ccfb8" strokeWidth="2" />
        <circle cx="88" cy="90" r="3.5" fill="#3de0c8" />
        <text x="102" y="94" className="pa-small" fill="#e9f3f0" fontSize="11" fontWeight="700">
          Sado
        </text>
        {bars.map((h, i) => (
          <rect key={i} className="pa-wave" x={84 + i * 7.1} y={136 - h / 2} width="3.4" height={h} rx="1.7" fill={i % 9 === 4 ? "#8ff0e2" : "#2ccfb8"} />
        ))}
        <text x="84" y="190" className="pa-head" fill="#e9f3f0" fontSize="13">
          Gapiring. Sado yozadi.
        </text>
        <rect x="84" y="202" width="150" height="5" rx="2.5" fill="#21413b" />
        <rect x="84" y="213" width="112" height="5" rx="2.5" fill="#21413b" />
      </g>
    </>
  );
}

function Custom() {
  return (
    <>
      <rect width="400" height="300" fill="#ebe8e0" />
      <circle cx="200" cy="150" r="96" className="pa-orbit" />
      <g className="pa-front">
        <Mark x={150} y={92} size={100} />
      </g>
    </>
  );
}

/** Matnni SVG uchun satrlarga bo'ladi: kenglik belgilar soni bilan taxminlanadi. */
function wrap(text: string, max: number, limit: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.replace(/\s+/g, " ").split(" ")) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  if (lines.length > limit) {
    lines.length = limit;
    lines[limit - 1] = lines[limit - 1].replace(/\s*\S*$/, "") + "…";
  }
  return lines;
}

const DEMO_THEMES = [
  { bg: "#e7ece4", accent: "#244534", soft: "#466b50" },
  { bg: "#efe9de", accent: "#5b4423", soft: "#a8844c" },
  { bg: "#e3e9ea", accent: "#21434a", soft: "#3f6f78" },
];

/**
 * Yechim muqovasi demo suhbatidan chiziladi: chapda yechim nomi va egasiga kelgan xabar,
 * o'ngda telefon ichida birinchi xabarlar va tugmalar. Har yechim o'z matni bilan farqlanadi.
 */
function DemoCover({ demo, title }: { demo: DemoScript; title: string }) {
  const first = demo.nodes.find((n) => n.id === demo.start) || demo.nodes[0];
  const owner = demo.nodes.find((n) => n.owner)?.owner;
  const theme = DEMO_THEMES[[...title].reduce((a, c) => a + c.charCodeAt(0), 0) % DEMO_THEMES.length];
  const bubble = wrap(first.messages[0], 24, 4);
  const buttons = first.buttons.slice(0, 2);
  const bubbleH = 14 + bubble.length * 11;
  return (
    <>
      <rect width="400" height="300" fill={theme.bg} />
      <circle cx="300" cy="150" r="128" className="pa-orbit" />
      <g className="pa-back">
        <text x="30" y="70" className="pa-head" fill={theme.accent} fontSize="22">
          {title}
        </text>
        <text x="30" y="90" className="pa-small" fill={theme.soft} fontSize="10">
          Demo
        </text>
        {owner && (
          <g transform="translate(30 182)">
            <rect width="168" height={34 + Math.min(owner.lines.length, 2) * 13} rx="10" fill="#fdfcfa" />
            <rect width="3" height={34 + Math.min(owner.lines.length, 2) * 13} rx="1.5" fill={theme.soft} />
            <text x="14" y="21" fontSize="10.5" fontWeight="700" fill="#262d29">
              {wrap(owner.title, 26, 1)[0]}
            </text>
            {owner.lines.slice(0, 2).map((l, i) => (
              <text key={i} x="14" y={37 + i * 13} fontSize="9" fill="#646e67">
                {wrap(l, 30, 1)[0]}
              </text>
            ))}
          </g>
        )}
      </g>
      <g className="pa-front">
        <rect x="232" y="26" width="138" height="262" rx="22" fill="#151a17" />
        <rect x="239" y="33" width="124" height="248" rx="17" fill="#e8ece4" />
        <rect x="239" y="33" width="124" height="34" rx="17" fill={theme.accent} />
        <rect x="239" y="50" width="124" height="17" fill={theme.accent} />
        <circle cx="256" cy="50" r="8" fill="#b69a70" />
        <text x="270" y="54" fontSize="9.5" fontWeight="700" fill="#eef1e8">
          {wrap(demo.bot, 14, 1)[0]}
        </text>
        <rect x="246" y="78" width="104" height={bubbleH} rx="9" fill="#fdfcfa" />
        {bubble.map((l, i) => (
          <text key={i} x="253" y={92 + i * 11} fontSize="8.4" fill="#262d29">
            {l}
          </text>
        ))}
        {buttons.map((b, i) => (
          <g key={b.label} transform={`translate(246 ${86 + bubbleH + i * 24})`}>
            <rect width="110" height="19" rx="7" fill="#fdfcfa" stroke="#cfccc1" />
            <text x="55" y="12.8" fontSize="8" textAnchor="middle" fill={theme.accent} fontWeight="600">
              {wrap(b.label, 22, 1)[0]}
            </text>
          </g>
        ))}
      </g>
    </>
  );
}

export default function ProjectArt({
  kind,
  large = false,
  demo,
  title,
}: {
  kind: string;
  large?: boolean;
  demo?: DemoScript;
  title?: string;
}) {
  const k = kind === "demo" && demo ? "demo" : KINDS.includes(kind) ? kind : "custom";
  return (
    <div className={`project-art art-${k} ${large ? "art-large" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {k === "demo" && demo ? (
          <DemoCover demo={demo} title={title || demo.bot} />
        ) : k === "dalolat" ? (
          <Dalolat />
        ) : k === "voice" ? (
          <Voice />
        ) : (
          <Custom />
        )}
      </svg>
    </div>
  );
}
