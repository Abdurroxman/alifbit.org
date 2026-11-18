import { useEffect, useState, type CSSProperties } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { useContent } from "../App";
import DemoChat from "../components/DemoChat";
import type { FaqItem } from "../../shared/content";
import { ProjectCover, Status } from "../components/Projects";
import { projectLink, WorkGrid } from "../components/Studio";
import { Breadcrumb, ButtonLink, ContactBand, Eyebrow, Lines, PageTop, TextLink, delay } from "../components/ui";
import NotFound from "./NotFound";

export function Projects() {
  const { projects, categories, error, refresh } = useContent();
  const [params, setParams] = useSearchParams();
  // Filtrda faqat ichida ish bor kategoriyalar ko'rinadi.
  const used = categories.filter((c) => c === "Barchasi" || projects.some((p) => p.category === c));
  const requested = params.get("category") || "Barchasi";
  const filter = used.includes(requested) ? requested : "Barchasi";
  const list = projects.filter((p) => filter === "Barchasi" || p.category === filter);
  return (
    <>
      <PageTop
        name="Ishlar"
        eyebrow="Qilgan ishlarimiz"
        title={[
          "Ishlar va yechimlar —",
          <span className="accent" key="a">
            sinab ko‘ring.
          </span>,
        ]}
        text="Telegram botlar, AI yordamchilar, saytlar va dasturlar. Har bir yechimning qanday ishlashini sahifasidagi demoda bosib ko‘rasiz."
      />
      <section className="container catalog">
        {error && (
          <div className="notice" role="status">
            {error}
            <button onClick={refresh}>Qayta yuklash</button>
          </div>
        )}
        {used.length > 2 && (
          <div className="catalog-bar" data-reveal="fade">
            <div className="chips" role="group" aria-label="Ish turlari">
              {used.map((c) => (
                <button
                  key={c}
                  className="chip"
                  aria-pressed={filter === c}
                  onClick={() => setParams(c === "Barchasi" ? {} : { category: c }, { preventScrollReset: true })}
                >
                  {c}
                </button>
              ))}
            </div>
            <span className="catalog-count" aria-live="polite">
              {list.length} ta ish
            </span>
          </div>
        )}
        <WorkGrid key={filter} projects={list} />
      </section>
      <ContactBand />
    </>
  );
}

