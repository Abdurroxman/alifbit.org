// Logo rasmlari public/brand da (scripts/prepare-assets.mjs yasaydi), qaysi rasm chiqishini CSS
// tanlaydi: yorug' rejimda rangli, to'q rejim va yashil fonda kumush.

/** Belgi uch qismdan: chap qavs, alif, o'ng qavs. Qismlar ustma-ust turadi va alohida jonlanadi. */
export function BrandMark({
  className = "",
  size = "s",
  silver = false,
}: {
  className?: string;
  size?: "s" | "l";
  silver?: boolean;
}) {
  const classes = ["brand-mark", size === "l" ? "is-l" : "", silver ? "is-silver" : "", className];
  return (
    <span className={classes.filter(Boolean).join(" ")} aria-hidden="true">
      <span className="logo-left" />
      <span className="logo-alif" />
      <span className="logo-right" />
    </span>
  );
}

export function Wordmark() {
  return <span className="wordmark" aria-hidden="true" />;
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
