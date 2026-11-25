import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUp, Menu, Moon, Sun, X } from "lucide-react";
import Brand from "./Brand";
import Intro from "./Intro";
import { Arrow, ButtonLink } from "./ui";
import { useContent } from "../App";
import { copy, OFFICE_URL, PAY_URL, routeMeta, TELEGRAM_URL } from "../../shared/content";
import { usePageEnhancements, prefersReducedMotion } from "../lib/motion";
import { applyStoredTheme, setTheme, useTheme } from "../lib/theme";
import NetworkBackground from "./NetworkBackground";

/** «Kurslar» bandi faqat nashr qilingan kurs bo'lsa ko'rinadi. */
function useNav() {
  const { courses } = useContent();
  return copy.uz.nav.filter(([, to]) => to !== "/courses" || courses.length > 0);
}

function useRouteMeta(pathname: string) {
  const { projects, services, courses } = useContent();
  useEffect(() => {
    const project = projects.find((p) => `/projects/${p.slug}` === pathname);
    const service = services.find((s) => `/services/${s.slug}` === pathname);
    const course = courses.find((c) => `/courses/${c.slug}` === pathname);
    const meta = project
      ? [
          project.seoTitle || `${project.name} — AlifBit`,
          project.seoDescription || project.summary,
        ]
      : service
        ? [`${service.name} — AlifBit`, service.description]
        : course
          ? [course.seoTitle || `${course.title} — AlifBit`, course.seoDescription || course.tagline]
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
  }, [pathname, projects, services, courses]);
}

function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={theme === "dark" ? "Yorug‘ rejimga o‘tish" : "To‘q rejimga o‘tish"}
      onClick={() => setTheme(next)}
    >
      {theme === "dark" ? <Sun size={18} strokeWidth={1.7} /> : <Moon size={18} strokeWidth={1.7} />}
    </button>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  const nav = useNav();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    // Pastga aylantirganda header yashirinadi, yuqoriga qaytganda yana chiqadi.
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className={`header ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""}`}>
      <div className="container header-inner">
        <Link to="/" aria-label="AlifBit — bosh sahifa" className="header-brand">
          <Brand />
        </Link>
        <nav className="nav" aria-label="Asosiy menyu">
          {nav.map(([label, to]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
          <a href={OFFICE_URL}>Virtual ofis</a>
        </nav>
        <ThemeToggle />
        <ButtonLink to="/contact" small className="header-cta">
          Buyurtma berish
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
  const items = [["Bosh sahifa", "/"], ...useNav(), ["Virtual ofis", OFFICE_URL], ["Buyurtma berish", "/contact"]];
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
          {items.map(([label, to], i) => {
            const inner = (
              <>
                <small>{String(i + 1).padStart(2, "0")}</small>
                {label}
                <Arrow />
              </>
            );
            const style = { "--i": i } as CSSProperties;
            return to.startsWith("http") || to === OFFICE_URL ? (
              <a key={to} href={to} style={style}>
                {inner}
              </a>
            ) : (
              <Link key={to} to={to} onClick={close} style={style}>
                {inner}
              </Link>
            );
          })}
        </nav>
        <div className="mobile-menu-foot">
          <p>{copy.uz.tagline}</p>
          <ButtonLink to={TELEGRAM_URL} variant="outline">
            Telegram · @alifbitbot
          </ButtonLink>
        </div>
      </div>
    </dialog>
  );
}

function Footer() {
  const { services } = useContent();
  const nav = useNav();
  return (
    <footer className="footer on-dark">
      <div className="container">
        <div className="footer-main">
          <div className="footer-about">
            <Link to="/" aria-label="AlifBit — bosh sahifa">
              <Brand light />
            </Link>
            <p>{copy.uz.tagline}</p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <span>XIZMATLAR</span>
              {services.map((s) => (
                <Link key={s.slug} to={`/services/${s.slug}`}>
                  {s.name}
                </Link>
              ))}
            </div>
            <div className="footer-col">
              <span>ALIFBIT</span>
              {nav
                .filter(([, to]) => to !== "/services")
                .map(([label, to]) => (
                  <Link key={to} to={to}>
                    {label}
                  </Link>
                ))}
              <Link to="/journal">Qaydlar</Link>
            </div>
            <div className="footer-col">
              <span>ALOQA</span>
              <ButtonLink to={TELEGRAM_URL} variant="light" small>
                Telegram · @alifbitbot
              </ButtonLink>
              <Link to="/contact">
                Buyurtma berish <Arrow size={15} />
              </Link>
              <a href={PAY_URL}>
                To‘lov qilish <Arrow size={15} />
              </a>
              <small>O‘zbekiston</small>
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
  useEffect(applyStoredTheme, []);

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
      <NetworkBackground />
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
