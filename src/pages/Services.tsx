import { useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { Check, Minus, Plus } from "lucide-react";
import { useContent } from "../App";
import ProjectArt from "../components/ProjectArt";
import { ButtonLink, ContactBand, Eyebrow, Lines, PageTop } from "../components/ui";
import { ServiceGrid } from "./Home";
import NotFound from "./NotFound";

const WORK = [
  ["01", "Tinglaymiz", "G‘oyangiz, ehtiyojingiz va kutilgan natijani birgalikda aniqlaymiz."],
  ["02", "Rejalashtiramiz", "Vazifa, yechim, muddat va byudjetni oldindan kelishib olamiz."],
  ["03", "Yaratamiz", "Dizayn va ishlab chiqish jarayonida siz bilan aloqada bo‘lamiz."],
  ["04", "Ishga tushiramiz", "Tekshiramiz, topshiramiz va foydalanish bo‘yicha yo‘l ko‘rsatamiz."],
];

export function WorkingProcess() {
  return (
    <section className="container section working">
      <div className="section-head">
        <div>
          <div data-reveal="fade">
            <Eyebrow>Qanday ishlaymiz</Eyebrow>
          </div>
          <Lines>
            {[
              "Aniq jarayon.",
              <span className="accent" key="a">
                Ishonchli hamkorlik.
              </span>,
            ]}
          </Lines>
        </div>
      </div>
      <ol className="working-grid">
        {WORK.map(([n, t, d], i) => (
          <li key={n} data-reveal style={{ "--d": i * 100 } as CSSProperties}>
            <span>{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const FAQ_ITEMS = [
  ["Loyiha narxi qanday aniqlanadi?", "Narx vazifaning hajmi, murakkabligi va muddatiga bog‘liq. G‘oyangizni yuboring — talablarni aniqlashtirib, individual taklif tayyorlaymiz."],
  ["Faqat tayyor texnik topshiriq bilan ishlaysizmi?", "Yo‘q. G‘oyangiz hali dastlabki bosqichda bo‘lsa ham suhbatni boshlashimiz mumkin. Talab va ustuvorliklarni birgalikda aniqlaymiz."],
  ["Loyihaning bajarilish muddati qancha?", "Har bir loyiha uchun muddat alohida belgilanadi. Ish boshlashdan oldin bosqichlar va topshirish sanalarini kelishib olamiz."],
  ["Academy kurslari va Library kitoblari qayerda?", "Hozir bu yo‘nalishlar taqdimot shaklida ko‘rsatilmoqda. Tasdiqlangan materiallar va rasmiy platforma havolalari tayyor bo‘lgach e’lon qilinadi."],
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="container section faq">
      <div>
        <div data-reveal="fade">
          <Eyebrow>Savollarga javoblar</Eyebrow>
        </div>
        <Lines>
          {[
            "Suhbatdan",
            <span className="accent" key="a">
              oldin.
            </span>,
          ]}
        </Lines>
      </div>
      <div className="faq-list">
        {FAQ_ITEMS.map(([q, a], i) => (
          <div className={`faq-item ${open === i ? "is-open" : ""}`} key={q} data-reveal style={{ "--d": i * 70 } as CSSProperties}>
            <h3>
              <button aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                {q}
                <span aria-hidden="true">{open === i ? <Minus size={18} /> : <Plus size={18} />}</span>
              </button>
            </h3>
            <div id={`faq-${i}`} className="faq-answer" role="region" hidden={open !== i}>
              <p>{a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Services() {
  return (
    <>
      <PageTop
        name="Xizmatlar"
        eyebrow="G‘oyangizga mos yechim"
        title={[
          "Birgalikda o‘ylaymiz.",
          <span className="accent" key="a">
            Puxta yaratamiz.
          </span>,
        ]}
        text="Dasturiy yechimlardan ijodiy mahsulotlargacha. Muammoni tushunishdan boshlaymiz, foydali natijaga qadar yoningizda bo‘lamiz."
      />
      <section className="container">
        <ServiceGrid revealDirs={["left", "up", "right"]} />
      </section>
      <WorkingProcess />
      <FAQ />
      <ContactBand />
    </>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  const { services } = useContent();
  const service = services.find((s) => s.slug === slug);
  if (!service) return <NotFound />;
  const art =
    slug === "development" ? "dalolat" : slug === "products" ? "voice" : slug || "custom";
  return (
    <>
      <PageTop
        name={service.name}
        eyebrow={`Yo‘nalish ${service.number}`}
        title={[
          <>
            {service.name}
            <span className="dot">.</span>
          </>,
        ]}
        text={service.description}
      />
      <section className="container service-detail">
        <div className="service-detail-copy" data-reveal>
          <h2>{service.short}</h2>
          <ul className="check-list">
            {service.features.map((f) => (
              <li key={f}>
                <Check size={18} />
                {f}
              </li>
            ))}
          </ul>
          <ButtonLink to={`/contact?service=${slug}`} magnetic>
            Shu yo‘nalishda suhbatlashamiz
          </ButtonLink>
        </div>
        <div className="service-detail-art" data-reveal="clip">
          <ProjectArt kind={art} large />
        </div>
      </section>
      <WorkingProcess />
      <FAQ />
      <ContactBand />
    </>
  );
}
