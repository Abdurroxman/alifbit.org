import { LOGO } from "../../shared/logo";

const KINDS = ["dalolat", "voice"];

function Mark({ x, y, size, light = false }: { x: number; y: number; size: number; light?: boolean }) {
  const s = size / 200;
  const top = light ? "#dfe7d8" : "#557a5d";
  const bottom = light ? "#b9c8b2" : "#2f5440";
  const arms = (
    <>
      <path d={LOGO.lowerArm} fill={bottom} />
      <path d={LOGO.upperArm} fill={top} />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {arms}
      <g transform="matrix(-1 0 0 1 200 0)">{arms}</g>
      <path d={LOGO.alif} fill="#c9a66b" />
    </g>
  );
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

export default function ProjectArt({ kind, large = false }: { kind: string; large?: boolean }) {
  const k = KINDS.includes(kind) ? kind : "custom";
  return (
    <div className={`project-art art-${k} ${large ? "art-large" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {k === "dalolat" ? <Dalolat /> : k === "voice" ? <Voice /> : <Custom />}
      </svg>
    </div>
  );
}
