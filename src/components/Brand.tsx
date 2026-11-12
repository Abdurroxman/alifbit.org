import { useId } from "react";
export function BrandMark({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`brand-mark ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}g`}
          x1="55"
          y1="52"
          x2="95"
          y2="155"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6F8C62" />
          <stop offset=".52" stopColor="#466B50" />
          <stop offset="1" stopColor="#244534" />
        </linearGradient>
        <linearGradient
          id={`${id}b`}
          x1="80"
          y1="90"
          x2="119"
          y2="114"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B18B50" />
          <stop offset=".42" stopColor="#E2C287" />
          <stop offset="1" stopColor="#BA945C" />
        </linearGradient>
      </defs>
      <g className="logo-left">
        <path
          d="M73 54H55Q50 54 46 58L14 90Q4 100 14 112L46 146Q50 150 56 150H74L29 105Q25 101 30 97Z"
          fill={`url(#${id}g)`}
          stroke="#B69A70"
          strokeWidth="1.2"
        />
        <path
          d="M73 54L17 103M29 105L74 150"
          stroke="#C8B17C"
          strokeWidth=".7"
          opacity=".8"
        />
      </g>
      <g className="logo-right">
        <path
          d="M127 54H145Q150 54 154 58L186 90Q196 100 186 112L154 146Q150 150 144 150H126L171 105Q175 101 170 97Z"
          fill={`url(#${id}g)`}
          stroke="#B69A70"
          strokeWidth="1.2"
        />
        <path
          d="M127 54L183 103M171 105L126 150"
          stroke="#C8B17C"
          strokeWidth=".7"
          opacity=".8"
        />
      </g>
      <path
        className="logo-alif"
        d="M119 5C114 24 84 24 77 49C86 42 94 37 94 49V140C94 161 90 175 82 188C101 175 115 159 116 137Z"
        fill={`url(#${id}b)`}
        stroke="#AF8950"
        strokeWidth="1"
      />
    </svg>
  );
}
export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? "brand-light" : ""}`}>
      <BrandMark />
      <span className="wordmark">
        Alif<span>Bit</span>
      </span>
    </span>
  );
}
