import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { api } from "../lib/api";
import { Arrow, ContactBand, PageTop, TextLink } from "../components/ui";
import NotFound from "./NotFound";

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
    api<Article[]>("/api/articles")
      .then(setItems)
      .catch(() => setError("Qaydlarni yuklab bo‘lmadi. Keyinroq urinib ko‘ring."));
  }, []);
  return (
    <>
      <PageTop
        name="Qaydlar"
        eyebrow="Fikrlar va izlanishlar"
        title={[
          "Ishlar ortidagi",
          <span className="accent" key="a">
            fikrlar.
          </span>,
        ]}
        text="Texnologiya, ilm va ijod haqida. O‘rganayotganlarimiz va yo‘l davomida topganlarimiz."
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
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<Article[]>("/api/articles")
      .then((list) => setArticle(list.find((a) => a.slug === slug) || null))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [slug]);
  if (loading) return <div className="loading-page">Yuklanmoqda…</div>;
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
