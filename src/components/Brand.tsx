import { useId } from "react";
import { LOGO } from "../../shared/logo";

function Arms({ id }: { id: string }) {
  return (
    <>
      <path
        className="logo-arm-bottom"
        d={LOGO.lowerArm}
        fill={`url(#${id}b)`}
        stroke={LOGO.colors.edge}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        className="logo-arm-top"
        d={LOGO.upperArm}
        fill={`url(#${id}t)`}
        stroke={LOGO.colors.edge}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d={LOGO.innerEdge}
        stroke="#e2cc9c"
        strokeWidth=".6"
        opacity=".55"
        fill="none"
      />
    </>
  );
}

export function BrandMark({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const c = LOGO.colors;
  return (
    <svg
      className={`brand-mark ${className}`}
      viewBox={LOGO.viewBox}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}t`} x1="80" y1="60" x2="10" y2="118" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.armTop[0]} />
          <stop offset="1" stopColor={c.armTop[1]} />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="10" y1="116" x2="80" y2="172" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.armBottom[0]} />
          <stop offset="1" stopColor={c.armBottom[1]} />
        </linearGradient>
        <linearGradient id={`${id}a`} x1="80" y1="40" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.alif[0]} />
          <stop offset=".45" stopColor={c.alif[1]} />
          <stop offset="1" stopColor={c.alif[2]} />
        </linearGradient>
      </defs>
      <g className="logo-left">
        <Arms id={id} />
      </g>
      <g className="logo-right">
        <g transform="matrix(-1 0 0 1 200 0)">
          <Arms id={id} />
        </g>
      </g>
      <path
        className="logo-alif"
        d={LOGO.alif}
        fill={`url(#${id}a)`}
        stroke="#a7834b"
        strokeWidth=".8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark" aria-hidden="true">
      Alif<span>Bit</span>
    </span>
  );
}

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? "brand-light" : ""}`}>
      <BrandMark />
      <Wordmark />
      <span className="visually-hidden">AlifBit</span>
    </span>
  );
}
