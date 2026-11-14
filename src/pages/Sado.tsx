import { useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AppWindow,
  BookA,
  Check,
  Copy,
  Download,
  EyeOff,
  HardDrive,
  Languages,
  Lock,
  Mic,
  MousePointerClick,
  Power,
  Send,
  ShieldCheck,
  SpellCheck,
  UserRound,
} from "lucide-react";
import SadoIcon from "../components/sado/SadoIcon";
import SadoDemo, { MODES, type SadoMode } from "../components/sado/SadoDemo";
import { Breadcrumb, ButtonLink, ContactBand, Eyebrow, Lines, delay } from "../components/ui";
import { sadoRelease } from "../../shared/content";
import "../styles/sado.css";

const TELEGRAM = "https://t.me/id799";
const KEY_REQUEST = "/contact?service=products&request=sado-key";
const released = sadoRelease.size > 0;
const sizeMb = (sadoRelease.size / 1024 / 1024).toFixed(1);

function Feature({ icon, title, children, i }: { icon: ReactNode; title: string; children: ReactNode; i: number }) {
  return (
    <div className="sd-feature" data-reveal style={{ "--d": (i % 3) * 90 } as CSSProperties}>
      <span className="sd-feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function DownloadButton({ large = false }: { large?: boolean }) {
  if (!released)
    return (
      <span className={`button sd-btn-download is-pending ${large ? "sd-btn-large" : ""}`} aria-disabled="true">
        <Download size={18} /> Windows uchun · tez kunda
      </span>
    );
  return (
    <a className={`button sd-btn-download ${large ? "sd-btn-large" : ""}`} href="/download/sado" download data-magnetic="">
      <Download size={18} /> Windows uchun yuklab olish
      <small>v{sadoRelease.version}</small>
    </a>
  );
}

function Hero() {
  return (
    <section className="sd-hero sado-dark">
      <div className="sd-echo" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="container">
        <Breadcrumb name="Sado" />
        <div className="sd-hero-grid">
          <div className="sd-hero-copy">
            <div className="sd-brand" data-reveal="fade">
              <SadoIcon />
              <span>
                Sado <small>Windows uchun</small>
              </span>
            </div>
            <Lines as="h1" delay={100}>
              {[
                "Gapiring.",
                <span className="sd-accent" key="a">
                  Sado yozadi.
                </span>,
              ]}
            </Lines>
            <p className="sd-lead" data-reveal style={delay(300)}>
              Istalgan dasturda tugmalarni bosib turing, gapiring va qo‘yib yuboring. Sado nutqingizni
              matnga, toza yozuvga yoki AI uchun tartibli topshiriqqa aylantiradi.
            </p>
            <div className="sd-hero-actions" data-reveal style={delay(420)}>
              {released ? (
                <a className="button sd-btn-primary" href="/download/sado" download data-magnetic="">
                  Windows uchun yuklab olish
                  <span className="button-icon" aria-hidden="true">
                    <Download size={16} />
                  </span>
                </a>
              ) : (
                <ButtonLink to="#download" className="sd-btn-primary" magnetic>
                  Windows uchun yuklab olish
                </ButtonLink>
              )}
              <ButtonLink to={KEY_REQUEST} variant="ghost" className="sd-btn-ghost">
                Kalit so‘rash
              </ButtonLink>
            </div>
            <ul className="sd-hero-facts" data-reveal="fade" style={delay(560)}>
              <li>
                <Languages size={15} /> O‘zbek, rus, ingliz, turk, qozoq
              </li>
              <li>
                <AppWindow size={15} /> Windows 10 va 11
              </li>
            </ul>
          </div>
          <div className="sd-hero-demo" data-reveal="scale" style={delay(200)}>
            <SadoDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS: Array<[string, string, string]> = [
  ["Bosib turing", "Istalgan dasturda Alt tugmasini — yoki o‘zingiz tanlagan birikmani — bosib turing.", "hold"],
  ["Gapiring", "Sado faqat tugmalarni bosib turganingizda tinglaydi. Emblema ovozingizga qarab to‘lqinlanadi.", "speak"],
  ["Qo‘yib yuboring", "Tugmani qo‘yib yuborishingiz bilan matn kursor turgan joyga kiritiladi. Esc — bekor qilish.", "insert"],
];

function HowItWorks() {
  return (
    <section className="container section sd-how">
      <div className="section-head">
        <div>
          <div data-reveal="fade">
            <Eyebrow>Qanday ishlaydi</Eyebrow>
          </div>
          <Lines>
            {[
              "Uch harakat.",
              <span className="accent" key="a">
                Klaviaturasiz yozuv.
              </span>,
            ]}
          </Lines>
        </div>
        <p data-reveal style={delay(150)}>
          Xat, chat, hujjat yoki brauzer — matn yoziladigan joy bo‘lsa, Sado shu yerda ishlaydi.
        </p>
      </div>
      <ol className="sd-steps">
        {STEPS.map(([title, text, kind], i) => (
          <li key={title} className={`sd-step sd-step-${kind}`} data-reveal style={{ "--d": i * 120 } as CSSProperties}>
            <div className="sd-step-art" aria-hidden="true">
              {kind === "hold" && (
                <kbd className="sd-step-key">Alt</kbd>
              )}
              {kind === "speak" && (
                <div className="sd-step-wave">
                  {Array.from({ length: 9 }, (_, j) => (
                    <i key={j} style={{ "--j": j } as CSSProperties} />
                  ))}
                </div>
              )}
              {kind === "insert" && (
                <div className="sd-step-field">
                  <span>Assalomu alaykum</span>
                  <i />
                </div>
              )}
            </div>
            <span className="sd-step-num">0{i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ModesSection() {
  const order: SadoMode[] = ["exact", "clean", "prompt"];
  return (
    <section className="sd-modes-section sado-dark">
      <div className="container section">
        <div className="section-head">
          <div>
            <div data-reveal="fade">
              <Eyebrow>Uch rejim</Eyebrow>
            </div>
            <Lines>
              {[
                "Bitta ovoz.",
                <span className="sd-accent" key="a">
                  Uch xil natija.
                </span>,
              ]}
            </Lines>
          </div>
          <p data-reveal style={delay(150)}>
            Har bir rejimning o‘z tugmasi bor. Asosiy rejimni Sozlamalarda tanlaysiz.
          </p>
        </div>
        <div className="sd-mode-cards">
          {order.map((m, i) => (
            <article key={m} className={`sd-mode-card sd-mode-${m}`} data-reveal style={{ "--d": i * 110 } as CSSProperties}>
              <div className="sd-mode-head">
                <h3>{MODES[m].name}</h3>
                <span className="sd-chord">
                  {MODES[m].keys.map((k) => (
                    <kbd key={k}>{k}</kbd>
                  ))}
                </span>
              </div>
              <p>{MODES[m].desc}</p>
              <div className="sd-mode-example">
                <small>Aytilgan gap</small>
                <q>{MODES[m].spoken}</q>
                <small>Sado yozgan matn</small>
                <span className="sd-mode-result">{MODES[m].result}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items: Array<[ReactNode, string, string]> = [
    [<BookA size={22} key="i" />, "Shaxsiy lug‘at", "Sado to‘g‘ri yozishi kerak bo‘lgan ism va atamalarni bir marta kiritasiz."],
    [<Languages size={22} key="i" />, "Olti nutq tili", "Avtomatik aniqlash, o‘zbek, rus, ingliz, turk va qozoq tillari."],
    [<SpellCheck size={22} key="i" />, "To‘g‘ri o‘zbekcha", "O‘zbekcha apostroflar bir xil yoziladi, kirillda aytilgan o‘zbekcha lotinga o‘giriladi."],
    [<UserRound size={22} key="i" />, "Profil va loyihalar", "Prompt rejimi kasbingiz va loyihalaringizni biladi — faqat siz ruxsat bergan qismini."],
    [<MousePointerClick size={22} key="i" />, "Kiritishdan oldin tekshirish", "Xohlasangiz, matn dasturga kirishidan oldin uni ko‘rib, tuzatib olasiz."],
    [<Power size={22} key="i" />, "Doim yoningizda", "Windows bilan birga ishga tushadi. Emblema ekranning pastida, siz tanlagan joyda turadi."],
  ];
  return (
    <section className="container section sd-features">
      <div className="section-head">
        <div>
          <div data-reveal="fade">
            <Eyebrow>Imkoniyatlar</Eyebrow>
          </div>
          <Lines>
            {[
              "Har kungi ish uchun",
              <span className="accent" key="a">
                o‘ylab yaratilgan.
              </span>,
            ]}
          </Lines>
        </div>
      </div>
      <div className="sd-feature-grid">
        {items.map(([icon, title, text], i) => (
          <Feature key={title} icon={icon} title={title} i={i}>
            {text}
          </Feature>
        ))}
      </div>
    </section>
  );
}

function Privacy() {
  const points: Array<[ReactNode, string]> = [
    [<Mic size={20} key="i" />, "Sado faqat tugmalarni bosib turganingizda tinglaydi."],
    [<HardDrive size={20} key="i" />, "Tarix faqat shu kompyuterda, Windows hisobingiz bilan shifrlangan holda saqlanadi."],
    [<EyeOff size={20} key="i" />, "Sado parol maydonlariga hech qachon yozmaydi."],
    [<Lock size={20} key="i" />, "Profildagi ismingiz AI’ga yuborilmaydi. Profil kontekstini butunlay o‘chirib qo‘yish mumkin."],
  ];
  return (
    <section className="sd-privacy">
      <div className="container sd-privacy-grid">
        <div className="sd-privacy-art" data-reveal="scale" aria-hidden="true">
          <SadoIcon tile={false} />
          <ShieldCheck className="sd-privacy-shield" size={44} strokeWidth={1.4} />
        </div>
        <div>
          <div data-reveal="fade">
            <Eyebrow>Maxfiylik</Eyebrow>
          </div>
          <Lines>
            {[
              "Ovozingiz —",
              <span className="accent" key="a">
                sizniki.
              </span>,
            ]}
          </Lines>
          <ul className="sd-privacy-list">
            {points.map(([icon, text], i) => (
              <li key={text} data-reveal style={{ "--d": i * 90 } as CSSProperties}>
                <span>{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function DownloadSection() {
  const [copied, setCopied] = useState(false);
  async function copyHash() {
    try {
      await navigator.clipboard.writeText(sadoRelease.sha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
  return (
    <section className="sd-download sado-dark" id="download">
      <div className="sd-echo sd-echo-center" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="container section">
        <div className="sd-download-card" data-reveal="scale">
          <div className="sd-download-main">
            <SadoIcon className="sd-download-icon" />
            <div data-reveal="fade">
              <Eyebrow>Yuklab olish</Eyebrow>
            </div>
            <h2>
              Sado
              <br />
              <span className="sd-accent">Windows uchun</span>
            </h2>
            <dl className="sd-meta">
              <div>
                <dt>Versiya</dt>
                <dd>{sadoRelease.version}</dd>
              </div>
              <div>
                <dt>Tizim</dt>
                <dd>Windows 10 / 11 · 64-bit</dd>
              </div>
              {released && (
                <div>
                  <dt>Hajmi</dt>
                  <dd>{sizeMb} MB</dd>
                </div>
              )}
              <div>
                <dt>Holati</dt>
                <dd>{released ? "Ishlayapti" : "Tez kunda"}</dd>
              </div>
            </dl>
            <DownloadButton large />
            {released && sadoRelease.sha256 && (
              <button className="sd-hash" onClick={copyHash} title="SHA-256 ni nusxalash">
                <span>SHA-256</span>
                <code>{sadoRelease.sha256}</code>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
          </div>
          <ol className="sd-install">
            <li>
              <span>01</span>
              <div>
                <b>Faylni yuklab oling va ishga tushiring</b>
                <p>Windows ogohlantirsa: «Batafsil» → «Baribir ishga tushirish».</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <b>Aktivatsiya kalitini kiriting</b>
                <p>Sado uchun aktivatsiya kaliti kerak. Kalitlarni AlifBit beradi.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <b>Notepad’ni oching va sinab ko‘ring</b>
                <p>Alt tugmasini bosib turib gap ayting va qo‘yib yuboring.</p>
              </div>
            </li>
            <li className="sd-key-actions">
              <ButtonLink to={KEY_REQUEST} variant="light">
                Kalit so‘rash
              </ButtonLink>
              <a className="sd-telegram" href={TELEGRAM} target="_blank" rel="noreferrer">
                <Send size={16} /> Telegram · @id799
              </a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

const FAQ: Array<[string, ReactNode]> = [
  [
    "Aktivatsiya kalitini qayerdan olaman?",
    <>
      Kalitlarni AlifBit beradi. <Link to={KEY_REQUEST}>Murojaat formasi</Link> orqali yoki Telegram’da{" "}
      <a href={TELEGRAM} target="_blank" rel="noreferrer">
        @id799
      </a>{" "}
      ga yozing.
    </>,
  ],
  ["Qaysi dasturlarda ishlaydi?", "Matn yoziladigan istalgan oynada. Agar biror dastur kiritishni to‘sib qo‘ysa, Sado natijani ko‘rsatadi — uni nusxalab olasiz."],
  ["Internet kerakmi?", "Ha. Nutqni tanish va matnni qayta ishlash internet orqali bajariladi."],
  ["Tugmalarni o‘zgartirsa bo‘ladimi?", "Ha. Sozlamalar → Tugmalar bo‘limida har bir rejim uchun o‘z birikmangizni tanlaysiz."],
  ["Yozuvlarim qayerda saqlanadi?", "Tarix faqat shu kompyuterda, shifrlangan holda turadi. Uni o‘chirib qo‘yish yoki istalgan vaqtda tozalash mumkin."],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="container section faq sd-faq">
      <div>
        <div data-reveal="fade">
          <Eyebrow>Savollar</Eyebrow>
        </div>
        <Lines>
          {[
            "Yuklab olishdan",
            <span className="accent" key="a">
              oldin.
            </span>,
          ]}
        </Lines>
      </div>
      <div className="faq-list">
        {FAQ.map(([q, a], i) => (
          <div className={`faq-item ${open === i ? "is-open" : ""}`} key={q} data-reveal style={{ "--d": i * 70 } as CSSProperties}>
            <h3>
              <button aria-expanded={open === i} aria-controls={`sd-faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                {q}
                <span aria-hidden="true">{open === i ? "−" : "+"}</span>
              </button>
            </h3>
            <div id={`sd-faq-${i}`} className="faq-answer" role="region" hidden={open !== i}>
              <p>{a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Sado() {
  return (
    <div className="sado">
      <Hero />
      <HowItWorks />
      <ModesSection />
      <Features />
      <Privacy />
      <DownloadSection />
      <Faq />
      <ContactBand />
    </div>
  );
}

