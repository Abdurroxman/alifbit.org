import { Children, type CSSProperties, type ReactNode } from "react";
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
            <Eyebrow>Birga yaratamiz</Eyebrow>
          </div>
          <Lines>
            {[
              "Yaxshi g‘oyangiz bormi?",
              <span className="accent" key="a">
                Unga shakl beraylik.
              </span>,
            ]}
          </Lines>
        </div>
        <div className="contact-band-side" data-reveal style={{ "--d": 200 } as CSSProperties}>
          <Link className="circle-cta" to="/contact" data-magnetic="">
            <span>
              <ArrowUpRight size={30} strokeWidth={1.3} aria-hidden="true" />
              Loyihangizni boshlang
            </span>
          </Link>
          <p>Birinchi qadam — oddiy suhbat.</p>
        </div>
      </div>
    </section>
  );
}

export function delay(ms: number) {
  return { "--d": ms } as CSSProperties;
}
