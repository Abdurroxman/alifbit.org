import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { useContent } from "../App";
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
          "Ishlayotgan mahsulotlar —",
          <span className="accent" key="a">
            ochib ko‘ring.
          </span>,
        ]}
        text="Telegram ilovalar, dasturlar va saytlar."
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

export function ProjectDetail() {
  const { slug } = useParams();
  const { projects } = useContent();
  const project = projects.find((p) => p.slug === slug);
  useEffect(() => {
    if (!project) return;
    document.title = project.seoTitle || `${project.name} — AlifBit`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", project.seoDescription || project.summary);
  }, [project]);
  if (!project) return <NotFound />;
  const related = projects.filter((p) => p.id !== project.id).slice(0, 2);
  const link = projectLink(project);
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
      <div className="container">
        <div className="detail-cover" data-reveal="clip">
          <ProjectCover project={project} large />
        </div>
      </div>
      <section className="container detail-body section">
        <aside className="detail-aside">
          <div className="detail-aside-inner" data-reveal>
            <Eyebrow>Ish haqida</Eyebrow>
            <dl>
              <div>
                <dt>Turi</dt>
                <dd>{project.category}</dd>
              </div>
              <div>
                <dt>Platforma</dt>
                <dd>{project.platforms.join(" · ")}</dd>
              </div>
              <div>
                <dt>Holati</dt>
                <dd>{project.status}</dd>
              </div>
            </dl>
            {link && (
              <ButtonLink to={link} external magnetic>
                Ochish
              </ButtonLink>
            )}
            <ButtonLink to="/contact" variant="outline">
              Shunga o‘xshash buyurtma berish
            </ButtonLink>
          </div>
        </aside>
        <div className="detail-story">
          <p className="lead" data-reveal>
            {project.description}
          </p>
          <div data-reveal>
            <h3>Maqsadi</h3>
            <p>{project.purpose}</p>
          </div>
          <div data-reveal>
            <h3>Imkoniyatlari</h3>
            <ul className="check-list">
              {project.features.map((f) => (
                <li key={f}>
                  <Check size={18} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="container related section hairline">
          <div className="section-head">
            <Lines>{["Boshqa ishlarimiz."]}</Lines>
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
