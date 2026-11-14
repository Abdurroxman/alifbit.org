import { LOGO } from "../../shared/logo";

const KINDS = ["dalolat", "voice", "academy", "library", "films", "render"];

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

function Dalolat() {
  return (
    <>
      <rect width="400" height="300" fill="#e2e8dd" />
      <path className="pa-grid" d="M0 60H400M0 120H400M0 180H400M0 240H400M80 0V300M160 0V300M240 0V300M320 0V300" />
      <g className="pa-back">
        <text x="34" y="138" className="pa-display" fill="#244534" fontSize="40">
          DALOLAT
        </text>
        <text x="36" y="164" className="pa-small" fill="#5f6a62" fontSize="11">
          Raqamli imkoniyatlar.
        </text>
      </g>
      <g className="pa-front">
        <rect x="236" y="44" width="128" height="262" rx="22" fill="#244534" />
        <rect x="244" y="52" width="112" height="246" rx="16" fill="#2c5240" />
        <rect x="282" y="58" width="36" height="9" rx="4.5" fill="#1b3628" />
        <text x="256" y="92" className="pa-display" fill="#d8bf92" fontSize="14">
          D.
        </text>
        <text x="256" y="122" className="pa-small" fill="#b9c8b2" fontSize="8">
          Xush kelibsiz
        </text>
        <text x="256" y="142" className="pa-head" fill="#f2f0e8" fontSize="15">
          Siz uchun.
        </text>
        <text x="256" y="160" className="pa-head" fill="#f2f0e8" fontSize="15">
          Har kuni.
        </text>
        <rect x="254" y="176" width="92" height="36" rx="9" fill="#ffffff14" />
        <rect x="262" y="186" width="16" height="16" rx="4" fill="#b69a70" />
        <rect x="284" y="189" width="44" height="4" rx="2" fill="#e7e1d2" />
        <rect x="284" y="197" width="30" height="3" rx="1.5" fill="#ffffff55" />
        <rect x="254" y="220" width="43" height="40" rx="9" fill="#466b50" />
        <rect x="303" y="220" width="43" height="40" rx="9" fill="#b69a70" />
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

function Academy() {
  return (
    <>
      <rect width="400" height="300" fill="#dce4d8" />
      <circle className="pa-back pa-orbit" cx="290" cy="80" r="120" />
      <g className="pa-front">
        <g transform="rotate(-3 200 160)">
          <rect x="74" y="54" width="252" height="196" rx="16" fill="#fdfcfa" />
          <Mark x={90} y={68} size={22} />
          <text x="118" y="84" className="pa-small" fill="#262d29" fontSize="10" fontWeight="600">
            AlifBit Academy
          </text>
          <text x="92" y="116" className="pa-small" fill="#86683a" fontSize="7.5" letterSpacing="1.2">
            O‘RGANISH — BIRINCHI QADAM.
          </text>
          <text x="92" y="142" className="pa-head" fill="#262d29" fontSize="18">
            Bugungi bilim.
          </text>
          <text x="92" y="164" className="pa-head" fill="#262d29" fontSize="18">
            Ertangi imkoniyat.
          </text>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={92 + i * 56} y="180" width="50" height="4" rx="2" fill={i < 2 ? "#466b50" : "#e4e0d6"} />
          ))}
          <rect x="92" y="198" width="216" height="36" rx="9" fill="#f1efe9" />
          <rect x="102" y="207" width="18" height="18" rx="5" fill="#244534" />
          <rect x="128" y="210" width="96" height="5" rx="2.5" fill="#262d29" opacity=".7" />
          <rect x="128" y="219" width="64" height="4" rx="2" fill="#8a918b" opacity=".6" />
        </g>
      </g>
    </>
  );
}

function Library() {
  return (
    <>
      <rect width="400" height="300" fill="#e8dfcf" />
      <g className="pa-back">
        <g transform="rotate(9 270 160)">
          <rect x="196" y="62" width="142" height="196" rx="6" fill="#b69a70" />
          <text x="214" y="92" className="pa-small" fill="#5c4524" fontSize="8" letterSpacing="1.4">
            ALIFBIT
          </text>
          <text x="214" y="200" className="pa-head" fill="#4a3a20" fontSize="17">
            Fikr. Bilim.
          </text>
          <text x="214" y="220" className="pa-head" fill="#4a3a20" fontSize="17">
            Hayot.
          </text>
        </g>
      </g>
      <g className="pa-front">
        <g transform="rotate(-6 150 160)">
          <rect x="70" y="50" width="150" height="208" rx="6" fill="#244534" />
          <rect x="70" y="50" width="10" height="208" fill="#1b3628" />
          <text x="94" y="80" className="pa-small" fill="#b69a70" fontSize="7.5" letterSpacing="1.4">
            ALIFBIT LIBRARY
          </text>
          <text x="94" y="142" className="pa-head" fill="#f2f0e8" fontSize="24">
            Ilmga
          </text>
          <text x="94" y="170" className="pa-head" fill="#f2f0e8" fontSize="24">
            ochilgan
          </text>
          <text x="94" y="198" className="pa-serif" fill="#d8bf92" fontSize="25">
            eshik.
          </text>
        </g>
      </g>
    </>
  );
}

