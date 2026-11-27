import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, LoaderCircle, Paperclip, Send } from "lucide-react";
import { useContent } from "../App";
import { api } from "../lib/api";
import { BrandMark } from "../components/Brand";
import { ButtonLink, Eyebrow, PageTop } from "../components/ui";
import { COURSE_ORDER_PREFIX, TELEGRAM_URL } from "../../shared/content";
import { lang, mk, tr } from "../lib/i18n";

const MAX_FILE = 5 * 1024 * 1024;
const BUDGETS = [mk("5 mln so‘mgacha"), mk("5–15 mln so‘m"), mk("15–50 mln so‘m"), mk("50 mln so‘mdan yuqori")];

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
      if (file && file.size > MAX_FILE) throw new Error(tr("Fayl 5 MB dan kichik bo‘lishi kerak."));
      data.set("lang", lang);
      const result = await api<{ reference: string }>("/api/orders", { method: "POST", body: data });
      setReference(result.reference);
      setFileName("");
      form.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("Murojaat yuborilmadi."));
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
    ? tr("«{title}» kursiga yozilmoqchiman.", { title: course.title })
    : pkg
      ? tr("«{name}» paketi bo‘yicha buyurtma bermoqchiman.", { name: pkg })
      : project
        ? tr("{name} loyihasi haqida batafsil ma’lumot olmoqchiman.", { name: project })
        : "";
  // Rozilik jumlasi: «{link}» o'rnida «Maxfiylik siyosati» havolasi turadi.
  const consent = tr("{link} bilan tanishdim va murojaatimni ko‘rib chiqish uchun ma’lumotlarimni qayta ishlashga roziman.").split("{link}");
  return (
    <>
      <PageTop
        name={tr("Buyurtma berish")}
        eyebrow={course ? tr("Kursga yozilish") : tr("Buyurtma berish")}
        title={[
          course ? tr("Kursga") : tr("Loyihangiz"),
          <span className="accent" key="a">
            {course ? tr("yoziling.") : tr("haqida yozing.")}
          </span>,
        ]}
        text={tr("Formani to‘ldiring yoki Telegram’da yozing. Tafsilot va narxni birga aniqlaymiz.")}
      />
      <section className="container contact-layout">
        <aside className="contact-aside" data-reveal="left">
          <div>
            <small>{tr("BEVOSITA ALOQA")}</small>
            <ButtonLink to={TELEGRAM_URL} className="contact-telegram">
              Telegram · @alifbitbot
            </ButtonLink>
            <p>{tr("Qisqa savol yoki dastlabki suhbat uchun Telegram’da yozishingiz mumkin.")}</p>
          </div>
          <div>
            <small>{tr("QANDAY DAVOM ETAMIZ?")}</small>
            <ol>
              <li>{tr("Murojaatingiz bilan tanishamiz.")}</li>
              <li>{tr("Tafsilotlarni birgalikda aniqlaymiz.")}</li>
              <li>{tr("Yechim va keyingi qadamlarni kelishamiz.")}</li>
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
              <Eyebrow>{tr("Suhbatimiz boshlandi")}</Eyebrow>
              <h2>
                {tr("Murojaatingiz")}
                <br />
                <span className="accent">{tr("qabul qilindi.")}</span>
              </h2>
              <p>{tr("Ma’lumotlaringiz saqlandi. Siz ko‘rsatgan aloqa manzili orqali bog‘lanamiz.")}</p>
              <p className="reference">
                {tr("Murojaat raqami:")} <strong>{reference}</strong>
              </p>
              <button className="button button-outline" onClick={() => setReference("")}>
                {tr("Yangi murojaat")}
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit} noValidate={false}>
              <div className="form-heading">
                <h2>{tr("Loyihangiz haqida")}</h2>
                <span>{tr("01 / TANISHUV")}</span>
              </div>
              <div className="form-row">
                <label className="field">
                  <span>
                    {tr("Ismingiz")} <em>*</em>
                  </span>
                  <input className="input" name="name" autoComplete="name" placeholder={tr("Sizga qanday murojaat qilaylik?")} required minLength={2} maxLength={100} />
                </label>
                <label className="field">
                  <span>
                    {tr("Email yoki Telegram")} <em>*</em>
                  </span>
                  <input className="input" name="contact" autoComplete="email" placeholder={tr("email@manzil.uz yoki @username")} required minLength={4} maxLength={150} />
                </label>
              </div>
              <label className="field">
                <span>
                  {tr("Qaysi yo‘nalish?")} <em>*</em>
                </span>
                <select className="input" name="service" required defaultValue={selected} key={`${selected}-${courses.length}`}>
                  <option value="" disabled>
                    {tr("Yo‘nalishni tanlang")}
                  </option>
                  {services.map((s) => (
                    <option value={s.slug} key={s.slug}>
                      {s.name}
                    </option>
                  ))}
                  {courses.map((c) => (
                    <option value={`${COURSE_ORDER_PREFIX}${c.slug}`} key={c.id}>
                      {tr("Kurs: {title}", { title: c.title })}
                    </option>
                  ))}
                  <option value="other">{tr("Birgalikda aniqlaymiz")}</option>
                </select>
              </label>
              <label className="field">
                <span>
                  {tr("G‘oyangiz haqida")} <em>*</em>
                </span>
                <textarea
                  className="input"
                  name="description"
                  rows={5}
                  placeholder={tr("Nima yaratmoqchisiz? Kimlar uchun va qanday muammoni hal qiladi?")}
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
                    {tr("Taxminiy byudjet")} <small>{tr("ixtiyoriy")}</small>
                  </span>
                  {/* Qiymat o'zbekcha saqlanadi, sahifada tarjimasi ko'rinadi. */}
                  <select className="input" name="budget" defaultValue="">
                    <option value="">{tr("Hali aniqlanmagan")}</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {tr(b)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>
                    {tr("Qachongacha tayyor bo‘lishi kerak?")} <small>{tr("ixtiyoriy")}</small>
                  </span>
                  <input className="input" name="deadline" type="date" min={new Date().toISOString().slice(0, 10)} />
                </label>
              </div>
              <label className="file-field">
                <span className="file-icon">
                  <Paperclip size={18} />
                </span>
                <span className="file-text">
                  <b>{fileName || tr("Qo‘shimcha fayl biriktirish")}</b>
                  <small>{tr("PDF, PNG, JPG, WEBP · 5 MB gacha")}</small>
                </span>
                <input
                  type="file"
                  name="attachment"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                />
              </label>
              <label className="honeypot" aria-hidden="true">
                {tr("Veb-saytingiz")}
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <label className="consent">
                <input type="checkbox" name="consent" value="yes" required />
                <span>
                  {consent[0]}
                  <Link to="/privacy" target="_blank">
                    {tr("Maxfiylik siyosati")}
                  </Link>
                  {consent[1]}
                </span>
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="form-submit">
                <span>
                  {tr("Yaxshi hamkorlik")}
                  <br />
                  {tr("shu yerdan boshlanadi.")}
                </span>
                <button className="button" disabled={sending} type="submit">
                  {sending ? tr("Yuborilmoqda…") : tr("Murojaatni yuborish")}
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
