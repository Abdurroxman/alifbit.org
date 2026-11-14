import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUp, Menu, X } from "lucide-react";
import Brand from "./Brand";
import Intro from "./Intro";
import { Arrow, ButtonLink } from "./ui";
import { useContent } from "../App";
import { copy, routeMeta } from "../../shared/content";
import { usePageEnhancements, prefersReducedMotion } from "../lib/motion";

const TELEGRAM = "https://t.me/id799";

function useRouteMeta(pathname: string) {
  const { projects, services } = useContent();
  useEffect(() => {
    const project = projects.find((p) => `/projects/${p.slug}` === pathname);
    const service = services.find((s) => `/services/${s.slug}` === pathname);
    const meta = project
      ? [
          project.seoTitle || `${project.name} — AlifBit`,
          project.seoDescription || project.summary,
        ]
      : service
        ? [`${service.name} — AlifBit`, service.description]
        : routeMeta[pathname];
    if (meta) {
      document.title = meta[0];
      for (const [selector, value] of [
        ['meta[property="og:title"]', meta[0]],
        ['meta[property="og:description"]', meta[1]],
        ['meta[name="description"]', meta[1]],
      ])
        document.querySelector(selector)?.setAttribute("content", value);
    }
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", `https://alifbit.org${pathname}`);
  }, [pathname, projects, services]);
}

function Header({ onMenu }: { onMenu: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container header-inner">
        <Link to="/" aria-label="AlifBit — bosh sahifa" className="header-brand">
          <Brand />
        </Link>
        <nav className="nav" aria-label="Asosiy menyu">
          {copy.uz.nav.map(([label, to]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <ButtonLink to="/contact" small className="header-cta">
          Keling, gaplashamiz
        </ButtonLink>
        <button className="menu-toggle" aria-label="Menyuni ochish" onClick={onMenu}>
          <Menu size={20} strokeWidth={1.6} />
        </button>
      </div>
    </header>
  );
}

function MobileMenu({ dialog }: { dialog: React.RefObject<HTMLDialogElement | null> }) {
  const close = () => dialog.current?.close();
  const items = [["Bosh sahifa", "/"], ...copy.uz.nav, ["Bog‘lanish", "/contact"]];
  return (
    <dialog ref={dialog} className="mobile-menu" aria-label="Menyu">
      <div className="mobile-menu-inner">
        <div className="mobile-menu-head">
          <Link to="/" onClick={close} aria-label="AlifBit — bosh sahifa">
            <Brand />
          </Link>
          <button className="menu-toggle" aria-label="Menyuni yopish" onClick={close}>
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>
        <nav aria-label="Mobil menyu">
          {items.map(([label, to], i) => (
            <Link key={to} to={to} onClick={close} style={{ "--i": i } as CSSProperties}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              {label}
              <Arrow />
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-foot">
          <p>{copy.uz.tagline}</p>
          <ButtonLink to={TELEGRAM} variant="outline">
            Telegram · @id799
          </ButtonLink>
        </div>
      </div>
    </dialog>
  );
}

function Footer() {
  return (
    <footer className="footer on-dark">
      <div className="container">
        <div className="footer-main">
          <div className="footer-about">
            <Link to="/" aria-label="AlifBit — bosh sahifa">
              <Brand light />
            </Link>
            <p>
              Ilmdan g‘oyaga.
              <br />
              G‘oyadan amalga.
            </p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <span>KASHF ETING</span>
              <Link to="/projects">Loyihalar</Link>
              <Link to="/services">Xizmatlar</Link>
              <Link to="/about">Biz haqimizda</Link>
              <Link to="/journal">Qaydlar</Link>
            </div>
            <div className="footer-col">
              <span>EKOTIZIM</span>
              <Link to="/sado">Sado · Windows uchun</Link>
              <Link to="/academy">Academy</Link>
              <Link to="/library">Library</Link>
              <Link to="/films">Films & Animation</Link>
              <Link to="/render">Render</Link>
            </div>
            <div className="footer-col">
              <span>SUHBATNI BOSHLAYLIK</span>
              <a href={TELEGRAM} target="_blank" rel="noreferrer">
                Telegram · @id799 <Arrow size={15} />
              </a>
              <Link to="/contact">
                Loyihangiz haqida yozing <Arrow size={15} />
              </Link>
              <small>O‘zbekiston · Dunyo uchun</small>
            </div>
          </div>
        </div>
        <div className="footer-word" aria-hidden="true">
          Alif<span>Bit</span>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} AlifBit. Barcha huquqlar himoyalangan.</span>
          <Link to="/privacy">Maxfiylik siyosati</Link>
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion() ? "auto" : "smooth",
              })
            }
          >
            Yuqoriga <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const dialog = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const first = useRef(true);
  useRouteMeta(pathname);
  usePageEnhancements("main", pathname);

  useEffect(() => {
    dialog.current?.close();
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    const heading = document.querySelector<HTMLElement>("main h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
    const el = main.current;
    if (el) {
      el.classList.remove("page-enter");
      void el.offsetWidth;
      el.classList.add("page-enter");
    }
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Asosiy mazmunga o‘tish
      </a>
      <Intro />
      <Header onMenu={() => dialog.current?.showModal()} />
      <MobileMenu dialog={dialog} />
      <main id="main" ref={main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
