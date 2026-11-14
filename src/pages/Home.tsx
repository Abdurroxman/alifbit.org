import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Box, Code2, Film, GraduationCap, Shapes } from "lucide-react";
import { useContent } from "../App";
import HeroScene from "../components/HeroScene";
import Process from "../components/Process";
import { ProjectCard } from "../components/Projects";
import { Arrow, ButtonLink, ContactBand, Eyebrow, Lines, TextLink, delay } from "../components/ui";
import { BrandMark } from "../components/Brand";
import SadoIcon from "../components/sado/SadoIcon";
import { copy, SADO_URL } from "../../shared/content";

export const serviceIcons: Record<string, typeof Code2> = {
  code: Code2,
  academy: GraduationCap,
  film: Film,
  book: BookOpen,
  box: Box,
  spark: Shapes,
};

function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <a className="hero-sado" href={SADO_URL} data-reveal="fade">
            <SadoIcon />
            <span className="hero-sado-new">Yangi</span>
            <span className="hero-sado-text">
              <b>Sado</b> — gapiring, u yozadi.<span className="hero-sado-more"> Windows uchun ovoz bilan yozish</span>
            </span>
            <Arrow />
          </a>
          <div data-reveal="fade">
            <Eyebrow>Texnologiya. Ilm. Ijod.</Eyebrow>
          </div>
          <Lines as="h1" delay={80}>
            {[
              "Har bir buyuk",
              <>
                loyiha bir <span className="serif">g‘oyadan</span>
              </>,
              <>
                boshlanadi<span className="dot">.</span>
              </>,
            ]}
          </Lines>
          <p className="hero-text" data-reveal style={delay(380)}>
            {copy.uz.hero.text}
          </p>
          <div className="hero-actions" data-reveal style={delay(500)}>
            <ButtonLink to="/projects" magnetic>
              Loyihalarimizni ko‘rish
            </ButtonLink>
            <ButtonLink to="/contact" variant="ghost">
              Loyihangizni boshlang
            </ButtonLink>
          </div>
        </div>
        <HeroScene />
      </div>
      <div className="container hero-foot" data-reveal="fade" style={delay(700)}>
        <a href="#approach" className="scroll-cue">
          <span className="scroll-line" aria-hidden="true" />
          Kashf etish uchun pastga
        </a>
        <p>
          Foydali g‘oyalar.
          <br />
          <span>Puxta o‘ylangan yechimlar.</span>
        </p>
      </div>
    </section>
  );
}

