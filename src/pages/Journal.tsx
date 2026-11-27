import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { getArticles } from "../lib/api";
import { Arrow, ContactBand, PageTop, TextLink } from "../components/ui";
import NotFound from "./NotFound";
import { tr } from "../lib/i18n";

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
  const [items, setItems] = useState<Article[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getArticles<Article>()
      .then(setItems)
      .catch(() => setError(tr("Qaydlarni yuklab bo‘lmadi. Keyinroq urinib ko‘ring.")));
  }, []);
  return (
    <>
      <PageTop
        name={tr("Qaydlar")}
        eyebrow={tr("Fikrlar va izlanishlar")}
        title={[
          tr("Ishlar ortidagi"),
          <span className="accent" key="a">
            {tr("fikrlar.")}
          </span>,
        ]}
        text={tr("Texnologiya, ilm va ijod haqida. O‘rganayotganlarimiz va yo‘l davomida topganlarimiz.")}
      />
      <section className="container journal-list">
        {error ? (
          <p role="alert" className="notice">
            {error}
          </p>
        ) : items.length ? (
          items.map((a) => (
            <Link className="journal-item" to={`/journal/${a.slug}`} key={a.id} data-reveal>
              <small>{a.category}</small>
              <h2>{a.title}</h2>
              <p>{a.summary}</p>
              <span className="journal-arrow">
                <Arrow />
              </span>
            </Link>
          ))
        ) : (
          <div className="empty-state">
            <BookOpen strokeWidth={1} />
            <h2>{tr("Hozircha maqola yo‘q.")}</h2>
            <p>{tr("Birinchi qaydlar tayyor bo‘lgach shu yerda e’lon qilinadi.")}</p>
            <TextLink to="/about">{tr("Hozircha biz bilan tanishing")}</TextLink>
          </div>
        )}
      </section>
      <ContactBand />
    </>
  );
}

export function JournalDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getArticles<Article>()
      .then((list) => setArticle(list.find((a) => a.slug === slug) || null))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [slug]);
  if (loading) return <div className="loading-page">{tr("Yuklanmoqda…")}</div>;
  if (!article) return <NotFound />;
  return (
    <>
      <PageTop name={article.title} eyebrow={article.category} title={[article.title]} text={article.summary} />
      <article className="container prose">
        {article.body.split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
      <ContactBand />
    </>
  );
}
