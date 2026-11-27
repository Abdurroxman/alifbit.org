import type { CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { Check, GraduationCap } from "lucide-react";
import { useContent } from "../App";
import { courseOrderLink, CourseTeaser } from "../components/Studio";
import { Breadcrumb, ButtonLink, Chars, Eyebrow, Lines, PageTop, delay } from "../components/ui";
import NotFound from "./NotFound";
import { tr, trn } from "../lib/i18n";

export function Courses() {
  const { courses, loaded } = useContent();
  return (
    <>
      <PageTop
        name={tr("Kurslar")}
        eyebrow={tr("Kurslar")}
        title={[
          tr("O‘rganing va"),
          <span className="accent" key="a">
            {tr("o‘zingiz yasang.")}
          </span>,
        ]}
        text={tr("AI yordamida sayt va Telegram bot yasashni amalda o‘rgatamiz.")}
      />
      <section className="container section-bottom">
        {courses.length ? (
          <div className="course-list">
            {courses.map((c) => (
              <CourseTeaser key={c.id} course={c} />
            ))}
          </div>
        ) : (
          loaded && (
            <div className="empty-state">
              <GraduationCap strokeWidth={1} />
              <h2>{tr("Hozircha ochiq kurs yo‘q.")}</h2>
              <p>{tr("Yangi kurs e’lon qilinganda shu yerda chiqadi.")}</p>
            </div>
          )
        )}
      </section>
    </>
  );
}

export function CourseDetail() {
  const { slug } = useParams();
  const { courses, loaded, error } = useContent();
  const course = courses.find((c) => c.slug === slug);
  if (!course) return loaded || error ? <NotFound /> : <div className="loading-page">{tr("Yuklanmoqda…")}</div>;
  const order = courseOrderLink(course);
  const facts = [
    [tr("Narxi"), course.price],
    [tr("Format"), course.format],
    [tr("Boshlanishi"), course.start],
  ].filter(([, v]) => v);
  return (
    <>
      <section className="course-hero container">
        <Breadcrumb name={course.title} />
        <div className="course-hero-inner">
          <div data-reveal="rise">
            <Eyebrow>{tr("Kurs")}</Eyebrow>
          </div>
          <Chars text={course.title} delay={100} />
          <p className="hero-text" data-reveal="rise" style={delay(400)}>
            {course.tagline}
          </p>
          <div data-reveal="rise" style={delay(520)}>
            <ButtonLink to={order} magnetic>
              {tr("Kursga yozilish")}
            </ButtonLink>
          </div>
        </div>
        {facts.length > 0 && (
          <dl className="course-facts" data-reveal="rise" style={delay(640)}>
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
      <section className="container section hairline course-about">
        <p className="lead" data-reveal>
          {course.description}
        </p>
      </section>
      {course.steps.length > 0 && (
        <section className="container section hairline">
          <div className="section-head">
            <div>
              <div data-reveal="fade">
                <Eyebrow>{tr("Qanday o‘tadi")}</Eyebrow>
              </div>
              <Lines>{[trn(course.steps.length, "{n} qadam.")]}</Lines>
            </div>
          </div>
          <ol className="working-grid course-steps">
            {course.steps.map((s, i) => (
              <li key={s.title} data-reveal style={{ "--d": i * 100 } as CSSProperties}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                {s.text && <p>{s.text}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}
      {course.contents.length > 0 && (
        <section className="container section hairline">
          <div className="section-head">
            <div>
              <div data-reveal="fade">
                <Eyebrow>{tr("Kurs ichida")}</Eyebrow>
              </div>
              <Lines>{[tr("Nimalarni o‘rganasiz.")]}</Lines>
            </div>
          </div>
          <ul className="check-list course-contents" data-reveal>
            {course.contents.map((c) => (
              <li key={c}>
                <Check size={18} />
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="contact-band">
        <div className="container course-cta" data-reveal>
          <h2>{course.title}</h2>
          {course.price && <b>{course.price}</b>}
          <ButtonLink to={order} magnetic>
            {tr("Kursga yozilish")}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
