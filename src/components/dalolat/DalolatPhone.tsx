import type { CSSProperties } from "react";

/** DALOLAT ilovasi ekranlari: iPhone ramkasi ichida navbatma-navbat almashadi (faqat CSS animatsiya). */
const SCREENS = [
  { src: "/images/dalolat/feed.webp", alt: "DALOLAT ilovasi: nomzodlar lentasi" },
  { src: "/images/dalolat/candidate.webp", alt: "DALOLAT ilovasi: nomzod profili" },
  { src: "/images/dalolat/profile.webp", alt: "DALOLAT ilovasi: shaxsiy profil" },
  { src: "/images/dalolat/splash.webp", alt: "DALOLAT ilovasining ochilish ekrani" },
];

export default function DalolatPhone({ className = "" }: { className?: string }) {
  return (
    <div className={`dl-phone ${className}`}>
      <span className="dl-phone-btn dl-phone-btn-a" aria-hidden="true" />
      <span className="dl-phone-btn dl-phone-btn-b" aria-hidden="true" />
      <span className="dl-phone-btn dl-phone-btn-c" aria-hidden="true" />
      <div className="dl-phone-body">
        <div className="dl-phone-screen">
          {SCREENS.map((s, i) => (
            <img
              key={s.src}
              className="dl-screen"
              src={s.src}
              alt={i === 0 ? s.alt : ""}
              aria-hidden={i === 0 ? undefined : true}
              width={588}
              height={1278}
              loading="lazy"
              decoding="async"
              style={{ "--i": i } as CSSProperties}
            />
          ))}
          <span className="dl-phone-island" aria-hidden="true" />
          <span className="dl-phone-glare" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
