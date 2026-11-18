import type { CSSProperties } from "react";

/**
 * Saytdagi 3D modellardan (public/models) old tomondan render qilingan ramkalar.
 * `screen` — ramka rasmidagi ekran teshigi, foizda: skrinshot shu joyga, ramka ostiga qo'yiladi.
 */
const FRAMES = {
  laptop: {
    src: "/images/devices/laptop-frame.webp",
    ratio: 1447 / 1182,
    screen: { left: 7.72, top: 4.903, width: 84.49, height: 61.152 },
  },
  phone: {
    src: "/images/devices/phone-frame.webp",
    ratio: 562 / 1164,
    screen: { left: 3.57, top: 1.395, width: 92.806, height: 97.242 },
  },
} as const;

type Kind = keyof typeof FRAMES;

function Device({ kind, shot, alt }: { kind: Kind; shot: string; alt: string }) {
  const f = FRAMES[kind];
  const s = f.screen;
  return (
    <div className={`dm-device dm-${kind}`} style={{ aspectRatio: String(f.ratio) } as CSSProperties}>
      <img
        className="dm-shot"
        src={shot}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%`, height: `${s.height}%` }}
      />
      <img className="dm-frame" src={f.src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
    </div>
  );
}

/** Noutbuk va telefon ekranida skrinshot. Faqat bittasi berilsa, o'sha qurilma markazda turadi. */
export default function DeviceMock({ laptop, phone, name }: { laptop?: string; phone?: string; name: string }) {
  if (!laptop && !phone) return null;
  const layout = laptop && phone ? "both" : laptop ? "laptop" : "phone";
  return (
    <div className={`dm dm-${layout}`}>
      {laptop && <Device kind="laptop" shot={laptop} alt={`${name} — kompyuter ekrani`} />}
      {phone && <Device kind="phone" shot={phone} alt={`${name} — telefon ekrani`} />}
    </div>
  );
}
