import type { CSSProperties } from "react";
import { BrandMark } from "../components/Brand";
import { ContactBand, Eyebrow, Lines, PageTop, delay } from "../components/ui";
import { WorkingProcess } from "./Services";
import { mk, tr } from "../lib/i18n";

const VALUES = [
  ["01", mk("Ilm"), mk("Har bir ishni o‘rganishdan boshlaymiz. Tushunish — puxta yechimning asosi.")],
  ["02", mk("Texnologiya"), mk("Murakkablikni foydalanuvchi uchun soddalashtiramiz. Vosita emas, natija muhim.")],
  ["03", mk("Ijod"), mk("Tayyor qolipdan tashqariga qaraymiz. Har bir g‘oyaning o‘z ifodasi bor.")],
  ["04", mk("Foyda"), mk("Chiroyli mahsulotning qadrini uning inson hayotiga bergan foydasi belgilaydi.")],
];

export default function About() {
  return (
    <>
      <PageTop
        name={tr("Biz haqimizda")}
        eyebrow="AlifBit"
        title={[
          tr("Sayt, Telegram bot va ilovalar"),
          <span className="accent" key="a">
            {tr("yaratadigan kichik studiya.")}
          </span>,
        ]}
        text={tr("Loyihangizni muhokama qilib, bajariladigan ishlar, narx va muddatni oldindan kelishamiz. O‘z mahsulotimiz ham bor: Sado — ovoz bilan matn yozish dasturi.")}
      />
      <section className="about-banner on-dark">
        <div className="container about-banner-inner">
          <div className="about-banner-mark" data-reveal="scale">
            <BrandMark size="l" silver />
          </div>
          <p className="about-banner-quote" data-reveal style={delay(150)}>
            {tr("Ilmdan g‘oyaga.")}
            <br />
            <em>{tr("G‘oyadan amalga.")}</em>
          </p>
          <small data-reveal="fade" style={delay(300)}>
            {tr("ALIFBIT / ASOSIY QADRIYAT")}
          </small>
        </div>
      </section>
      <section className="container section about-story">
        <div data-reveal="fade">
          <Eyebrow>{tr("Bizning boshlanishimiz")}</Eyebrow>
        </div>
        <div className="about-story-body">
          <Lines>
            {[
              tr("Yaxshi savollardan"),
              <span className="accent" key="a">
                {tr("yaxshi ishlar tug‘iladi.")}
              </span>,
            ]}
          </Lines>
          <div className="about-story-text">
            <p className="lead" data-reveal>
              {tr("«Buni yanada foydaliroq qilish mumkinmi?» — AlifBit yondashuvi shu savoldan boshlanadi.")}
            </p>
            <p data-reveal>
              {tr("Biz uchun texnologiya alohida bir maqsad emas. U bilimni yetkazish, jarayonni soddalashtirish va mazmunli hikoyalarni aytib berish uchun imkoniyatdir.")}
            </p>
            <p data-reveal>
              {tr("O‘z mahsulotlarimizda sinab ko‘rgan yondashuvni mijozlar loyihasiga ham olib kiramiz: aniq reja, sifatli va tartibli kod, topshirishdan oldin puxta tekshiruv.")}
            </p>
          </div>
        </div>
      </section>
      <section className="values section section-contrast">
        <div className="container">
          <div data-reveal="fade">
            <Eyebrow>{tr("Biz tayanadigan qadriyatlar")}</Eyebrow>
          </div>
          <div className="values-grid">
            {VALUES.map(([n, t, d], i) => (
              <div key={n} className="value" data-reveal style={{ "--d": i * 100 } as CSSProperties}>
                <small>{n}</small>
                <h3>{tr(t)}</h3>
                <p>{tr(d)}</p>
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
