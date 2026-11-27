import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import { tr } from "../lib/i18n";

const QUESTION = tr("Ertaga ertalab qabulingizga yozilsam bo‘ladimi? Narxi qancha?");
const ANSWER = tr(
  "Ha, ertaga ertalab bo‘sh vaqt bor. Narxi xizmat turiga bog‘liq — qaysi xizmat kerakligini ayting, aniq narxini aytaman. Ismingiz va telefon raqamingizni qoldirsangiz, arizangizni menejerga yuboraman.",
);
const WORD_MS = 90;

/** AI yordamchi misoli: mijoz savoli so'zma-so'z yoziladi, keyin yordamchi javobi chiqadi. */
export default function AiPrompt() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const words = QUESTION.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`ai-prompt ${on ? "is-on" : ""}`}
      ref={ref}
      style={{ "--answer-delay": `${words.length * WORD_MS + 500}ms` } as CSSProperties}
    >
      <span className="ai-prompt-label">{tr("Masalan")}</span>
      <p className="ai-q">
        <span className="ai-who">{tr("Mijoz")}</span>
        <span className="ai-q-text">
          «
          {words.map((w, i) => (
            <span key={i} className="ai-word" style={{ "--w": `${i * WORD_MS}ms` } as CSSProperties}>
              {i < words.length - 1 ? `${w} ` : w}
            </span>
          ))}
          »
        </span>
      </p>
      <div className="ai-a">
        <span className="ai-who">
          <Sparkles size={15} aria-hidden="true" /> {tr("AI yordamchi")}
        </span>
        <p>{ANSWER}</p>
      </div>
    </div>
  );
}
