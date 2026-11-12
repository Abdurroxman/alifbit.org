import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  GraduationCap,
  Film,
  BookOpen,
  Box,
  Shapes,
  Plus,
  Minus,
  Send,
  Paperclip,
  Check,
  LoaderCircle,
} from "lucide-react";
import { useContent } from "../App";
import {
  Arrow,
  Breadcrumb,
  ContactBand,
  Eyebrow,
  PageTop,
  TextLink,
} from "../components/Layout";
import { BrandMark } from "../components/Brand";
import { ProjectCard, Status } from "../components/Projects";
import ProjectArt from "../components/ProjectArt";
import Process from "../components/Process";
import { copy, type Service } from "../../shared/content";
import { api } from "../lib/api";
const icons: Record<string, typeof Code2> = {
  code: Code2,
  academy: GraduationCap,
  film: Film,
  book: BookOpen,
  box: Box,
  spark: Shapes,
};
export function ServiceRows() {
  const { services } = useContent();
  return (
    <div className="service-rows">
      {services.map((service) => {
        const Icon = icons[service.icon] || Shapes;
        return (
          <Link
            className="service-row"
            to={`/services/${service.slug}`}
            key={service.slug}
          >
            <span className="row-number">{service.number}</span>
            <span className="service-icon">
              <Icon strokeWidth={1.2} />
            </span>
            <h3>{service.name}</h3>
            <p>{service.short}</p>
            <Arrow />
          </Link>
        );
      })}
    </div>
  );
}
export function Home() {
  const { projects } = useContent();
  return (
    <>
      <section className="hero container">
        <div className="hero-topline">
          <Eyebrow>TEXNOLOGIYA. ILM. IJOD.</Eyebrow>
          <span className="hero-edition">
            ALIFBIT · MUSTAQIL G‘OYALAR EKOTIZIMI
          </span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>
              Har bir buyuk
              <br />
              loyiha bir <span>g‘oyadan</span>
              <br />
              boshlanadi<span className="gold-dot">.</span>
            </h1>
            <p>{copy.uz.hero.text}</p>
            <div className="hero-actions">
              <Link className="button" to="/projects">
                Loyihalarimizni ko‘rish
                <Arrow />
              </Link>
              <Link className="button button-text" to="/contact">
                Loyihangizni boshlang
                <Arrow />
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-art-frame">
              <img
                className="hero-art"
                src="/images/idea-sculpture.webp"
                alt="Yashil kod qavslari, oltin shar va vertikal shakldan tuzilgan AlifBit g‘oya kompozitsiyasi"
                width="1536"
                height="1024"
                fetchPriority="high"
              />
              <div className="art-corner corner-tl" />
              <div className="art-corner corner-br" />
            </div>
            <div className="hero-art-note">
              <span>01 — G‘OYANING ILK SHAKLI</span>
              <span>Fikr → shakl → natija</span>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <a href="#approach" className="scroll-link">
            <span>
              <ArrowDown size={15} />
            </span>
            Kashf etish uchun pastga
          </a>
          <p>
            Foydali g‘oyalar.
            <br />
            <span>Puxta o‘ylangan yechimlar.</span>
          </p>
          <span className="hero-monogram">
            <BrandMark />
          </span>
        </div>
      </section>
      <section id="approach" className="intro-section container">
        <Eyebrow>BIR G‘OYA ATROFIDA</Eyebrow>
        <div className="intro-grid">
          <h2>
            Texnologiya yaratamiz.
            <br />
            Bilim ulashamiz.
            <br />
            <span>Ma’no qoldiramiz.</span>
          </h2>
          <div>
            <p className="lead">
              AlifBit — texnologiya, ilm va ijod uchrashadigan makon.
            </p>
            <p>
              Biz uchun yaxshi mahsulot koddan boshlanmaydi. U insonning
              ehtiyojini tushunishdan boshlanadi. Shuning uchun har bir
              ishimizda aniqlik, foyda va mazmunni birinchi o‘ringa qo‘yamiz.
            </p>
            <TextLink to="/about">AlifBit bilan tanishing</TextLink>
          </div>
        </div>
        <div className="discipline-strip">
          <span>Development</span>
          <i />
          <span>Knowledge</span>
          <i />
          <span>Creative</span>
          <i />
          <span>Digital Products</span>
        </div>
      </section>
      <section className="featured-section section-space">
        <div className="container">
          <div className="section-heading">
            <div>
              <Eyebrow>ALIFBIT EKOTIZIMI</Eyebrow>
              <h2>
                G‘oyalarimizning
                <br />
                <span>raqamli ifodasi.</span>
              </h2>
            </div>
            <div>
              <p>
                Turli yo‘nalishlar. Bitta maqsad —<br />
                insonlarga foyda keltirish.
              </p>
              <TextLink to="/projects">Barcha loyihalar</TextLink>
            </div>
          </div>
          <div className="projects-grid home-projects">
            {projects.slice(0, 4).map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>
      <Process />
      <section className="services-section container section-space">
        <div className="section-heading">
          <div>
            <Eyebrow>YO‘NALISHLARIMIZ</Eyebrow>
            <h2>
              Bir brend.
              <br />
              <span>Cheksiz imkoniyatlar.</span>
            </h2>
          </div>
          <p>
            Bir-birini to‘ldiradigan olti yo‘nalish.
            <br />
            G‘oyangiz qaysi yo‘ldan boshlanadi?
          </p>
        </div>
        <ServiceRows />
      </section>
      <section className="knowledge-section">
        <div className="container knowledge-grid">
          <div className="knowledge-art">
            <div className="knowledge-symbol">
              <BrandMark />
            </div>
            <div className="knowledge-book kb-one">
              <span>
                Ilm —<br />
                eng yaxshi
                <br />
                <em>boshlanish.</em>
              </span>
              <small>ALIFBIT ACADEMY</small>
            </div>
            <div className="knowledge-book kb-two">
              <BookOpen strokeWidth={1} />
              <span>
                Bir sahifa.
                <br />
                Yangi dunyo.
              </span>
              <small>ALIFBIT LIBRARY</small>
            </div>
          </div>
          <div className="knowledge-copy">
            <Eyebrow>BILIMGA QO‘YILGAN QADAM</Eyebrow>
            <h2>
              Kelajakni yaratish
              <br />
              uchun, avval
              <br />
              <span>o‘rganamiz.</span>
            </h2>
            <p>
              Yangi bilim yangi imkoniyatlarga yo‘l ochadi. Academy va Library
              orqali o‘rganish, mutolaa va rivojlanish uchun mazmunli makon
              yaratamiz.
            </p>
            <div className="knowledge-links">
              <TextLink to="/academy">Academy bilan tanishing</TextLink>
              <TextLink to="/library">Library’ni kashf eting</TextLink>
            </div>
          </div>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
export function Projects() {
  const { projects, categories, error, refresh } = useContent();
  const [params, setParams] = useSearchParams();
  const filter = params.get("category") || "Barchasi";
  const list = projects.filter(
    (p) => filter === "Barchasi" || p.category === filter,
  );
  return (
    <>
      <PageTop
        name="Loyihalar"
        eyebrow="BIZ YARATAYOTGAN DUNYO"
        title={
          <>
            Har bir loyiha —<br />
            <span>bir foydali g‘oya.</span>
          </>
        }
        text="Dasturlar, bilim manbalari va ijodiy izlanishlar. AlifBit ekotizimini tashkil etadigan loyihalar bilan tanishing."
      />
      <section className="container catalog-section">
        {error && (
          <div className="notice" role="status">
            {error}
            <button onClick={refresh}>Qayta yuklash</button>
          </div>
        )}
        <div className="catalog-toolbar">
          <div className="filters" aria-label="Loyiha yo‘nalishlari">
            {categories.map((c) => (
              <button
                key={c}
                aria-pressed={filter === c}
                className={filter === c ? "active" : ""}
                onClick={() =>
                  setParams(c === "Barchasi" ? {} : { category: c }, {
                    preventScrollReset: true,
                  })
                }
              >
                {c}
              </button>
            ))}
          </div>
          <span className="results-count">{list.length} ta loyiha</span>
        </div>
        {list.length ? (
          <div className="projects-grid">
            {list.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Shapes strokeWidth={1} />
            <h2>Bu yo‘nalishda yangi g‘oyalar uchun joy bor.</h2>
            <p>Hozircha bu kategoriyada e’lon qilingan loyiha yo‘q.</p>
            <button
              className="button button-outline"
              onClick={() => setParams({})}
            >
              Barcha loyihalarni ko‘rish
              <Arrow />
            </button>
          </div>
        )}
        <p className="catalog-note">
          «Taqdimot» belgisi loyiha konsepsiyasini bildiradi. Rasmiy
          imkoniyatlar va ishga tushish holati alohida e’lon qilinadi.
        </p>
      </section>
      <ContactBand />
    </>
  );
}
export function ProjectDetail() {
  const { slug } = useParams(),
    { projects } = useContent();
  const project = projects.find((p) => p.slug === slug);
  useEffect(() => {
    if (project) {
      document.title = project.seoTitle || `${project.name} — AlifBit`;
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", project.seoDescription || project.summary);
    }
  }, [project]);
  if (!project) return <NotFound />;
  return (
    <>
      <div className="container detail-top">
        <Breadcrumb name={project.name} />
        <div className="detail-heading">
          <div>
            <Eyebrow>{project.category}</Eyebrow>
            <h1>
              {project.name}
              <span className="gold-dot">.</span>
            </h1>
            <p>{project.summary}</p>
          </div>
          <Status value={project.status} />
        </div>
        <div className="detail-art">
          {project.cover.startsWith("/media/") ? (
            <img src={project.cover} alt={`${project.name} muqovasi`} />
          ) : (
            <ProjectArt kind={project.cover} large />
          )}
        </div>
        {!project.cover.startsWith("/media/") && (
          <p className="visual-note">
            Vizual konsepsiya. Yakuniy mahsulot ko‘rinishi va imkoniyatlari farq
            qilishi mumkin.
          </p>
        )}
      </div>
      <section className="container project-story section-space">
        <aside>
          <Eyebrow>LOYIHA HAQIDA</Eyebrow>
          <dl>
            <dt>Yo‘nalish</dt>
            <dd>{project.category}</dd>
            <dt>Platforma</dt>
            <dd>{project.platforms.join(" · ")}</dd>
            <dt>Holati</dt>
            <dd>{project.status}</dd>
          </dl>
          {project.url ? (
            <a
              className="button"
              href={project.url}
              target="_blank"
              rel="noreferrer"
            >
              Loyihani ochish
              <Arrow />
            </a>
          ) : (
            <Link
              className="button button-outline"
              to={`/contact?project=${encodeURIComponent(project.name)}`}
            >
              Loyiha haqida so‘rash
              <Arrow />
            </Link>
          )}
        </aside>
        <div>
          <h2>
            Foydali g‘oyaga
            <br />
            <span>raqamli shakl.</span>
          </h2>
          <p className="lead">{project.description}</p>
          <h3>Nima uchun yaratilmoqda?</h3>
          <p>{project.purpose}</p>
          <h3>Asosiy yo‘nalishlar</h3>
          <ul className="feature-list">
            {project.features.map((f) => (
              <li key={f}>
                <Check size={18} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="container related-section">
        <div className="section-heading">
          <h2>
            Boshqa <span>g‘oyalarimiz.</span>
          </h2>
          <TextLink to="/projects">Barcha loyihalar</TextLink>
        </div>
        <div className="projects-grid">
          {projects
            .filter((p) => p.id !== project.id)
            .slice(0, 2)
            .map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
        </div>
      </section>
      <ContactBand />
    </>
  );
}
export function Services() {
  return (
    <>
      <PageTop
        name="Xizmatlar"
        eyebrow="G‘OYANGIZGA MOS YECHIM"
        title={
          <>
            Birgalikda o‘ylaymiz.
            <br />
            <span>Puxta yaratamiz.</span>
          </>
        }
        text="Dasturiy yechimlardan ijodiy mahsulotlargacha. Muammoni tushunishdan boshlaymiz, foydali natijaga qadar yoningizda bo‘lamiz."
      />
      <section className="container">
        <ServiceRows />
      </section>
      <WorkingProcess />
      <FAQ />
      <ContactBand />
    </>
  );
}
export function WorkingProcess() {
  return (
    <section className="container section-space">
      <div className="section-heading">
        <div>
          <Eyebrow>QANDAY ISHLAYMIZ</Eyebrow>
          <h2>
            Aniq jarayon.
            <br />
            <span>Ishonchli hamkorlik.</span>
          </h2>
        </div>
      </div>
      <div className="working-grid">
        {[
          [
            "01",
            "Tinglaymiz",
            "G‘oyangiz, ehtiyojingiz va kutilgan natijani birgalikda aniqlaymiz.",
          ],
          [
            "02",
            "Rejalashtiramiz",
            "Vazifa, yechim, muddat va byudjetni oldindan kelishib olamiz.",
          ],
          [
            "03",
            "Yaratamiz",
            "Dizayn va ishlab chiqish jarayonida siz bilan aloqada bo‘lamiz.",
          ],
          [
            "04",
            "Ishga tushiramiz",
            "Tekshiramiz, topshiramiz va foydalanish bo‘yicha yo‘l ko‘rsatamiz.",
          ],
        ].map(([n, t, d]) => (
          <div key={n}>
            <span>{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export function ServiceDetail() {
  const { slug } = useParams(),
    { services } = useContent();
  const service = services.find((s) => s.slug === slug);
  if (!service) return <NotFound />;
  return (
    <>
      <PageTop
        name={service.name}
        eyebrow={`YO‘NALISH ${service.number}`}
        title={
          <>
            {service.name}
            <span className="gold-dot">.</span>
          </>
        }
        text={service.description}
      />
      <section className="container service-detail-grid">
        <div>
          <h2>{service.short}</h2>
          <ul className="feature-list">
            {service.features.map((f) => (
              <li key={f}>
                <Check size={18} />
                {f}
              </li>
            ))}
          </ul>
          <Link className="button" to={`/contact?service=${slug}`}>
            Shu yo‘nalishda suhbatlashamiz
            <Arrow />
          </Link>
        </div>
        <ProjectArt
          kind={
            slug === "development"
              ? "dalolat"
              : slug === "products"
                ? "voice"
                : slug || "custom"
          }
        />
      </section>
      <WorkingProcess />
      <FAQ />
      <ContactBand />
    </>
  );
}
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    [
      "Loyiha narxi qanday aniqlanadi?",
      "Narx vazifaning hajmi, murakkabligi va muddatiga bog‘liq. G‘oyangizni yuboring — talablarni aniqlashtirib, individual taklif tayyorlaymiz.",
    ],
    [
      "Faqat tayyor texnik topshiriq bilan ishlaysizmi?",
      "Yo‘q. G‘oyangiz hali dastlabki bosqichda bo‘lsa ham suhbatni boshlashimiz mumkin. Talab va ustuvorliklarni birgalikda aniqlaymiz.",
    ],
    [
      "Loyihaning bajarilish muddati qancha?",
      "Har bir loyiha uchun muddat alohida belgilanadi. Ish boshlashdan oldin bosqichlar va topshirish sanalarini kelishib olamiz.",
    ],
    [
      "Academy kurslari va Library kitoblari qayerda?",
      "Hozir bu yo‘nalishlar taqdimot shaklida ko‘rsatilmoqda. Tasdiqlangan materiallar va rasmiy platforma havolalari tayyor bo‘lgach e’lon qilinadi.",
    ],
  ];
  return (
    <section className="container faq section-space">
      <div>
        <Eyebrow>SAVOLLARGA JAVOBLAR</Eyebrow>
        <h2>
          Suhbatdan
          <br />
          <span>oldin.</span>
        </h2>
      </div>
      <div>
        {items.map(([q, a], i) => (
          <div className="faq-item" key={q}>
            <h3>
              <button
                aria-expanded={open === i}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {q}
                {open === i ? <Minus size={18} /> : <Plus size={18} />}
              </button>
            </h3>
            <div id={`faq-${i}`} hidden={open !== i}>
              <p>{a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export function About() {
  return (
    <>
      <PageTop
        name="Biz haqimizda"
        eyebrow="ALIFBIT FALSAFASI"
        title={
          <>
            Ilm — ildizimiz.
            <br />
            Texnologiya — vositamiz.
            <br />
            <span>Foyda — maqsadimiz.</span>
          </>
        }
        text="Biz turli yo‘nalishlarni bitta g‘oya atrofida birlashtiramiz: insonlarga kerak bo‘ladigan narsalarni yaratish."
      />
      <section className="about-visual">
        <div className="container">
          <BrandMark />
          <span>
            Ilmdan g‘oyaga.
            <br />
            <em>G‘oyadan amalga.</em>
          </span>
          <small>ALIFBIT / ASOSIY QADRIYAT</small>
        </div>
      </section>
      <section className="container about-story section-space">
        <Eyebrow>BIZNING BOSHLANISHIMIZ</Eyebrow>
        <div>
          <h2>
            Yaxshi savollardan
            <br />
            <span>yaxshi ishlar tug‘iladi.</span>
          </h2>
          <p className="lead">
            «Buni yanada foydaliroq qilish mumkinmi?» — AlifBit yondashuvi shu
            savoldan boshlanadi.
          </p>
          <p>
            Biz uchun texnologiya alohida bir maqsad emas. U bilimni yetkazish,
            jarayonni soddalashtirish va mazmunli hikoyalarni aytib berish uchun
            imkoniyatdir.
          </p>
          <p>
            Shuning uchun AlifBit dasturlash bilan cheklanmaydi. Raqamli
            mahsulotlar, ta’lim, kitoblar, tarixiy filmlar va vizual ijod bir
            ekotizimda uchrashadi. Har bir yo‘nalish boshqasiga yangi fikr va
            yangi imkoniyat olib keladi.
          </p>
        </div>
      </section>
      <section className="values-section">
        <div className="container">
          <Eyebrow>BIZ TAYANADIGAN QADRIYATLAR</Eyebrow>
          <div className="values-grid">
            {[
              [
                "01",
                "Ilm",
                "Har bir ishni o‘rganishdan boshlaymiz. Tushunish — puxta yechimning asosi.",
              ],
              [
                "02",
                "Texnologiya",
                "Murakkablikni foydalanuvchi uchun soddalashtiramiz. Vosita emas, natija muhim.",
              ],
              [
                "03",
                "Ijod",
                "Tayyor qolipdan tashqariga qaraymiz. Har bir g‘oyaning o‘z ifodasi bor.",
              ],
              [
                "04",
                "Foyda",
                "Chiroyli mahsulotning qadrini uning inson hayotiga bergan foydasi belgilaydi.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <small>{n}</small>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WorkingProcess />
      <ContactBand />
    </>
  );
}
export function Contact() {
  const { services } = useContent(),
    [params] = useSearchParams();
  const [sending, setSending] = useState(false),
    [error, setError] = useState(""),
    [reference, setReference] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setError("");
    try {
      const data = new FormData(form),
        file = data.get("attachment") as File;
      if (file?.size > 5 * 1024 * 1024)
        throw new Error("Fayl 5 MB dan kichik bo‘lishi kerak.");
      const result = await api<{ reference: string }>("/api/orders", {
        method: "POST",
        body: data,
      });
      setReference(result.reference);
      form.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Murojaat yuborilmadi.");
    } finally {
      setSending(false);
    }
  }
  return (
    <>
      <PageTop
        name="Bog‘lanish"
        eyebrow="BIRINCHI QADAM — SUHBAT"
        title={
          <>
            G‘oyangizni
            <br />
            <span>eshitishga tayyormiz.</span>
          </>
        }
        text="Batafsil rejangiz bormi yoki shunchaki bir fikrmi? Yozing. Birgalikda keyingi qadamni topamiz."
      />
      <section className="container contact-layout">
        <aside className="contact-aside">
          <div>
            <small>BEVOSITA ALOQA</small>
            <a href="https://t.me/id799" target="_blank" rel="noreferrer">
              Telegram · @id799
              <Arrow />
            </a>
            <p>
              Qisqa savol yoki dastlabki suhbat uchun Telegram’da yozishingiz
              mumkin.
            </p>
          </div>
          <div>
            <small>QANDAY DAVOM ETAMIZ?</small>
            <ol>
              <li>Murojaatingiz bilan tanishamiz.</li>
              <li>Tafsilotlarni birgalikda aniqlaymiz.</li>
              <li>Yechim va keyingi qadamlarni kelishamiz.</li>
            </ol>
          </div>
          <BrandMark />
        </aside>
        <div className="contact-form-wrap">
          {reference ? (
            <div className="success-state" role="status">
              <span>
                <Check size={32} />
              </span>
              <Eyebrow>SUHBATIMIZ BOSHLANDI</Eyebrow>
              <h2>
                Murojaatingiz
                <br />
                <em>qabul qilindi.</em>
              </h2>
              <p>
                Ma’lumotlaringiz saqlandi. Siz ko‘rsatgan aloqa manzili orqali
                bog‘lanamiz.
              </p>
              <p className="reference">
                Murojaat raqami: <strong>{reference}</strong>
              </p>
              <button
                className="button button-outline"
                onClick={() => setReference("")}
              >
                Yangi murojaat
                <Arrow />
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit}>
              <div className="form-heading">
                <h2>Loyihangiz haqida</h2>
                <span>01 / TANISHUV</span>
              </div>
              <div className="form-grid">
                <label>
                  Ismingiz <span>*</span>
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="Sizga qanday murojaat qilaylik?"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </label>
                <label>
                  Email yoki Telegram <span>*</span>
                  <input
                    name="contact"
                    autoComplete="email"
                    placeholder="email@manzil.uz yoki @username"
                    required
                    minLength={4}
                    maxLength={150}
                  />
                </label>
              </div>
              <label>
                Qaysi yo‘nalish? <span>*</span>
                <select
                  name="service"
                  required
                  defaultValue={params.get("service") || ""}
                >
                  <option value="" disabled>
                    Yo‘nalishni tanlang
                  </option>
                  {services.map((s) => (
                    <option value={s.slug} key={s.slug}>
                      {s.name}
                    </option>
                  ))}
                  <option value="other">Birgalikda aniqlaymiz</option>
                </select>
              </label>
              <label>
                G‘oyangiz haqida <span>*</span>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Nima yaratmoqchisiz? Kimlar uchun va qanday muammoni hal qiladi?"
                  required
                  minLength={20}
                  maxLength={6000}
                  defaultValue={
                    params.get("project")
                      ? `${params.get("project")} loyihasi haqida batafsil ma’lumot olmoqchiman.`
                      : ""
                  }
                />
              </label>
              <div className="form-grid">
                <label>
                  Taxminiy byudjet <small>ixtiyoriy</small>
                  <select name="budget" defaultValue="">
                    <option value="">Hali aniqlanmagan</option>
                    <option>5 mln so‘mgacha</option>
                    <option>5–15 mln so‘m</option>
                    <option>15–50 mln so‘m</option>
                    <option>50 mln so‘mdan yuqori</option>
                  </select>
                </label>
                <label>
                  Istalgan muddat <small>ixtiyoriy</small>
                  <input
                    name="deadline"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </label>
              </div>
              <label className="file-field">
                <span>
                  <Paperclip size={17} /> Qo‘shimcha fayl biriktirish
                </span>
                <small>PDF, PNG, JPG, WEBP · 5 MB gacha</small>
                <input
                  type="file"
                  name="attachment"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                />
              </label>
              <label className="honeypot" aria-hidden="true">
                Veb-saytingiz
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="consent" value="yes" required />
                <span>
                  <Link to="/privacy" target="_blank">
                    Maxfiylik siyosati
                  </Link>{" "}
                  bilan tanishdim va murojaatimni ko‘rib chiqish uchun
                  ma’lumotlarimni qayta ishlashga roziman.
                </span>
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="form-submit">
                <span>
                  Yaxshi hamkorlik
                  <br />
                  shu yerdan boshlanadi.
                </span>
                <button className="button" disabled={sending} type="submit">
                  {sending ? "Yuborilmoqda…" : "Murojaatni yuborish"}
                  {sending ? (
                    <LoaderCircle className="spin" size={18} />
                  ) : (
                    <Send size={17} />
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
export function Privacy() {
  return (
    <>
      <PageTop
        name="Maxfiylik siyosati"
        eyebrow="OCHIQ VA TUSHUNARLI"
        title={
          <>
            Ma’lumotlaringizga
            <br />
            <span>mas’uliyat bilan.</span>
          </>
        }
      />
      <article className="container prose privacy">
        <p>
          Ushbu siyosat AlifBit.org saytidagi buyurtma va murojaat shakllariga
          taalluqli.
        </p>
        <h2>Nimalarni yig‘amiz?</h2>
        <p>
          Ismingiz, aloqa manzilingiz, tanlagan xizmat, loyiha tavsifi va
          ixtiyoriy kiritgan byudjet, muddat hamda fayllar saqlanadi. Spamdan
          himoyalanish uchun IP manzilning maxfiy kalit bilan xeshlangan
          ko‘rinishi vaqtincha ishlatiladi; IP manzilning o‘zi bazaga
          yozilmaydi.
        </p>
        <h2>Nima uchun ishlatamiz?</h2>
        <p>
          Murojaatingizni ko‘rib chiqish, siz bilan bog‘lanish va taklif
          tayyorlash uchun. Ma’lumotlaringiz sotilmaydi va reklama ro‘yxatlariga
          avtomatik qo‘shilmaydi.
        </p>
        <h2>Saqlash va kirish</h2>
        <p>
          Murojaatlar va fayllarga faqat vakolatli administrator kiradi.
          Murojaat faol ishlovda bo‘lmasa, u yakunlangan yoki oxirgi
          o‘zgartirilgan sanadan boshlab 12 oy ichida o‘chiriladi. Shartnoma
          yoki qonun bo‘yicha saqlash zarur bo‘lgan ma’lumotlar bundan mustasno.
          O‘chirish va saqlash nazorati administrator tomonidan bajariladi.
        </p>
        <h2>Bildirishnomalar</h2>
        <p>
          Bildirishnoma xizmati sozlangan bo‘lsa, administratorning yopiq
          Telegram chatiga faqat yangi murojaat raqami yuboriladi. To‘liq
          murojaat va biriktirilgan fayl ochiq chatlarga yuborilmaydi.
        </p>
        <h2>Cookie va mahalliy saqlash</h2>
        <p>
          Administratorga kirish uchun xavfsiz sessiya cookie ishlatiladi. Oddiy
          tashrifchining brauzerida kirish animatsiyasini takrorlamaslik uchun
          kichik belgi saqlanadi. Saytda reklama kuzatuvchilari o‘rnatilmagan.
        </p>
        <h2>Ma’lumotni o‘chirish</h2>
        <p>
          Murojaat raqamingizni ko‘rsatib{" "}
          <a href="https://t.me/id799" target="_blank" rel="noreferrer">
            @id799
          </a>{" "}
          orqali ma’lumotingizni ko‘rish, tuzatish yoki o‘chirishni so‘rashingiz
          mumkin.
        </p>
      </article>
    </>
  );
}
type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  published: boolean;
  updated_at?: string;
};
export function Journal() {
  const [items, setItems] = useState<Article[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    api<Article[]>("/api/articles")
      .then(setItems)
      .catch(() =>
        setError("Qaydlarni yuklab bo‘lmadi. Keyinroq urinib ko‘ring."),
      );
  }, []);
  return (
    <>
      <PageTop
        name="Qaydlar"
        eyebrow="FIKRLAR VA IZLANISHLAR"
        title={
          <>
            Ishlar ortidagi
            <br />
            <span>fikrlar.</span>
          </>
        }
        text="Texnologiya, ilm va ijod haqida. O‘rganayotganlarimiz va yo‘l davomida topganlarimiz."
      />
      <section className="container journal-list">
        {error ? (
          <p role="alert">{error}</p>
        ) : items.length ? (
          items.map((a) => (
            <Link className="journal-item" to={`/journal/${a.slug}`} key={a.id}>
              <small>{a.category}</small>
              <h2>{a.title}</h2>
              <p>{a.summary}</p>
              <Arrow />
            </Link>
          ))
        ) : (
          <div className="empty-state">
            <BookOpen strokeWidth={1} />
            <h2>Yangi fikrlar uchun ochiq sahifa.</h2>
            <p>Birinchi qaydlar tayyor bo‘lgach shu yerda e’lon qilinadi.</p>
            <TextLink to="/about">Hozircha biz bilan tanishing</TextLink>
          </div>
        )}
      </section>
      <ContactBand />
    </>
  );
}
export function JournalDetail() {
  const { slug } = useParams(),
    [article, setArticle] = useState<Article | null>(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api<Article[]>(`/api/articles`)
      .then((list) => setArticle(list.find((a) => a.slug === slug) || null))
      .finally(() => setLoading(false))
      .catch(() => {});
  }, [slug]);
  if (loading) return <div className="loading-page">Yuklanmoqda…</div>;
  if (!article) return <NotFound />;
  return (
    <>
      <PageTop
        name={article.title}
        eyebrow={article.category}
        title={article.title}
        text={article.summary}
      />
      <article className="container prose article-body">
        {article.body.split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
      <ContactBand />
    </>
  );
}
export function NotFound() {
  return (
    <section className="container not-found">
      <Eyebrow>404 / SAHIFA TOPILMADI</Eyebrow>
      <h1>
        Bu yo‘l hali
        <br />
        <span>ochilmagan.</span>
      </h1>
      <p>Havola o‘zgargan yoki sahifa hali yaratilmagan bo‘lishi mumkin.</p>
      <Link className="button" to="/">
        Bosh sahifaga qaytish
        <Arrow />
      </Link>
    </section>
  );
}
