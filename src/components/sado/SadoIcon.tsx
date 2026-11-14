import { useId } from "react";

/** Sado ilova belgisi: to'q kvadrat, firuza markaz va ikki halqa. */
export default function SadoIcon({ className = "", tile = true }: { className?: string; tile?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`sado-icon ${className}`} viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1D2328" />
          <stop offset="1" stopColor="#0E1114" />
        </linearGradient>
        <linearGradient id={`${id}ac`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3DE0C8" />
          <stop offset="1" stopColor="#13A894" />
        </linearGradient>
      </defs>
      {tile && <rect x="32" y="32" width="960" height="960" rx="224" fill={`url(#${id}bg)`} />}
      <circle className="si-ring si-ring-2" cx="512" cy="512" r="318" fill="none" stroke="#2CCFB8" strokeOpacity=".35" strokeWidth="40" />
      <circle className="si-ring si-ring-1" cx="512" cy="512" r="212" fill="none" stroke="#2CCFB8" strokeOpacity=".75" strokeWidth="44" />
      <circle className="si-core" cx="512" cy="512" r="112" fill={`url(#${id}ac)`} />
    </svg>
  );
}
