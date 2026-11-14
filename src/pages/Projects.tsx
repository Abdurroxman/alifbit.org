import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Check, Shapes } from "lucide-react";
import { useContent } from "../App";
import { ProjectCard, ProjectCover, Status } from "../components/Projects";
import { Breadcrumb, ButtonLink, ContactBand, Eyebrow, Lines, PageTop, TextLink, delay } from "../components/ui";
import NotFound from "./NotFound";
import { SADO_URL } from "../../shared/content";

export function Projects() {
  const { projects, categories, error, refresh } = useContent();
  const [params, setParams] = useSearchParams();
  const filter = params.get("category") || "Barchasi";
  const list = projects.filter((p) => filter === "Barchasi" || p.category === filter);
  return (
    <>
      <PageTop
        name="Loyihalar"
        eyebrow="Biz yaratayotgan dunyo"
        title={[
          "Har bir loyiha —",
          <span className="accent" key="a">
            bir foydali g‘oya.
          </span>,
        ]}
        text="Dasturlar, bilim manbalari va ijodiy izlanishlar. AlifBit ekotizimini tashkil etadigan loyihalar bilan tanishing."
      />
      <section className="container catalog">
        {error && (
          <div className="notice" role="status">
            {error}
            <button onClick={refresh}>Qayta yuklash</button>
          </div>
        )}
        <div className="catalog-bar" data-reveal="fade">
          <div className="chips" role="group" aria-label="Loyiha yo‘nalishlari">
            {categories.map((c) => (
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
            {list.length} ta loyiha
          </span>
        </div>
        {list.length ? (
          <div className="projects-grid catalog-grid" key={filter}>
            {list.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} delay={(i % 2) * 110} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Shapes strokeWidth={1} />
            <h2>Bu yo‘nalishda yangi g‘oyalar uchun joy bor.</h2>
            <p>Hozircha bu kategoriyada e’lon qilingan loyiha yo‘q.</p>
            <button className="button button-outline" onClick={() => setParams({})}>
              Barcha loyihalarni ko‘rish
            </button>
          </div>
        )}
        <p className="catalog-note">
          «Taqdimot» belgisi loyiha konsepsiyasini bildiradi. Rasmiy imkoniyatlar va ishga tushish holati
          alohida e’lon qilinadi.
        </p>
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
  const uploaded = project.cover.startsWith("/media/");
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
        {!uploaded && (
          <p className="visual-note">
            Vizual konsepsiya. Yakuniy mahsulot ko‘rinishi va imkoniyatlari farq qilishi mumkin.
          </p>
        )}
      </div>
      <section className="container detail-body section">
        <aside className="detail-aside">
          <div className="detail-aside-inner" data-reveal>
            <Eyebrow>Loyiha haqida</Eyebrow>
            <dl>
              <div>
                <dt>Yo‘nalish</dt>
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
            {project.slug === "ovozdan-matnga" && (
              <ButtonLink to={SADO_URL} magnetic>
                Sado bilan tanishing
              </ButtonLink>
            )}
            {project.url ? (
              <ButtonLink to={project.url} external>
                Loyihani ochish
              </ButtonLink>
            ) : (
              <ButtonLink to={`/contact?project=${encodeURIComponent(project.name)}`} variant="outline">
                Loyiha haqida so‘rash
              </ButtonLink>
            )}
          </div>
        </aside>
        <div className="detail-story">
          <Lines>
            {[
              "Foydali g‘oyaga",
              <span className="accent" key="a">
                raqamli shakl.
              </span>,
            ]}
          </Lines>
          <p className="lead" data-reveal>
            {project.description}
          </p>
          <div data-reveal>
            <h3>Nima uchun yaratilmoqda?</h3>
            <p>{project.purpose}</p>
          </div>
          <div data-reveal>
            <h3>Asosiy yo‘nalishlar</h3>
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
        <section className="container related section">
          <div className="section-head">
            <Lines>
              {[
                <>
                  Boshqa <span className="accent">g‘oyalarimiz.</span>
                </>,
              ]}
            </Lines>
            <div className="section-aside">
              <TextLink to="/projects">Barcha loyihalar</TextLink>
            </div>
          </div>
          <div className="projects-grid">
            {related.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} delay={i * 110} />
            ))}
          </div>
        </section>
      )}
      <ContactBand />
    </>
  );
}
