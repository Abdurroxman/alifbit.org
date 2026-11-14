import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, BookOpen, Box, Check, Code2, Film, GraduationCap, Heart, Shapes } from "lucide-react";
import { useContent } from "../App";
import HeroScene from "../components/HeroScene";
import Process from "../components/Process";
import { ProjectCard } from "../components/Projects";
import { Arrow, ButtonLink, ContactBand, Eyebrow, Lines, TextLink, delay } from "../components/ui";
import { BrandMark } from "../components/Brand";
import SadoIcon from "../components/sado/SadoIcon";
import DalolatPhone from "../components/dalolat/DalolatPhone";
import { copy, DALOLAT_APP_URL, DALOLAT_URL, SADO_URL } from "../../shared/content";

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

/** Sakkiz qirrali yulduz (DALOLAT ilovasidagi girih naqshi). */
const DL_STAR =
  "M12 .5 14.4 6.4 20.1 3.9 17.6 9.6 23.5 12 17.6 14.4 20.1 20.1 14.4 17.6 12 23.5 9.6 17.6 3.9 20.1 6.4 14.4.5 12 6.4 9.6 3.9 3.9 9.6 6.4Z";
const DL_ARCH_OUTER = "M30 640V280C30 168 118 98 200 28c82 70 170 140 170 252v360";
const DL_ARCH_INNER = "M62 640V290c0-96 74-155 138-210 64 55 138 114 138 210v350";

function DalolatPromo() {
  const points = ["Moslik foizi, filtr va ID bo‘yicha qidiruv", "Ko‘k belgili, jonli tekshirilgan anketalar", "Rasmlar faqat ruxsat berilganlarga ochiladi"];
  return (
    <section className="dalolat dl-promo" aria-labelledby="dl-promo-title">
      <div className="dl-pattern" aria-hidden="true" />
      <div className="container dl-promo-grid">
        <div className="dl-promo-art" data-reveal="scale">
          <svg className="dl-arch" viewBox="0 0 400 640" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <defs>
              <linearGradient id="dlArchFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fffaf1" />
                <stop offset="1" stopColor="#efe1cb" />
              </linearGradient>
            </defs>
            <path className="dl-arch-fill" d={DL_ARCH_OUTER} />
            <path className="dl-arch-line" pathLength={1} d={DL_ARCH_OUTER} />
            <path className="dl-arch-line" pathLength={1} d={DL_ARCH_INNER} />
          </svg>
          <svg className="dl-star" viewBox="0 0 24 24" aria-hidden="true">
            <path d={DL_STAR} fill="currentColor" />
          </svg>
          <DalolatPhone />
          <span className="dl-chip dl-chip-a" aria-hidden="true">
            <Heart strokeWidth={1.8} />
            86% mos
          </span>
          <span className="dl-chip dl-chip-b" aria-hidden="true">
            <BadgeCheck strokeWidth={1.8} />
            Tasdiqlangan
          </span>
        </div>
        <div className="dl-promo-copy">
          <div className="dl-brand" data-reveal="fade">
            <img src="/images/dalolat/wordmark.webp" width={848} height={140} alt="DALOLAT" loading="lazy" />
            <small>Telegram Mini App</small>
          </div>
          <h2 id="dl-promo-title" data-reveal style={delay(100)}>
            Munosib juft —
            <br />
            <span className="dl-accent">mustahkam oila.</span>
          </h2>
          <p data-reveal style={delay(200)}>
            DALOLAT — Telegram ichidagi ilova. Diniy qadriyatlarga muvofiq munosib juft topishga ko‘maklashadi:
            lenta talablaringizga qarab saralanadi, nomzodga so‘rov yuborasiz, u qabul qilsa, ilova ichida
            suhbatlashasiz.
          </p>
          <ul className="dl-points" data-reveal style={delay(260)}>
            {points.map((p) => (
              <li key={p}>
                <Check strokeWidth={2.6} aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          <div className="dl-actions" data-reveal style={delay(320)}>
            <ButtonLink to={DALOLAT_URL} className="dl-btn-primary" magnetic>
              Dalolat bilan tanishing
            </ButtonLink>
            <ButtonLink to={DALOLAT_APP_URL} variant="ghost" className="dl-btn-ghost">
              Ilovani ochish
            </ButtonLink>
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
      <DalolatPromo />
      <Approach />
      <Featured />
      <Process />
      <ServicesPreview />
      <Knowledge />
      <ContactBand />
    </>
  );
}
