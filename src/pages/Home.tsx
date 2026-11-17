import { ArrowDown } from "lucide-react";
import { useContent } from "../App";
import { CourseTeaser, ServiceCards, WorkGrid } from "../components/Studio";
import { ButtonLink, Chars, ContactBand, Eyebrow, Lines, TextLink, delay } from "../components/ui";
import { FAQ, WorkingProcess } from "./Services";
import { copy } from "../../shared/content";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="container hero-inner">
        <div data-reveal="rise">
          <Eyebrow>AlifBit · studiya</Eyebrow>
        </div>
        <Chars text="Sayt, ilova va" accent="Telegram bot yasaymiz." delay={120} />
        <p className="hero-text" data-reveal="rise" style={delay(520)}>
          {copy.uz.hero.text}
        </p>
        <div className="hero-actions" data-reveal="rise" style={delay(640)}>
          <ButtonLink to="#narxlar" magnetic>
            Narxlarni ko‘rish
          </ButtonLink>
          <ButtonLink to="/contact" variant="outline">
            Buyurtma berish
          </ButtonLink>
        </div>
      </div>
      <a href="#narxlar" className="hero-cue" aria-label="Xizmatlar va narxlarga o‘tish">
        <ArrowDown size={20} strokeWidth={1.6} />
      </a>
    </section>
  );
}

function Prices() {
  const { services } = useContent();
  return (
    <section id="narxlar" className="container section">
      <div className="section-head">
        <div>
          <div data-reveal="fade">
            <Eyebrow>Xizmatlar va narxlar</Eyebrow>
          </div>
          <Lines>
            {[
              "Nima yasaymiz.",
              <span className="accent" key="a">
                Narxi qancha.
              </span>,
            ]}
          </Lines>
        </div>
        <div className="section-aside" data-reveal style={delay(150)}>
          <p>Paketlar, tarkibi va muddati — har bir xizmat sahifasida.</p>
          <TextLink to="/services">Barcha xizmatlar</TextLink>
        </div>
      </div>
      <ServiceCards services={services} />
    </section>
  );
}

function Works() {
  const { projects } = useContent();
  return (
    <section className="container section hairline">
      <div className="section-head">
        <div>
          <div data-reveal="fade">
            <Eyebrow>Qilgan ishlarimiz</Eyebrow>
          </div>
          <Lines>
            {[
              "Ishlayotgan mahsulotlar.",
              <span className="accent" key="a">
                Ochib ko‘ring.
              </span>,
            ]}
          </Lines>
        </div>
        <div className="section-aside" data-reveal style={delay(150)}>
          <TextLink to="/projects">Barcha ishlar</TextLink>
        </div>
      </div>
      <WorkGrid projects={projects.slice(0, 4)} />
    </section>
  );
}

function Course() {
  const { courses } = useContent();
  if (!courses.length) return null;
  return (
    <section className="container section hairline">
      <div data-reveal="fade">
        <Eyebrow>Kurs</Eyebrow>
      </div>
      <CourseTeaser course={courses[0]} />
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Prices />
      <Works />
      <WorkingProcess />
      <Course />
      <FAQ />
      <ContactBand />
    </>
  );
}
