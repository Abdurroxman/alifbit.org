import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, LoaderCircle, Paperclip, Send } from "lucide-react";
import { useContent } from "../App";
import { api } from "../lib/api";
import { BrandMark } from "../components/Brand";
import { ButtonLink, Eyebrow, PageTop } from "../components/ui";
import { COURSE_ORDER_PREFIX, TELEGRAM_URL } from "../../shared/content";

const MAX_FILE = 5 * 1024 * 1024;

export default function Contact() {
  const { services, courses } = useContent();
  const [params] = useSearchParams();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [fileName, setFileName] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setError("");
    try {
      const data = new FormData(form);
      const file = data.get("attachment") as File | null;
      if (file && file.size > MAX_FILE) throw new Error("Fayl 5 MB dan kichik bo‘lishi kerak.");
      const result = await api<{ reference: string }>("/api/orders", { method: "POST", body: data });
      setReference(result.reference);
      setFileName("");
      form.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Murojaat yuborilmadi.");
    } finally {
      setSending(false);
    }
  }

  const project = params.get("project");
  const selected = params.get("service") || "";
  const pkg = params.get("package");
  const course = selected.startsWith(COURSE_ORDER_PREFIX)
    ? courses.find((c) => `${COURSE_ORDER_PREFIX}${c.slug}` === selected)
    : undefined;
  const prefill = course
    ? `«${course.title}» kursiga yozilmoqchiman.`
    : pkg
      ? `«${pkg}» paketi bo‘yicha buyurtma bermoqchiman.`
      : project
        ? `${project} loyihasi haqida batafsil ma’lumot olmoqchiman.`
        : "";
  return (
    <>
      <PageTop
        name="Buyurtma berish"
        eyebrow={course ? "Kursga yozilish" : "Buyurtma berish"}
        title={[
          course ? "Kursga" : "Loyihangiz",
          <span className="accent" key="a">
            {course ? "yoziling." : "haqida yozing."}
          </span>,
        ]}
        text="Formani to‘ldiring yoki Telegram’da yozing. Tafsilot va narxni birga aniqlaymiz."
      />
      <section className="container contact-layout">
        <aside className="contact-aside" data-reveal="left">
          <div>
            <small>BEVOSITA ALOQA</small>
            <ButtonLink to={TELEGRAM_URL} className="contact-telegram">
              Telegram · @alifbitbot
            </ButtonLink>
            <p>Qisqa savol yoki dastlabki suhbat uchun Telegram’da yozishingiz mumkin.</p>
          </div>
          <div>
            <small>QANDAY DAVOM ETAMIZ?</small>
            <ol>
              <li>Murojaatingiz bilan tanishamiz.</li>
              <li>Tafsilotlarni birgalikda aniqlaymiz.</li>
              <li>Yechim va keyingi qadamlarni kelishamiz.</li>
            </ol>
          </div>
          <div className="contact-aside-mark" aria-hidden="true">
            <BrandMark size="l" />
          </div>
        </aside>
        <div className="contact-card" data-reveal>
          {reference ? (
            <div className="success-state" role="status">
              <span className="success-icon">
                <Check size={30} />
              </span>
              <Eyebrow>Suhbatimiz boshlandi</Eyebrow>
              <h2>
                Murojaatingiz
                <br />
                <span className="accent">qabul qilindi.</span>
              </h2>
              <p>Ma’lumotlaringiz saqlandi. Siz ko‘rsatgan aloqa manzili orqali bog‘lanamiz.</p>
              <p className="reference">
                Murojaat raqami: <strong>{reference}</strong>
              </p>
              <button className="button button-outline" onClick={() => setReference("")}>
                Yangi murojaat
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit} noValidate={false}>
              <div className="form-heading">
                <h2>Loyihangiz haqida</h2>
                <span>01 / TANISHUV</span>
              </div>
              <div className="form-row">
                <label className="field">
                  <span>
                    Ismingiz <em>*</em>
                  </span>
                  <input className="input" name="name" autoComplete="name" placeholder="Sizga qanday murojaat qilaylik?" required minLength={2} maxLength={100} />
                </label>
                <label className="field">
                  <span>
                    Email yoki Telegram <em>*</em>
                  </span>
                  <input className="input" name="contact" autoComplete="email" placeholder="email@manzil.uz yoki @username" required minLength={4} maxLength={150} />
                </label>
              </div>
              <label className="field">
                <span>
                  Qaysi yo‘nalish? <em>*</em>
                </span>
                <select className="input" name="service" required defaultValue={selected} key={`${selected}-${courses.length}`}>
                  <option value="" disabled>
                    Yo‘nalishni tanlang
                  </option>
                  {services.map((s) => (
                    <option value={s.slug} key={s.slug}>
                      {s.name}
                    </option>
                  ))}
                  {courses.map((c) => (
                    <option value={`${COURSE_ORDER_PREFIX}${c.slug}`} key={c.id}>
                      Kurs: {c.title}
                    </option>
                  ))}
                  <option value="other">Birgalikda aniqlaymiz</option>
                </select>
              </label>
              <label className="field">
                <span>
                  G‘oyangiz haqida <em>*</em>
                </span>
                <textarea
                  className="input"
                  name="description"
                  rows={5}
                  placeholder="Nima yaratmoqchisiz? Kimlar uchun va qanday muammoni hal qiladi?"
                  required
                  minLength={20}
                  maxLength={6000}
                  defaultValue={prefill}
                  key={prefill}
                />
              </label>
              <div className="form-row">
                <label className="field">
                  <span>
                    Taxminiy byudjet <small>ixtiyoriy</small>
                  </span>
                  <select className="input" name="budget" defaultValue="">
                    <option value="">Hali aniqlanmagan</option>
                    <option>5 mln so‘mgacha</option>
                    <option>5–15 mln so‘m</option>
                    <option>15–50 mln so‘m</option>
                    <option>50 mln so‘mdan yuqori</option>
                  </select>
                </label>
                <label className="field">
                  <span>
                    Qachongacha tayyor bo‘lishi kerak? <small>ixtiyoriy</small>
                  </span>
                  <input className="input" name="deadline" type="date" min={new Date().toISOString().slice(0, 10)} />
                </label>
              </div>
              <label className="file-field">
                <span className="file-icon">
                  <Paperclip size={18} />
                </span>
                <span className="file-text">
                  <b>{fileName || "Qo‘shimcha fayl biriktirish"}</b>
                  <small>PDF, PNG, JPG, WEBP · 5 MB gacha</small>
                </span>
                <input
                  type="file"
                  name="attachment"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                />
              </label>
              <label className="honeypot" aria-hidden="true">
                Veb-saytingiz
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <label className="consent">
                <input type="checkbox" name="consent" value="yes" required />
                <span>
                  <Link to="/privacy" target="_blank">
                    Maxfiylik siyosati
                  </Link>{" "}
                  bilan tanishdim va murojaatimni ko‘rib chiqish uchun ma’lumotlarimni qayta ishlashga
                  roziman.
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
                  <span className="button-icon" aria-hidden="true">
                    {sending ? <LoaderCircle className="spin" size={16} /> : <Send size={15} />}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
