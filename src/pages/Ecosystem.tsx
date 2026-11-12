import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  PencilRuler,
  Lightbulb,
  Check,
  MoveHorizontal,
  Film,
  Languages,
} from "lucide-react";
import {
  Breadcrumb,
  ContactBand,
  Eyebrow,
  TextLink,
} from "../components/Layout";
import ProjectArt from "../components/ProjectArt";
import { Status } from "../components/Projects";
function EcoHero({
  label,
  title,
  text,
  kind,
  children,
}: {
  label: string;
  title: React.ReactNode;
  text: string;
  kind: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="container eco-hero">
      <Breadcrumb name={label} />
      <div className="eco-hero-grid">
        <div>
          <Eyebrow>{label.toUpperCase()}</Eyebrow>
          <h1>{title}</h1>
          <p>{text}</p>
          {children}
        </div>
        <ProjectArt kind={kind} />
      </div>
    </section>
  );
}
export function Academy() {
  return (
    <>
      <EcoHero
        label="AlifBit Academy"
        title={
          <>
            Bilim —<br />
            yangi imkoniyatning
            <br />
            <span>boshlanishi.</span>
          </>
        }
        text="Tushunish uchun o‘qing. Mustahkamlash uchun bajaring. Bilimni amaliy ko‘nikmaga aylantirishga qaratilgan ta’lim yondashuvi."
        kind="academy"
      >
        <a className="button" href="#learning">
          Yondashuv bilan tanishish
          <ArrowUpRight size={18} />
        </a>
      </EcoHero>
      <section className="container section-space" id="learning">
        <div className="section-heading">
          <div>
            <Eyebrow>SHOSHILMASDAN. TUSHUNIB.</Eyebrow>
            <h2>
              Ko‘proq ma’lumot emas.
              <br />
              <span>Chuqurroq tushunish.</span>
            </h2>
          </div>
          <p>
            O‘quvchi o‘z sur’atida o‘rganishi,
            <br />
            fikrlashi va amalda sinashi uchun.
          </p>
        </div>
        <div className="three-columns">
          {[
            [
              BookOpen,
              "O‘qing va tushuning",
              "Tartibli matnli darslar. Asosiy tushunchalar, misollar va qaytib o‘qish uchun qulay tuzilma.",
            ],
            [
              PencilRuler,
              "Amalda sinab ko‘ring",
              "Bilimni mustahkamlaydigan vazifalar. Tayyor javobdan ko‘ra mustaqil fikrlash muhim.",
            ],
            [
              Lightbulb,
              "Yangi g‘oya yarating",
              "O‘rganganlaringizni haqiqiy vazifaga qo‘llang. Kichik qadamdan mustaqil loyihaga.",
            ],
          ].map(([Icon, title, text], i) => {
            const I = Icon as typeof BookOpen;
            return (
              <div key={i}>
                <I strokeWidth={1.2} size={30} />
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="academy-banner">
        <div className="container">
          <Eyebrow>KURSLAR VA DASTURLAR</Eyebrow>
          <h2>
            Yaxshi dars
            <br />
            <em>e’tibor bilan yaratiladi.</em>
          </h2>
          <p>
            Hozircha ochiq kurslar e’lon qilinmagan. Dasturlar, o‘qitish
            shartlari va akademiyaga kirish havolasi tasdiqlangach shu sahifada
            chiqadi.
          </p>
          <Status value="Taqdimot" />
          <TextLink to="/contact?service=academy">
            Academy haqida so‘rash
          </TextLink>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
export function Library() {
  const [filter, setFilter] = useState("Barchasi");
  return (
    <>
      <EcoHero
        label="AlifBit Library"
        title={
          <>
            Bir kitob.
            <br />
            Ming fikr.
            <br />
            <span>Yangi dunyo.</span>
          </>
        }
        text="Mutolaa, izlanish va yangi qarashlar uchun makon. Kitoblar, mazmunli qisqartmalar va tarjimalarni bir joyga jamlaymiz."
        kind="library"
      >
        <a className="button" href="#library-catalog">
          Kutubxona haqida
          <ArrowUpRight size={18} />
        </a>
      </EcoHero>
      <section className="library-quote">
        <div className="container">
          <span>“</span>
          <h2>
            Bilimga olib boradigan yo‘l
            <br />
            <em>har doim ochiq bo‘lsin.</em>
          </h2>
          <small>ALIFBIT LIBRARY’NING MAQSADI</small>
        </div>
      </section>
      <section className="container section-space" id="library-catalog">
        <div className="section-heading">
          <div>
            <Eyebrow>MUTOLAA UCHUN MAKON</Eyebrow>
            <h2>
              Saralangan bilim.
              <br />
              <span>Qulay shaklda.</span>
            </h2>
          </div>
        </div>
        <div className="filters" aria-label="Kutubxona kategoriyalari">
          {[
            "Barchasi",
            "Elektron kitoblar",
            "Qisqartmalar",
            "Tarjimalar",
            "Audio",
          ].map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              className={f === filter ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="library-empty">
          <BookOpen strokeWidth={1} />
          <div>
            <h3>
              {filter === "Barchasi"
                ? "Kutubxona shakllanmoqda."
                : `${filter} tayyorlanmoqda.`}
            </h3>
            <p>
              Hozircha materiallar e’lon qilinmagan. Mualliflik va tarqatish
              huquqi tekshirilgan materiallar bepul yoki pullik belgisi bilan
              katalogga qo‘shiladi.
            </p>
          </div>
          <Status value="Taqdimot" />
        </div>
        <div className="three-columns library-principles">
          <div>
            <h3>Saralash</h3>
            <p>Ko‘pligiga emas, mazmuni va o‘quvchiga foydasiga e’tibor.</p>
          </div>
          <div>
            <h3>Tushunarlilik</h3>
            <p>Murakkab fikrlarni soddalashtirish, asl ma’noni saqlash.</p>
          </div>
          <div>
            <h3>Muallifga hurmat</h3>
            <p>Ruxsatlar, manbalar va tarjima huquqlariga mas’uliyat.</p>
          </div>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
export function Films() {
  return (
    <>
      <section className="films-hero">
        <div className="container">
          <Breadcrumb name="Films & Animation" />
          <div className="films-hero-content">
            <div>
              <Eyebrow>ALIFBIT FILMS & ANIMATION</Eyebrow>
              <h1>
                Tarixga
                <br />
                <em>yangi nigoh.</em>
              </h1>
              <p>
                O‘tmishdagi hikoyalarni bugungi tasvir tili bilan aytamiz. Ilm,
                izlanish va ijod uchrashadigan yangi sahna.
              </p>
              <a className="button button-light" href="#films-direction">
                Yo‘nalishni kashf eting
                <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="film-architecture">
              <i />
              <i />
              <i />
              <div className="film-architecture-light" />
            </div>
          </div>
          <div className="film-hero-foot">
            <span>TARIX · ANIMATSIYA · HIKOYA</span>
            <span>MAZMUN BIRINCHI O‘RINDA.</span>
          </div>
        </div>
      </section>
      <section className="container section-space" id="films-direction">
        <div className="section-heading">
          <div>
            <Eyebrow>VOQEADAN VIZUAL HIKOYAGA</Eyebrow>
            <h2>
              Ko‘rish.
              <br />
              His qilish.
              <br />
              <span>Anglash.</span>
            </h2>
          </div>
          <p>
            Har bir kadrning ortida fikr bor.
            <br />
            Har bir hikoyaning ortida izlanish.
          </p>
        </div>
        <div className="three-columns">
          <div>
            <Film size={28} strokeWidth={1.2} />
            <h3>Tarixiy filmlar</h3>
            <p>
              Tarixiy mavzularga izlanish va manbalarga e’tibor bilan
              yondashadigan vizual hikoyalar.
            </p>
          </div>
          <div>
            <Code2 size={28} strokeWidth={1.2} />
            <h3>3D & Animation</h3>
            <p>
              G‘oya va voqealarni jonlantiradigan sahnalar, obrazlar hamda
              raqamli tasvirlar.
            </p>
          </div>
          <div>
            <Languages size={28} strokeWidth={1.2} />
            <h3>Ko‘p tilli media</h3>
            <p>
              Mazmunli hikoyalarni turli auditoriyalarga yaqinlashtiradigan
              tarjima va dublyaj.
            </p>
          </div>
        </div>
        <div className="library-empty">
          <Film strokeWidth={1} />
          <div>
            <h3>Hikoyalar hali oldinda.</h3>
            <p>
              Tayyor filmlar, treylerlar, qismlar va mavjud tillar tasdiqlangach
              katalogga qo‘shiladi. Hozirgi vizuallar — yo‘nalish konsepsiyasi.
            </p>
          </div>
          <Status value="Taqdimot" />
        </div>
      </section>
      <ContactBand />
    </>
  );
}
export function Render() {
  const [value, setValue] = useState(50);
  return (
    <>
      <EcoHero
        label="AlifBit Render"
        title={
          <>
            Tasavvurga shakl.
            <br />
            Shaklga
            <br />
            <span>hayot.</span>
          </>
        }
        text="3D modellar, arxitektura va video loyihalar uchun render hamda vizualizatsiya. Material, yorug‘lik va har bir detalga e’tibor."
        kind="render"
      >
        <Link className="button" to="/contact?service=render">
          Render loyihasini boshlash
          <ArrowUpRight size={18} />
        </Link>
      </EcoHero>
      <section className="container section-space">
        <div className="section-heading">
          <div>
            <Eyebrow>SHAKLDAN YAKUNIY TASVIRGA</Eyebrow>
            <h2>
              Farq
              <br />
              <span>detallarda.</span>
            </h2>
          </div>
          <p>
            Slayderni surib, kompozitsiyaning
            <br />
            ikki ko‘rinishini taqqoslang.
          </p>
        </div>
        <div className="comparison">
          <div className="comparison-after">
            <ProjectArt kind="render" large />
          </div>
          <div
            className="comparison-before"
            style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
          >
            <ProjectArt kind="render" large />
          </div>
          <div className="comparison-divider" style={{ left: `${value}%` }}>
            <span>
              <MoveHorizontal size={25} />
            </span>
          </div>
          <span className="comparison-label label-before">01 / SHAKL</span>
          <span className="comparison-label label-after">
            02 / MATERIAL VA YORUG‘LIK
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label="Shakl va yakuniy materialli tasvirni taqqoslash"
          />
        </div>
        <p className="visual-note">
          Interaktiv dizayn konsepsiyasi. Bu mijozning haqiqiy render loyihasi
          emas.
        </p>
        <div className="render-details">
          <div>
            <h2>
              Vazifangizga mos
              <br />
              <span>individual yondashuv.</span>
            </h2>
            <p>
              Format, hajm, kerakli sifat va muddatni ko‘rib chiqamiz. Narx va
              ish tartibini loyiha bo‘yicha alohida kelishamiz.
            </p>
          </div>
          <ul className="feature-list">
            {[
              "Arxitektura va interyer vizualizatsiyasi",
              "3D mahsulot kompozitsiyalari",
              "Video render va yakuniy tasvir",
              "Vazifa formatlarini oldindan kelishish",
            ].map((x) => (
              <li key={x}>
                <Check size={18} />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
