import {
  AudioLines,
  ArrowUpRight,
  BookOpen,
  Play,
  ChevronRight,
  Check,
  Layers,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "./Brand";
export default function ProjectArt({
  kind,
  large = false,
}: {
  kind: string;
  large?: boolean;
}) {
  return (
    <div
      className={`project-art art-${["dalolat", "voice", "academy", "library", "films", "render"].includes(kind) ? kind : "custom"} ${large ? "art-large" : ""}`}
      aria-hidden="true"
    >
      {kind === "dalolat" ? (
        <>
          <div className="art-grid" />
          <div className="art-dalolat-word">
            DALOLAT<span>Raqamli imkoniyatlar.</span>
          </div>
          <div className="phone phone-back">
            <div className="phone-island" />
            <div className="phone-top">
              <span>D.</span>
              <span>•••</span>
            </div>
            <div className="phone-greeting">Xush kelibsiz</div>
            <div className="phone-big">
              Siz uchun.
              <br />
              Har kuni.
            </div>
            <div className="phone-tile">
              <Layers size={19} />
              <span>
                Yangi imkoniyatlar<small>Bir joyda jamlangan.</small>
              </span>
            </div>
            <div className="phone-row">
              <div />
              <div />
            </div>
            <div className="phone-bar" />
            <div className="phone-bottom">
              Bosh sahifa <span>◦</span> Loyihalar
            </div>
          </div>
          <span className="art-caption">MAHSULOT KONSEPSIYASI</span>
        </>
      ) : kind === "voice" ? (
        <>
          <div className="voice-orbit" />
          <div className="voice-sheet">
            <div className="voice-sheet-head">
              <span className="voice-dot" />
              <span>Ovozdan matnga</span>
              <AudioLines size={18} />
            </div>
            <div className="waveform">
              {Array.from({ length: 39 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    height: `${14 + Math.sin(i * 1.7) ** 2 * 48 + Math.sin(i * 0.4) ** 2 * 20}px`,
                    animationDelay: `${i * 0.035}s`,
                  }}
                />
              ))}
            </div>
            <div className="voice-line">Har bir fikr — yangi imkoniyat.</div>
            <div className="voice-line light">
              Ovozingizda qolgan g‘oyalarni
            </div>
            <div className="voice-line light">yozma bilimga aylantiring.</div>
            <div className="voice-sheet-foot">
              <span>
                <Check size={13} /> Matnga yangi nazar
              </span>
              <span>UZ</span>
            </div>
          </div>
          <span className="art-caption">OVOZ. MATN. MA’NO.</span>
        </>
      ) : kind === "academy" ? (
        <>
          <div className="academy-orbit" />
          <div className="academy-window">
            <div className="academy-logo">
              <BrandMark />
              <span>AlifBit Academy</span>
            </div>
            <small>O‘RGANISH — BIRINCHI QADAM.</small>
            <h3>
              Bugungi bilim.
              <br />
              Ertangi imkoniyat.
            </h3>
            <div className="academy-progress">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="academy-course">
              <BookOpen size={22} />
              <span>
                Bilimdan amaliyotga<small>Izchil o‘rganish yondashuvi</small>
              </span>
              <ChevronRight size={16} />
            </div>
          </div>
        </>
      ) : kind === "library" ? (
        <>
          <div className="book book-one">
            <div className="book-mark">ALIFBIT LIBRARY</div>
            <span>
              Ilmga
              <br />
              ochilgan
              <br />
              <em>eshik.</em>
            </span>
            <BookOpen size={30} />
            <small>MUQOVA KONSEPSIYASI</small>
          </div>
          <div className="book book-two">
            <small>ALIFBIT</small>
            <span>
              Fikr.
              <br />
              Bilim.
              <br />
              Hayot.
            </span>
          </div>
        </>
      ) : kind === "films" ? (
        <>
          <div className="arch arch-back" />
          <div className="arch arch-front" />
          <div className="film-title">
            <small>ALIFBIT FILMS</small>
            <span>
              Tarixga
              <br />
              <em>yangi nigoh.</em>
            </span>
          </div>
          <span className="film-play">
            <Play fill="currentColor" size={19} />
          </span>
          <span className="art-caption">VIZUAL KONSEPSIYA</span>
        </>
      ) : kind === "render" ? (
        <>
          <div className="render-sun" />
          <div className="render-floor" />
          <div className="render-cube cube-one" />
          <div className="render-cube cube-two" />
          <div className="render-column" />
          <span className="render-label">
            Shakl.
            <br />
            Yorug‘lik.
            <br />
            Mukammallik.
          </span>
          <span className="art-caption">3D KOMPOZITSIYA · KONSEPT</span>
        </>
      ) : (
        <div className="custom-art">
          <Sparkles size={40} />
          <span>AlifBit</span>
          <ArrowUpRight />
        </div>
      )}
    </div>
  );
}