function Films() {
  return (
    <>
      <rect width="400" height="300" fill="#1f3c2d" />
      <radialGradient id="pa-film-light" cx=".5" cy=".2" r=".8">
        <stop stopColor="#f3dfb5" stopOpacity=".55" />
        <stop offset="1" stopColor="#f3dfb5" stopOpacity="0" />
      </radialGradient>
      <rect width="400" height="300" fill="url(#pa-film-light)" />
      <g className="pa-back">
        <path d="M232 300V130Q232 64 296 64Q360 64 360 130V300Z" fill="#2b5039" />
        <path d="M258 300V140Q258 98 296 98Q334 98 334 140V300Z" fill="#183324" />
      </g>
      <g className="pa-front">
        <path d="M150 300V160Q150 92 214 92Q278 92 278 160V300Z" fill="#e9dfc9" opacity=".95" />
        <path d="M176 300V170Q176 126 214 126Q252 126 252 170V300Z" fill="#c9b48a" />
        <circle cx="214" cy="212" r="22" fill="#244534" />
        <path d="M208 201L226 212L208 223Z" fill="#f2f0e8" />
      </g>
      <text x="32" y="64" className="pa-small" fill="#b69a70" fontSize="9" letterSpacing="1.4">
        ALIFBIT FILMS
      </text>
      <text x="32" y="96" className="pa-head" fill="#f2f0e8" fontSize="22">
        Tarixga
      </text>
      <text x="32" y="124" className="pa-serif" fill="#d8bf92" fontSize="24">
        yangi nigoh.
      </text>
    </>
  );
}

function Render({ wire }: { wire?: boolean }) {
  const face = (fill: string) => (wire ? "none" : fill);
  return (
    <g className={wire ? "pa-wire" : ""}>
      <rect width="400" height="300" fill={wire ? "#f4f1ea" : "#ebe5da"} />
      {!wire && (
        <>
          <radialGradient id="pa-sun" cx=".5" cy=".5" r=".5">
            <stop stopColor="#f6dcaa" />
            <stop offset="1" stopColor="#f6dcaa" stopOpacity="0" />
          </radialGradient>
          <circle cx="300" cy="78" r="80" fill="url(#pa-sun)" />
        </>
      )}
      <path d="M0 220L200 176L400 220V300H0Z" fill={face("#ddd5c6")} />
      <g className="pa-back">
        <path d="M250 214V96L276 86L302 96V214L276 224Z" fill={face("#e9e3d6")} />
        <path d="M276 86L302 96V214L276 224Z" fill={face("#cfc6b3")} />
      </g>
      <g className="pa-front">
        <path d="M96 210L150 186L204 210L150 234Z" fill={face("#7f9f84")} />
        <path d="M96 210V150L150 126V186Z" fill={face("#466b50")} />
        <path d="M150 126L204 150V210L150 186Z" fill={face("#2f5440")} />
        <path d="M96 150L150 126L204 150L150 174Z" fill={face("#6c8f72")} />
        <path d="M188 230L218 216L248 230L218 244Z" fill={face("#d1b688")} />
        <path d="M188 230V204L218 190V216Z" fill={face("#b69a70")} />
        <path d="M218 190L248 204V230L218 216Z" fill={face("#977b4f")} />
        <path d="M188 204L218 190L248 204L218 218Z" fill={face("#c9ad7e")} />
      </g>
    </g>
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

export default function ProjectArt({
  kind,
  large = false,
  wire = false,
}: {
  kind: string;
  large?: boolean;
  wire?: boolean;
}) {
  const k = KINDS.includes(kind) ? kind : "custom";
  return (
    <div className={`project-art art-${k} ${large ? "art-large" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {k === "dalolat" ? (
          <Dalolat />
        ) : k === "voice" ? (
          <Voice />
        ) : k === "academy" ? (
          <Academy />
        ) : k === "library" ? (
          <Library />
        ) : k === "films" ? (
          <Films />
        ) : k === "render" ? (
          <Render wire={wire} />
        ) : (
          <Custom />
        )}
      </svg>
    </div>
  );
}
