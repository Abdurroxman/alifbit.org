import { useState, type CSSProperties, type ReactNode } from "react";
import { BookOpen, Check, Code2, Film, Languages, Lightbulb, MoveHorizontal, PencilRuler } from "lucide-react";
import ProjectArt from "../components/ProjectArt";
import { Status } from "../components/Projects";
import { Breadcrumb, ButtonLink, ContactBand, Eyebrow, Lines, TextLink, delay } from "../components/ui";

function EcoHero({
  label,
  title,
  text,
  kind,
  children,
}: {
  label: string;
  title: ReactNode[];
  text: string;
  kind: string;
  children?: ReactNode;
}) {
  return (
    <section className="container eco-hero">
      <Breadcrumb name={label} />
      <div className="eco-hero-grid">
        <div className="eco-hero-copy">
          <div data-reveal="fade">
            <Eyebrow>{label}</Eyebrow>
          </div>
          <Lines as="h1">{title}</Lines>
          <p data-reveal style={delay(250)}>
            {text}
          </p>
          <div data-reveal style={delay(350)}>
            {children}
          </div>
        </div>
        <div className="eco-hero-art" data-reveal="clip" style={delay(150)}>
          <ProjectArt kind={kind} large />
        </div>
      </div>
    </section>
  );
}

function Pillars({ items }: { items: Array<[typeof BookOpen | null, string, string]> }) {
  return (
    <div className="pillars">
      {items.map(([Icon, title, text], i) => (
        <div className="pillar" key={title} data-reveal style={{ "--d": i * 100 } as CSSProperties}>
          {Icon ? <Icon strokeWidth={1.3} size={28} /> : <span className="pillar-num">0{i + 1}</span>}
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}

function Pending({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="pending" data-reveal>
      <span className="pending-icon">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <Status value="Taqdimot" />
    </div>
  );
}

export function Academy() {
  return (
    <>
      <EcoHero
        label="AlifBit Academy"
        title={[
          "Bilim —",
          "yangi imkoniyatning",
          <span className="accent" key="a">
            boshlanishi.
          </span>,
        ]}
        text="Tushunish uchun o‘qing. Mustahkamlash uchun bajaring. Bilimni amaliy ko‘nikmaga aylantirishga qaratilgan ta’lim yondashuvi."
        kind="academy"
      >
        <ButtonLink to="#learning" magnetic>
          Yondashuv bilan tanishish
        </ButtonLink>
      </EcoHero>
      <section className="container section" id="learning">
        <div className="section-head">
          <div>
            <div data-reveal="fade">
              <Eyebrow>Shoshilmasdan. Tushunib.</Eyebrow>
            </div>
            <Lines>
              {[
                "Ko‘proq ma’lumot emas.",
                <span className="accent" key="a">
                  Chuqurroq tushunish.
                </span>,
              ]}
            </Lines>
          </div>
          <p data-reveal>O‘quvchi o‘z sur’atida o‘rganishi, fikrlashi va amalda sinashi uchun.</p>
        </div>
        <Pillars
          items={[
            [BookOpen, "O‘qing va tushuning", "Tartibli matnli darslar. Asosiy tushunchalar, misollar va qaytib o‘qish uchun qulay tuzilma."],
            [PencilRuler, "Amalda sinab ko‘ring", "Bilimni mustahkamlaydigan vazifalar. Tayyor javobdan ko‘ra mustaqil fikrlash muhim."],
            [Lightbulb, "Yangi g‘oya yarating", "O‘rganganlaringizni haqiqiy vazifaga qo‘llang. Kichik qadamdan mustaqil loyihaga."],
          ]}
        />
      </section>
      <section className="banner on-dark">
        <div className="container banner-inner">
          <div data-reveal="fade">
            <Eyebrow>Kurslar va dasturlar</Eyebrow>
          </div>
          <Lines>
            {[
              "Yaxshi dars",
              <span className="serif" key="a">
                e’tibor bilan yaratiladi.
              </span>,
            ]}
          </Lines>
          <p data-reveal>
            Hozircha ochiq kurslar e’lon qilinmagan. Dasturlar, o‘qitish shartlari va akademiyaga kirish
            havolasi tasdiqlangach shu sahifada chiqadi.
          </p>
          <div className="banner-actions" data-reveal>
            <Status value="Taqdimot" />
            <ButtonLink to="/contact?service=academy" variant="light">
              Academy haqida so‘rash
            </ButtonLink>
          </div>
        </div>
      </section>
      <ContactBand />
    </>
  );
}

const LIBRARY_FILTERS = ["Barchasi", "Elektron kitoblar", "Qisqartmalar", "Tarjimalar", "Audio"];

export function Library() {
  const [filter, setFilter] = useState("Barchasi");
  return (
    <>
      <EcoHero
        label="AlifBit Library"
        title={[
          "Bir kitob.",
          "Ming fikr.",
          <span className="accent" key="a">
            Yangi dunyo.
          </span>,
        ]}
        text="Mutolaa, izlanish va yangi qarashlar uchun makon. Kitoblar, mazmunli qisqartmalar va tarjimalarni bir joyga jamlaymiz."
        kind="library"
      >
        <ButtonLink to="#library-catalog" magnetic>
          Kutubxona haqida
        </ButtonLink>
      </EcoHero>
      <section className="quote">
        <div className="container">
          <span className="quote-mark" aria-hidden="true">
            “
          </span>
          <Lines>
            {[
              "Bilimga olib boradigan yo‘l",
              <span className="serif accent" key="a">
                har doim ochiq bo‘lsin.
              </span>,
            ]}
          </Lines>
          <small data-reveal="fade">ALIFBIT LIBRARY’NING MAQSADI</small>
        </div>
      </section>
      <section className="container section" id="library-catalog">
        <div className="section-head">
          <div>
            <div data-reveal="fade">
              <Eyebrow>Mutolaa uchun makon</Eyebrow>
            </div>
            <Lines>
              {[
                "Saralangan bilim.",
                <span className="accent" key="a">
                  Qulay shaklda.
                </span>,
              ]}
            </Lines>
          </div>
        </div>
        <div className="chips library-chips" role="group" aria-label="Kutubxona kategoriyalari">
          {LIBRARY_FILTERS.map((f) => (
            <button key={f} className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <Pending
          icon={<BookOpen strokeWidth={1.2} />}
          title={filter === "Barchasi" ? "Kutubxona shakllanmoqda." : `${filter} tayyorlanmoqda.`}
          text="Hozircha materiallar e’lon qilinmagan. Mualliflik va tarqatish huquqi tekshirilgan materiallar bepul yoki pullik belgisi bilan katalogga qo‘shiladi."
        />
        <Pillars
          items={[
            [null, "Saralash", "Ko‘pligiga emas, mazmuni va o‘quvchiga foydasiga e’tibor."],
            [null, "Tushunarlilik", "Murakkab fikrlarni soddalashtirish, asl ma’noni saqlash."],
            [null, "Muallifga hurmat", "Ruxsatlar, manbalar va tarjima huquqlariga mas’uliyat."],
          ]}
        />
      </section>
      <ContactBand />
    </>
  );
}

export function Films() {
  return (
    <>
      <section className="films-hero on-dark">
        <div className="films-hero-art" aria-hidden="true">
          <i />
          <i />
          <i />
          <div className="films-light" />
        </div>
        <div className="container films-hero-inner">
          <Breadcrumb name="Films & Animation" />
          <div className="films-hero-copy">
            <div data-reveal="fade">
              <Eyebrow>AlifBit Films & Animation</Eyebrow>
            </div>
            <Lines as="h1">
              {[
                "Tarixga",
                <span className="serif" key="a">
                  yangi nigoh.
                </span>,
              ]}
            </Lines>
            <p data-reveal style={delay(250)}>
              O‘tmishdagi hikoyalarni bugungi tasvir tili bilan aytamiz. Ilm, izlanish va ijod
              uchrashadigan yangi sahna.
            </p>
            <div data-reveal style={delay(350)}>
              <ButtonLink to="#films-direction" variant="light" magnetic>
                Yo‘nalishni kashf eting
              </ButtonLink>
            </div>
          </div>
          <div className="films-foot">
            <span>TARIX · ANIMATSIYA · HIKOYA</span>
            <span>MAZMUN BIRINCHI O‘RINDA.</span>
          </div>
        </div>
      </section>
      <section className="container section" id="films-direction">
        <div className="section-head">
          <div>
            <div data-reveal="fade">
              <Eyebrow>Voqeadan vizual hikoyaga</Eyebrow>
            </div>
            <Lines>
              {[
                "Ko‘rish.",
                "His qilish.",
                <span className="accent" key="a">
                  Anglash.
                </span>,
              ]}
            </Lines>
          </div>
          <p data-reveal>Har bir kadrning ortida fikr bor. Har bir hikoyaning ortida izlanish.</p>
        </div>
        <Pillars
          items={[
            [Film, "Tarixiy filmlar", "Tarixiy mavzularga izlanish va manbalarga e’tibor bilan yondashadigan vizual hikoyalar."],
            [Code2, "3D & Animation", "G‘oya va voqealarni jonlantiradigan sahnalar, obrazlar hamda raqamli tasvirlar."],
            [Languages, "Ko‘p tilli media", "Mazmunli hikoyalarni turli auditoriyalarga yaqinlashtiradigan tarjima va dublyaj."],
          ]}
        />
        <Pending
          icon={<Film strokeWidth={1.2} />}
          title="Hikoyalar hali oldinda."
          text="Tayyor filmlar, treylerlar, qismlar va mavjud tillar tasdiqlangach katalogga qo‘shiladi. Hozirgi vizuallar — yo‘nalish konsepsiyasi."
        />
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
        title={[
          "Tasavvurga shakl.",
          "Shaklga",
          <span className="accent" key="a">
            hayot.
          </span>,
        ]}
        text="3D modellar, arxitektura va video loyihalar uchun render hamda vizualizatsiya. Material, yorug‘lik va har bir detalga e’tibor."
        kind="render"
      >
        <ButtonLink to="/contact?service=render" magnetic>
          Render loyihasini boshlash
        </ButtonLink>
      </EcoHero>
      <section className="container section">
        <div className="section-head">
          <div>
            <div data-reveal="fade">
              <Eyebrow>Shakldan yakuniy tasvirga</Eyebrow>
            </div>
            <Lines>
              {[
                "Farq",
                <span className="accent" key="a">
                  detallarda.
                </span>,
              ]}
            </Lines>
          </div>
          <p data-reveal>Slayderni surib, kompozitsiyaning ikki ko‘rinishini taqqoslang.</p>
        </div>
        <div className="comparison" data-reveal="clip" style={{ "--pos": `${value}%` } as CSSProperties}>
          <div className="comparison-layer">
            <ProjectArt kind="render" large />
          </div>
          <div className="comparison-layer comparison-before">
            <ProjectArt kind="render" large wire />
          </div>
          <div className="comparison-divider" aria-hidden="true">
            <span>
              <MoveHorizontal size={22} />
            </span>
          </div>
          <span className="comparison-label label-before">01 / SHAKL</span>
          <span className="comparison-label label-after">02 / MATERIAL VA YORUG‘LIK</span>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label="Shakl va yakuniy materialli tasvirni taqqoslash"
          />
        </div>
        <p className="visual-note">Interaktiv dizayn konsepsiyasi. Bu mijozning haqiqiy render loyihasi emas.</p>
        <div className="render-details">
          <div data-reveal>
            <h2>
              Vazifangizga mos
              <br />
              <span className="accent">individual yondashuv.</span>
            </h2>
            <p>
              Format, hajm, kerakli sifat va muddatni ko‘rib chiqamiz. Narx va ish tartibini loyiha
              bo‘yicha alohida kelishamiz.
            </p>
            <TextLink to="/contact?service=render">Render loyihasini boshlash</TextLink>
          </div>
          <ul className="check-list" data-reveal style={delay(150)}>
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