function Approach() {
  const words = ["Development", "Knowledge", "Creative", "Digital Products"];
  return (
    <section id="approach" className="approach section">
      <div className="container">
        <div data-reveal="fade">
          <Eyebrow>Bir g‘oya atrofida</Eyebrow>
        </div>
        <div className="approach-grid">
          <Lines>
            {[
              "Texnologiya yaratamiz.",
              "Bilim ulashamiz.",
              <span className="accent" key="a">
                Ma’no qoldiramiz.
              </span>,
            ]}
          </Lines>
          <div className="approach-copy" data-reveal style={delay(200)}>
            <p className="lead">AlifBit — texnologiya, ilm va ijod uchrashadigan makon.</p>
            <p>
              Biz uchun yaxshi mahsulot koddan boshlanmaydi. U insonning ehtiyojini tushunishdan
              boshlanadi. Shuning uchun har bir ishimizda aniqlik, foyda va mazmunni birinchi o‘ringa
              qo‘yamiz.
            </p>
            <TextLink to="/about">AlifBit bilan tanishing</TextLink>
          </div>
        </div>
      </div>
      <div className="marquee" aria-label={words.join(", ")}>
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map((n) => (
            <div className="marquee-group" key={n}>
              {words.map((w) => (
                <span key={w}>
                  {w}
                  <i />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Featured() {
  const { projects } = useContent();
  return (
    <section className="featured section">
      <div className="container">
        <div className="section-head">
          <div>
            <div data-reveal="fade">
              <Eyebrow>AlifBit ekotizimi</Eyebrow>
            </div>
            <Lines>
              {[
                "G‘oyalarimizning",
                <span className="accent" key="a">
                  raqamli ifodasi.
                </span>,
              ]}
            </Lines>
          </div>
          <div className="section-aside" data-reveal style={delay(150)}>
            <p>Turli yo‘nalishlar. Bitta maqsad — insonlarga foyda keltirish.</p>
            <TextLink to="/projects">Barcha loyihalar</TextLink>
          </div>
        </div>
        <div className="projects-grid featured-grid">
          {projects.slice(0, 4).map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} delay={(i % 2) * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SadoPromo() {
  return (
    <section className="sado sado-dark sd-promo" aria-labelledby="sd-promo-title">
      <div className="sd-echo" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="container sd-promo-grid">
        <div className="sd-promo-copy">
          <div className="sd-brand" data-reveal="fade">
            <SadoIcon />
            <span>
              Sado <small>Windows uchun</small>
            </span>
          </div>
          <h2 id="sd-promo-title" data-reveal style={delay(100)}>
            Gapiring.
            <br />
            <span className="sd-accent">Sado yozadi.</span>
          </h2>
          <p data-reveal style={delay(200)}>
            Istalgan dasturda tugmani bosib turing va gapiring. Sado nutqingizni aniq matnga, toza yozuvga
            yoki AI uchun tartibli topshiriqqa aylantiradi.
          </p>
          <div className="sd-hero-actions" data-reveal style={delay(300)}>
            <ButtonLink to={SADO_URL} className="sd-btn-primary" magnetic>
              Sado bilan tanishing
            </ButtonLink>
            <ButtonLink to={`${SADO_URL}/#request`} variant="ghost" className="sd-btn-ghost">
              Kalit so‘rash
            </ButtonLink>
          </div>
        </div>
        <div className="sd-promo-art" data-reveal="scale" aria-hidden="true">
          <SadoIcon className="sd-promo-icon" />
          <div className="sd-promo-wave">
            {Array.from({ length: 21 }, (_, j) => (
              <i key={j} style={{ "--j": j } as CSSProperties} />
            ))}
          </div>
          <div className="sd-promo-keys">
            <kbd>Alt</kbd>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesPreview() {
  const dirs = ["left", "up", "right"];
  return (
    <section className="services-preview section">
      <div className="container">
        <div className="section-head">
          <div>
            <div data-reveal="fade">
              <Eyebrow>Yo‘nalishlarimiz</Eyebrow>
            </div>
            <Lines>
              {[
                "Bir brend.",
                <span className="accent" key="a">
                  Cheksiz imkoniyatlar.
                </span>,
              ]}
            </Lines>
          </div>
          <p data-reveal style={delay(150)}>
            Bir-birini to‘ldiradigan olti yo‘nalish. G‘oyangiz qaysi yo‘ldan boshlanadi?
          </p>
        </div>
        <ServiceGrid revealDirs={dirs} />
      </div>
    </section>
  );
}

export function ServiceGrid({ revealDirs }: { revealDirs?: string[] }) {
  const { services } = useContent();
  return (
    <div className="service-grid">
      {services.map((s, i) => {
        const Icon = serviceIcons[s.icon] || Shapes;
        const dir = revealDirs?.[i % 3];
        return (
          <div
            key={s.slug}
            className="service-cell"
            data-reveal={dir === "up" ? "" : dir}
            style={{ "--d": (i % 3) * 90 } as CSSProperties}
          >
          <Link to={`/services/${s.slug}`} className="service-card">
            <div className="service-card-top">
              <span className="service-icon">
                <Icon size={22} strokeWidth={1.4} />
              </span>
              <span className="service-num">{s.number}</span>
            </div>
            <h3>{s.name}</h3>
            <p>{s.short}</p>
            <span className="service-more">
              Batafsil <Arrow size={16} />
            </span>
          </Link>
          </div>
        );
      })}
    </div>
  );
}

function Knowledge() {
  return (
    <section className="knowledge section">
      <div className="container knowledge-grid">
        <div className="knowledge-art" data-reveal="scale">
          <div className="knowledge-symbol">
            <BrandMark />
          </div>
          <Link to="/academy" className="knowledge-book kb-one">
            <small>ALIFBIT ACADEMY</small>
            <span>
              Ilm —<br />
              eng yaxshi
              <br />
              <em>boshlanish.</em>
            </span>
          </Link>
          <Link to="/library" className="knowledge-book kb-two">
            <BookOpen strokeWidth={1.2} />
            <span>
              Bir sahifa.
              <br />
              Yangi dunyo.
            </span>
            <small>ALIFBIT LIBRARY</small>
          </Link>
        </div>
        <div className="knowledge-copy">
          <div data-reveal="fade">
            <Eyebrow>Bilimga qo‘yilgan qadam</Eyebrow>
          </div>
          <Lines>
            {[
              "Kelajakni yaratish",
              "uchun, avval",
              <span className="accent" key="a">
                o‘rganamiz.
              </span>,
            ]}
          </Lines>
          <p data-reveal style={delay(150)}>
            Yangi bilim yangi imkoniyatlarga yo‘l ochadi. Academy va Library orqali o‘rganish, mutolaa
            va rivojlanish uchun mazmunli makon yaratamiz.
          </p>
          <div className="knowledge-links" data-reveal style={delay(250)}>
            <TextLink to="/academy">Academy bilan tanishing</TextLink>
            <TextLink to="/library">Library’ni kashf eting</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <SadoPromo />
      <Approach />
      <Featured />
      <Process />
      <ServicesPreview />
      <Knowledge />
      <ContactBand />
    </>
  );
}
