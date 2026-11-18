import { useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { Check, Minus, Plus } from "lucide-react";
import { useContent } from "../App";
import { keepNumbers, ServiceCards } from "../components/Studio";
import {
  ButtonLink,
  ContactBand,
  Eyebrow,
  Lines,
  PageTop,
} from "../components/ui";
import NotFound from "./NotFound";
import type { Service, ServicePackage } from "../../shared/content";

const WORK = [
  [
    "01",
    "Tinglaymiz",
    "G‘oyangiz, ehtiyojingiz va kutilgan natijani birgalikda aniqlaymiz.",
  ],
  [
    "02",
    "Narx va muddatni kelishamiz",
    "Paket, ish tarkibi, narx va topshirish sanasini ish boshlanishidan oldin yozib olamiz.",
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
];

export function WorkingProcess() {
  return (
    <section className="container section working hairline">
      <div className="section-head">
        <div>
          <div data-reveal="fade">
            <Eyebrow>Qanday ishlaymiz</Eyebrow>
          </div>
          <Lines>
            {[
              "Aniq jarayon.",
              <span className="accent" key="a">
                Oldindan ma’lum narx.
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

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/**
 * Narx va muddat haqidagi javoblar xizmatlar ma'lumotidan yig'iladi.
 * «ask» rejimida (bosh sahifa) narxlar ro'yxati o'rniga kirish savollariga yo'naltiriladi.
 */
function faqItems(services: Service[], priceMode: "list" | "ask") {
  const priced = services.filter((s) => s.price);
  const unpriced = services.filter((s) => !s.price);
  const timed = services.filter((s) => s.term);
  const items: Array<[string, string]> = [];
  if (priceMode === "ask")
    items.push([
      "Narxlar qancha?",
      "Narx sizga nima kerakligiga bog‘liq. Sahifa boshidagi ikki savolga javob bering — mos yechim narxini darhol ko‘rasiz. Barcha paketlar va narxlar «Xizmatlar» sahifasida.",
    ]);
  else if (priced.length)
    items.push([
      "Narxlar qancha?",
      [
        priced
          .map((s) => `${s.name} — ${keepNumbers(s.price || "")}`)
          .join(", ") + ".",
        unpriced.length
          ? `${unpriced.map((s) => s.name).join(", ")} narxi vazifa hajmiga qarab kelishiladi.`
          : "",
        "Aniq narxni topshiriqni ko‘rib chiqqach aytamiz.",
      ]
        .filter(Boolean)
        .join(" "),
    ]);
  if (timed.length)
    items.push([
      "Qancha vaqtda tayyor bo‘ladi?",
      `${timed.map((s, i) => `${i ? lower(s.name) : s.name} — ${s.term}`).join(", ")}. Aniq muddatni topshiriqqa qarab, ish boshlanishidan oldin kelishamiz.`,
    ]);
  items.push(
    [
      "Narxga nimalar kiradi?",
      "Har bir paket tarkibi xizmat sahifasida yozilgan. Qo‘shimcha ish kerak bo‘lsa, narxini boshlashdan oldin kelishamiz.",
    ],
    [
      "Faqat tayyor texnik topshiriq bilan ishlaysizmi?",
      "Yo‘q. G‘oyangiz hali dastlabki bosqichda bo‘lsa ham suhbatni boshlashimiz mumkin. Talab va ustuvorliklarni birgalikda aniqlaymiz.",
    ],
  );
  return items;
}

export function FAQ({ priceMode = "list" }: { priceMode?: "list" | "ask" }) {
  const { services } = useContent();
  const [open, setOpen] = useState<number | null>(0);
  const items = faqItems(services, priceMode);
  return (
    <section className="container section faq hairline">
      <div>
        <div data-reveal="fade">
          <Eyebrow>Savol-javob</Eyebrow>
        </div>
        <Lines>
          {[
            "Buyurtmadan",
            <span className="accent" key="a">
              oldin.
            </span>,
          ]}
        </Lines>
      </div>
      <div className="faq-list">
        {items.map(([q, a], i) => (
          <div
            className={`faq-item ${open === i ? "is-open" : ""}`}
            key={q}
            data-reveal
            style={{ "--d": i * 70 } as CSSProperties}
          >
            <h3>
              <button
                aria-expanded={open === i}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {q}
                <span aria-hidden="true">
                  {open === i ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
            </h3>
            <div
              id={`faq-${i}`}
              className="faq-answer"
              role="region"
              hidden={open !== i}
            >
              <p>{a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Services() {
  const { services } = useContent();
  return (
    <>
      <PageTop
        name="Xizmatlar"
        eyebrow="Xizmatlar va narxlar"
        title={[
          "Nima kerak bo‘lsa,",
          <span className="accent" key="a">
            narxi oldindan ma’lum.
          </span>,
        ]}
        text="Sayt, dizayn, Telegram bot va ilova. Har bir xizmatda paketlar, narx va muddat ko‘rsatilgan."
      />
      <section className="container">
        <ServiceCards services={services} />
      </section>
      <WorkingProcess />
      <FAQ />
      <ContactBand />
    </>
  );
}

function orderLink(service: Service, pkg?: ServicePackage) {
  const params = new URLSearchParams({ service: service.slug });
  if (pkg) params.set("package", pkg.name);
  return `/contact?${params}`;
}

function Packages({ service }: { service: Service }) {
  const packages = service.packages || [];
  return (
    <div className="pkg-grid">
      {packages.map((p, i) => (
        <article
          key={p.name}
          className={`pkg ${p.recommended ? "is-recommended" : ""}`}
          data-reveal
          data-tilt
          style={{ "--d": i * 90 } as CSSProperties}
        >
          {p.recommended && <span className="pkg-badge">Tavsiya etiladi</span>}
          <h3>{p.name}</h3>
          <div className="pkg-price">
            <b>{p.price || "Narxi kelishiladi"}</b>
            {p.term && <small>{p.term}</small>}
          </div>
          <ul className="check-list">
            {p.features.map((f) => (
              <li key={f}>
                <Check size={18} />
                {f}
              </li>
            ))}
          </ul>
          <ButtonLink
            to={orderLink(service, p)}
            variant={p.recommended ? "primary" : "outline"}
          >
            Buyurtma berish
          </ButtonLink>
        </article>
      ))}
    </div>
  );
}

/** Paketlarni taqqoslash: qatorlar — paketlarda uchragan barcha bandlar. */
function Compare({ packages }: { packages: ServicePackage[] }) {
  const rows = [...new Set(packages.flatMap((p) => p.features))];
  return (
    <div className="compare-wrap" data-reveal>
      <table className="compare">
        <caption className="visually-hidden">Paketlarni taqqoslash</caption>
        <thead>
          <tr>
            <th scope="col">Tarkibi</th>
            {packages.map((p) => (
              <th scope="col" key={p.name}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <th scope="row">{r}</th>
              {packages.map((p) => (
                <td key={p.name}>
                  {p.features.includes(r) ? (
                    <>
                      <Check size={18} aria-hidden="true" />
                      <span className="visually-hidden">Bor</span>
                    </>
                  ) : (
                    <>
                      <Minus
                        size={16}
                        aria-hidden="true"
                        className="compare-no"
                      />
                      <span className="visually-hidden">Yo‘q</span>
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr className="compare-price">
            <th scope="row">Narxi</th>
            {packages.map((p) => (
              <td key={p.name}>{p.price || "Kelishiladi"}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  const { services, loaded } = useContent();
  const service = services.find((s) => s.slug === slug);
  if (!service) return <NotFound />;
  const packages = service.packages || [];
  return (
    <>
      <PageTop
        name={service.name}
        eyebrow={`Xizmat ${service.number}`}
        title={[
          <>
            {service.name}
            <span className="dot">.</span>
          </>,
        ]}
        text={service.description}
      >
        <div
          className="detail-quick"
          data-reveal
          style={{ "--d": 300 } as CSSProperties}
        >
          {service.price && <b>{service.price}</b>}
          {service.term && <span>{service.term}</span>}
          <ButtonLink to={orderLink(service)} magnetic>
            Buyurtma berish
          </ButtonLink>
        </div>
      </PageTop>
      {packages.length > 0 ? (
        <section className="container section hairline">
          <div className="section-head">
            <div>
              <div data-reveal="fade">
                <Eyebrow>Paketlar</Eyebrow>
              </div>
              <Lines>{["O‘zingizga mosini tanlang."]}</Lines>
            </div>
          </div>
          <Packages service={service} />
          {packages.length > 1 && <Compare packages={packages} />}
        </section>
      ) : (
        loaded && (
          <section className="container section hairline">
            <ul className="check-list" data-reveal>
              {service.features.map((f) => (
                <li key={f}>
                  <Check size={18} />
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )
      )}
      <WorkingProcess />
      <FAQ />
      <ContactBand />
    </>
  );
}
