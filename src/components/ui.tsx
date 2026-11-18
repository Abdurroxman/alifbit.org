import { Children, Fragment, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function Arrow({ size = 18 }: { size?: number }) {
  return <ArrowUpRight size={size} strokeWidth={1.6} aria-hidden="true" />;
}

export function ButtonIcon() {
  return (
    <span className="button-icon" aria-hidden="true">
      <ArrowUpRight size={16} strokeWidth={1.8} />
    </span>
  );
}

type ButtonProps = {
  to: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "light" | "ghost";
  small?: boolean;
  magnetic?: boolean;
  className?: string;
  external?: boolean;
};

export function ButtonLink({
  to,
  children,
  variant = "primary",
  small = false,
  magnetic = false,
  className = "",
  external = false,
}: ButtonProps) {
  const cls = `button ${variant === "primary" ? "" : `button-${variant}`} ${small ? "button-small" : ""} ${className}`;
  const props = magnetic ? { "data-magnetic": "" } : {};
  if (external || to.startsWith("#") || to.startsWith("http"))
    return (
      <a
        className={cls}
        href={to}
        {...props}
        {...(to.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
        <ButtonIcon />
      </a>
    );
  return (
    <Link className={cls} to={to} {...props}>
      {children}
      <ButtonIcon />
    </Link>
  );
}

/** Narxlar yonida: ko'rsatilgan narx boshlang'ich, yakuniysi ishga qarab kelishiladi. */
export function PriceNote() {
  return <p className="price-note">Narx ishga qarab kelishiladi.</p>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <Arrow size={16} />
    </Link>
  );
}

export function Breadcrumb({ name }: { name: string }) {
  return (
    <nav className="breadcrumb" aria-label="Sahifa yo‘li">
      <Link to="/">Bosh sahifa</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{name}</span>
    </nav>
  );
}

type Tag = "h1" | "h2" | "h3";

/** Sarlavha: har bir bola alohida satr bo'lib, scroll'da pastdan ko'tariladi. */
export function Lines({
  as: As = "h2",
  children,
  className = "",
  delay = 0,
}: {
  as?: Tag;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <As
      className={className}
      data-reveal="lines"
      style={{ "--d": delay } as CSSProperties}
    >
      {Children.toArray(children).map((line, i) => (
        <span className="ln" key={i} style={{ "--i": i } as CSSProperties}>
          <span>{line}</span>
        </span>
      ))}
    </As>
  );
}

/**
 * Sarlavha harfma-harf ochiladi. Ekran o'quvchi butun matnni bir marta o'qiydi,
 * so'zlar satr oxirida bo'linmaydi. `accent` qismi yashil rangda chiqadi.
 */
export function Chars({
  as: As = "h1",
  text,
  accent,
  className = "",
  delay = 0,
}: {
  as?: Tag;
  text: string;
  accent?: string;
  className?: string;
  delay?: number;
}) {
  let c = 0;
  const words = (value: string, cls?: string) =>
    value
      .split(" ")
      .filter(Boolean)
      .map((word, i) => (
        <Fragment key={`${cls}-${i}`}>
          <span className={`w ${cls || ""}`}>
            {[...word].map((ch, j) => (
              <span className="ch" key={j} style={{ "--c": c++ } as CSSProperties}>
                {ch}
              </span>
            ))}
          </span>{" "}
        </Fragment>
      ));
  const label = accent ? `${text} ${accent}` : text;
  return (
    <As
      className={`chars ${className}`}
      data-reveal="chars"
      aria-label={label}
      style={{ "--d": delay } as CSSProperties}
    >
      <span aria-hidden="true">
        {words(text)}
        {accent && words(accent, "accent")}
      </span>
    </As>
  );
}

export function PageTop({
  eyebrow,
  title,
  text,
  name,
  children,
}: {
  eyebrow: string;
  title: ReactNode[];
  text?: string;
  name: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-top container">
      <Breadcrumb name={name} />
      <div className="page-top-grid">
        <div>
          <div data-reveal="fade">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <Lines as="h1">{title}</Lines>
        </div>
        {text && (
          <p className="page-top-text" data-reveal style={{ "--d": 250 } as CSSProperties}>
            {text}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export function ContactBand() {
  return (
    <section className="contact-band">
      <div className="container contact-band-inner">
        <div>
          <div data-reveal="fade">
            <Eyebrow>Buyurtma</Eyebrow>
          </div>
          <Lines>
            {[
              "Loyihangiz bormi?",
              <span className="accent" key="a">
                Puxta qilib beramiz.
              </span>,
            ]}
          </Lines>
        </div>
        <div className="contact-band-side" data-reveal style={{ "--d": 200 } as CSSProperties}>
          <ButtonLink to="/contact" magnetic>
            Buyurtma berish
          </ButtonLink>
          <p>Birinchi qadam — oddiy suhbat.</p>
        </div>
      </div>
    </section>
  );
}

export function delay(ms: number) {
  return { "--d": ms } as CSSProperties;
}