/** Loyiha sahifasidagi savol-javob: xizmatlar sahifasidagi bilan bir xil ko'rinish. */
function ProjectFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="container section faq hairline">
      <div>
        <div data-reveal="fade">
          <Eyebrow>Savol-javob</Eyebrow>
        </div>
        <Lines>{["Ko‘p so‘raladi."]}</Lines>
      </div>
      <div className="faq-list">
        {items.map(({ q, a }, i) => (
          <div className={`faq-item ${open === i ? "is-open" : ""}`} key={q} data-reveal style={delay(i * 70)}>
            <h3>
              <button aria-expanded={open === i} aria-controls={`pfaq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                {q}
                <span aria-hidden="true">{open === i ? <Minus size={18} /> : <Plus size={18} />}</span>
              </button>
            </h3>
            <div id={`pfaq-${i}`} className="faq-answer" role="region" hidden={open !== i}>
              <p>{a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="section-head">
      <div>
        <div data-reveal="fade">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <Lines>{[title]}</Lines>
      </div>
      {text && (
        <p data-reveal style={delay(150)}>
          {text}
        </p>
      )}
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((v) => (
        <li key={v}>
          <Check size={18} />
          {v}
        </li>
      ))}
    </ul>
  );
}

export function ProjectDetail() {
  const { slug } = useParams();
  const { projects, services, loaded, error } = useContent();
  const project = projects.find((p) => p.slug === slug);
  useEffect(() => {
    if (!project) return;
    document.title = project.seoTitle || `${project.name} — AlifBit`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", project.seoDescription || project.summary);
  }, [project]);
  // «Demo» tugmasidan kelganda: Layout sahifani tepaga qaytargandan keyin demoga suriladi.
  const { hash } = useLocation();
  const hasDemo = !!project?.demo;
  useEffect(() => {
    if (hash !== "#demo" || !hasDemo) return;
    const t = window.setTimeout(() => document.getElementById("demo")?.scrollIntoView({ block: "start" }), 80);
    return () => window.clearTimeout(t);
  }, [hash, hasDemo, slug]);
  // Bazadagi loyiha boshlang'ich ro'yxatda yo'q: API javobini kutamiz, aks holda 404 miltillaydi.
  if (!project) return loaded || error ? <NotFound /> : <div className="loading-page">Yuklanmoqda…</div>;
  const related = projects
    .filter((p) => p.id !== project.id)
    .sort((a, b) => Number(b.category === project.category) - Number(a.category === project.category))
    .slice(0, 2);
  const link = projectLink(project);
  const service = services.find((s) => s.slug === project.service);
  const order = `/contact?${new URLSearchParams({
    ...(service ? { service: service.slug } : {}),
    project: project.name,
  })}`;
  const steps = project.steps || [];
  const customerView = project.customerView || [];
  const ownerView = project.ownerView || [];
  const beforeAfter = project.beforeAfter || [];
  const fit = project.fit || [];
  const faq = project.faq || [];
  const views: Array<[string, string[]]> = [
    ["Mijoz ko‘radi", customerView],
    ["Siz ko‘rasiz", ownerView],
  ];
  return (
    <>
      <section className="container detail-top">
        <Breadcrumb name={project.name} />
        <div className="detail-heading">
          <div>
            <div data-reveal="fade">
              <Eyebrow>{project.category}</Eyebrow>
            </div>
            <Lines as="h1">
              {[
                <>
                  {project.name}
                  <span className="dot">.</span>
                </>,
              ]}
            </Lines>
          </div>
          <div className="detail-summary" data-reveal style={delay(200)}>
            <p>{project.summary}</p>
            <Status value={project.status} />
          </div>
        </div>
      </section>
      {project.demo ? (
        <>
          {project.problem && (
            <section className="container detail-problem hairline">
              <div data-reveal="fade">
                <Eyebrow>Muammo</Eyebrow>
              </div>
              <p className="lead" data-reveal>
                {project.problem}
              </p>
            </section>
          )}
          <section className="container section hairline detail-demo" id="demo">
            <SectionHead
              eyebrow="Demo"
              title="Bosib sinab ko‘ring."
              text="Tugmalarni bosing: bot suhbati bilan birga shu paytda tizimga va sizga keladigan xabarlar ham ko‘rinadi."
            />
            <DemoChat demo={project.demo} />
          </section>
        </>
      ) : (
        <div className="container">
          <div className="detail-cover" data-reveal="clip">
            <ProjectCover project={project} large />
          </div>
        </div>
      )}
      <section className="container detail-body section">
        <aside className="detail-aside">
          <div className="detail-aside-inner" data-reveal>
            <Eyebrow>{project.demo ? "Yechim haqida" : "Ish haqida"}</Eyebrow>
            <dl>
              <div>
                <dt>Turi</dt>
                <dd>{project.category}</dd>
              </div>
              {project.platforms.length > 0 && (
                <div>
                  <dt>Platforma</dt>
                  <dd>{project.platforms.join(" · ")}</dd>
                </div>
              )}
              <div>
                <dt>Holati</dt>
                <dd>{project.status}</dd>
              </div>
              {service && (
                <div>
                  <dt>Xizmat</dt>
                  <dd>
                    <Link to={`/services/${service.slug}`}>{service.name}: narxi va paketlari</Link>
                  </dd>
                </div>
              )}
            </dl>
            {link && (
              <ButtonLink to={link} external magnetic>
                Ochish
              </ButtonLink>
            )}
            <ButtonLink to={order} variant="outline">
              Shunga o‘xshash buyurtma berish
            </ButtonLink>
          </div>
        </aside>
        <div className="detail-story">
          <p className="lead" data-reveal>
            {project.description}
          </p>
          {project.purpose && (
            <div data-reveal>
              <h3>Maqsadi</h3>
              <p>{project.purpose}</p>
            </div>
          )}
          <div data-reveal>
            <h3>Imkoniyatlari</h3>
            <CheckList items={project.features} />
          </div>
        </div>
      </section>
      {steps.length > 0 && (
        <section className="container section hairline">
          <SectionHead eyebrow="Qanday ishlaydi" title={`${steps.length} qadam.`} />
          <ol className="working-grid course-steps">
            {steps.map((s, i) => (
              <li key={s.title} data-reveal style={{ "--d": (i % 4) * 100 } as CSSProperties}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                {s.text && <p>{s.text}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}
      {(customerView.length > 0 || ownerView.length > 0) && (
        <section className="container section hairline">
          <SectionHead eyebrow="Ikki tomon" title="Kim nimani ko‘radi." />
          <div className="detail-views">
            {views
              .filter(([, list]) => list.length > 0)
              .map(([title, list]) => (
                <div key={title} className="detail-view" data-reveal>
                  <h3>{title}</h3>
                  <CheckList items={list} />
                </div>
              ))}
          </div>
        </section>
      )}
      {beforeAfter.length > 0 && (
        <section className="container section hairline">
          <SectionHead eyebrow="Oldin va keyin" title="Nima o‘zgaradi." />
          <div className="before-after" role="table" aria-label="Oldin va keyin">
            <div className="ba-row ba-head" role="row">
              <span role="columnheader">Oldin</span>
              <span role="columnheader">Keyin</span>
            </div>
            {beforeAfter.map((r, i) => (
              <div className="ba-row" role="row" key={i} data-reveal style={delay(i * 60)}>
                <span role="cell" data-label="Oldin">
                  {r.before}
                </span>
                <span role="cell" data-label="Keyin">
                  <ArrowRight size={16} aria-hidden="true" />
                  {r.after}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
      {fit.length > 0 && (
        <section className="container section hairline">
          <SectionHead eyebrow="Kimga mos" title="Kimlar ishlatadi." />
          <ul className="tags fit-tags" data-reveal>
            {fit.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}
      {faq.length > 0 && <ProjectFaq items={faq} />}
      {related.length > 0 && (
        <section className="container related section hairline">
          <div className="section-head">
            <Lines>{[project.demo ? "Boshqa yechimlar." : "Boshqa ishlarimiz."]}</Lines>
            <div className="section-aside">
              <TextLink to="/projects">Barcha ishlar</TextLink>
            </div>
          </div>
          <WorkGrid projects={related} />
        </section>
      )}
      <ContactBand />
    </>
  );
}

