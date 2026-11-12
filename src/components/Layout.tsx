import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, ArrowUp, Menu, X } from "lucide-react";
import Brand, { BrandMark } from "./Brand";
import { useContent } from "../App";
import { copy, routeMeta } from "../../shared/content";
export function Arrow({ diagonal = true }: { diagonal?: boolean }) {
  return (
    <ArrowUpRight
      size={19}
      strokeWidth={1.5}
      className={diagonal ? "" : "arrow-right"}
    />
  );
}
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}
export function Breadcrumb({ name }: { name: string }) {
  return (
    <nav className="breadcrumb" aria-label="Sahifa yo‘li">
      <Link to="/">Bosh sahifa</Link>
      <span>/</span>
      <span aria-current="page">{name}</span>
    </nav>
  );
}
export function TextLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <Arrow />
    </Link>
  );
}
export function PageTop({
  eyebrow,
  title,
  text,
  name,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text?: string;
  name: string;
}) {
  return (
    <section className="page-top container">
      <Breadcrumb name={name} />
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </section>
  );
}
export function ContactBand() {
  return (
    <section className="contact-band">
      <div className="container contact-band-inner">
        <div>
          <Eyebrow>BIRGA YARATAMIZ</Eyebrow>
          <h2>
            Yaxshi g‘oyangiz bormi?
            <br />
            <span>Unga shakl beraylik.</span>
          </h2>
        </div>
        <Link
          className="circle-cta"
          to="/contact"
          aria-label="Loyihangizni boshlang"
        >
          <ArrowUpRight size={40} strokeWidth={1} />
        </Link>
        <div className="contact-band-note">
          Birinchi qadam —<br />
          oddiy suhbat.
        </div>
      </div>
    </section>
  );
}
export default function Layout() {
  const [scrolled, setScrolled] = useState(false),
    [intro, setIntro] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const location = useLocation();
  const { projects, services } = useContent();
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 36);
    window.addEventListener("scroll", update, { passive: true });
    update();
    let timeout: ReturnType<typeof setTimeout>;
    try {
      if (
        !localStorage.getItem("alifbit-visited") &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setIntro(true);
        localStorage.setItem("alifbit-visited", "1");
        timeout = setTimeout(() => setIntro(false), 1750);
      }
    } catch {}
    return () => {
      window.removeEventListener("scroll", update);
      clearTimeout(timeout);
    };
  }, []);
  useEffect(() => {
    dialog.current?.close();
    window.scrollTo({ top: 0, behavior: "instant" });
    const heading = document.querySelector<HTMLElement>("main h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      document.querySelector("main")?.animate(
        [
          { opacity: 0.65, transform: "translateY(4px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 220, easing: "ease-out" },
      );
  }, [location.pathname]);
  useEffect(() => {
    const project = projects.find(
        (p) => `/projects/${p.slug}` === location.pathname,
      ),
      service = services.find(
        (s) => `/services/${s.slug}` === location.pathname,
      );
    const meta = project
      ? [
          project.seoTitle || `${project.name} — AlifBit`,
          project.seoDescription || project.summary,
        ]
      : service
        ? [`${service.name} — AlifBit`, service.description]
        : routeMeta[location.pathname];
    if (meta) {
      document.title = meta[0];
      document
        .querySelector('meta[property="og:title"]')
        ?.setAttribute("content", meta[0]);
      document
        .querySelector('meta[property="og:description"]')
        ?.setAttribute("content", meta[1]);
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", meta[1]);
    }
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", `https://alifbit.org${location.pathname}`);
  }, [location.pathname, projects, services]);
  return (
    <>
      <a className="skip-link" href="#main">
        Asosiy mazmunga o‘tish
      </a>
      {intro && (
        <div className="intro" aria-hidden="true">
          <BrandMark />
          <span>AlifBit</span>
        </div>
      )}
      <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container header-inner">
          <Link to="/" aria-label="AlifBit bosh sahifa">
            <Brand />
          </Link>
          <nav className="desktop-nav" aria-label="Asosiy menyu">
            {copy.uz.nav.map(([label, to]) => (
              <NavLink key={to} to={to}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Link className="button button-small header-cta" to="/contact">
            Keling, gaplashamiz
            <Arrow />
          </Link>
          <button
            className="menu-toggle icon-button"
            aria-label="Menyuni ochish"
            onClick={() => dialog.current?.showModal()}
          >
            <Menu size={25} />
          </button>
        </div>
      </header>
      <dialog ref={dialog} className="mobile-menu">
        <div className="mobile-menu-head">
          <Link to="/" onClick={() => dialog.current?.close()}>
            <Brand />
          </Link>
          <button
            className="icon-button"
            aria-label="Menyuni yopish"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        <nav aria-label="Mobil menyu">
          {[
            ["Bosh sahifa", "/"],
            ...copy.uz.nav,
            ["Bog‘lanish", "/contact"],
          ].map(([label, to], i) => (
            <Link onClick={() => dialog.current?.close()} key={to} to={to}>
              <small>0{i + 1}</small>
              {label}
              <Arrow />
            </Link>
          ))}
        </nav>
        <a
          className="mobile-contact"
          href="https://t.me/id799"
          target="_blank"
          rel="noreferrer"
        >
          Telegram · @id799 <Arrow />
        </a>
      </dialog>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div>
              <Link to="/" aria-label="AlifBit bosh sahifa">
                <Brand />
              </Link>
              <p>
                Ilmdan g‘oyaga.
                <br />
                G‘oyadan amalga.
              </p>
            </div>
            <div className="footer-col">
              <span>KASHF ETING</span>
              <Link to="/projects">Loyihalar</Link>
              <Link to="/services">Xizmatlar</Link>
              <Link to="/about">Biz haqimizda</Link>
              <Link to="/journal">Qaydlar</Link>
            </div>
            <div className="footer-col">
              <span>EKOTIZIM</span>
              <Link to="/academy">Academy</Link>
              <Link to="/library">Library</Link>
              <Link to="/films">Films & Animation</Link>
              <Link to="/render">Render</Link>
            </div>
            <div className="footer-col footer-contact">
              <span>SUHBATNI BOSHLAYLIK</span>
              <a href="https://t.me/id799" target="_blank" rel="noreferrer">
                Telegram · @id799
                <Arrow />
              </a>
              <Link to="/contact">
                Loyihangiz haqida yozing
                <Arrow />
              </Link>
              <small>O‘zbekiston · Dunyo uchun</small>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} AlifBit. Barcha huquqlar
              himoyalangan.
            </span>
            <Link to="/privacy">Maxfiylik siyosati</Link>
            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? "instant"
                    : "smooth",
                })
              }
            >
              Yuqoriga
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
