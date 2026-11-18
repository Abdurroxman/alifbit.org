import type { CSSProperties } from "react";
import { BrandMark } from "../components/Brand";
import { ContactBand, Eyebrow, Lines, PageTop, delay } from "../components/ui";
import { WorkingProcess } from "./Services";

const VALUES = [
  ["01", "Ilm", "Har bir ishni o‘rganishdan boshlaymiz. Tushunish — puxta yechimning asosi."],
  ["02", "Texnologiya", "Murakkablikni foydalanuvchi uchun soddalashtiramiz. Vosita emas, natija muhim."],
  ["03", "Ijod", "Tayyor qolipdan tashqariga qaraymiz. Har bir g‘oyaning o‘z ifodasi bor."],
  ["04", "Foyda", "Chiroyli mahsulotning qadrini uning inson hayotiga bergan foydasi belgilaydi."],
];

export default function About() {
  return (
    <>
      <PageTop
        name="Biz haqimizda"
        eyebrow="AlifBit falsafasi"
        title={[
          "Ilm — ildizimiz.",
          "Texnologiya — vositamiz.",
          <span className="accent" key="a">
            Foyda — maqsadimiz.
          </span>,
        ]}
        text="AlifBit — kichik studiya: avval ehtiyojingizni tinglaymiz, keyin yechim va narxini aytamiz. O‘z mahsulotimiz ham bor: Sado — Windows uchun ovoz bilan yozish dasturi."
      />
      <section className="about-banner on-dark">
        <div className="container about-banner-inner">
          <div className="about-banner-mark" data-reveal="scale">
            <BrandMark />
          </div>
          <p className="about-banner-quote" data-reveal style={delay(150)}>
            Ilmdan g‘oyaga.
            <br />
            <em>G‘oyadan amalga.</em>
          </p>
          <small data-reveal="fade" style={delay(300)}>
            ALIFBIT / ASOSIY QADRIYAT
          </small>
        </div>
      </section>
      <section className="container section about-story">
        <div data-reveal="fade">
          <Eyebrow>Bizning boshlanishimiz</Eyebrow>
        </div>
        <div className="about-story-body">
          <Lines>
            {[
              "Yaxshi savollardan",
              <span className="accent" key="a">
                yaxshi ishlar tug‘iladi.
              </span>,
            ]}
          </Lines>
          <div className="about-story-text">
            <p className="lead" data-reveal>
              «Buni yanada foydaliroq qilish mumkinmi?» — AlifBit yondashuvi shu savoldan boshlanadi.
            </p>
            <p data-reveal>
              Biz uchun texnologiya alohida bir maqsad emas. U bilimni yetkazish, jarayonni
              soddalashtirish va mazmunli hikoyalarni aytib berish uchun imkoniyatdir.
            </p>
            <p data-reveal>
              O‘z mahsulotlarimizda sinab ko‘rgan yondashuvni mijozlar loyihasiga ham olib kiramiz:
              aniq reja, oldindan kelishilgan narx va topshirishdan oldin puxta tekshiruv.
            </p>
          </div>
        </div>
      </section>
      <section className="values section section-contrast">
        <div className="container">
          <div data-reveal="fade">
            <Eyebrow>Biz tayanadigan qadriyatlar</Eyebrow>
          </div>
          <div className="values-grid">
            {VALUES.map(([n, t, d], i) => (
              <div key={n} className="value" data-reveal style={{ "--d": i * 100 } as CSSProperties}>
                <small>{n}</small>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WorkingProcess />
      <ContactBand />
    </>
  );
}
