import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, LoaderCircle, Minus, Square, X } from "lucide-react";
import { observeVisibility, prefersReducedMotion } from "../../lib/motion";

export type SadoMode = "exact" | "clean" | "prompt";
type Phase = "idle" | "press" | "listen" | "process" | "type" | "done";

export const MODES: Record<SadoMode, { name: string; desc: string; keys: string[]; spoken: string; result: string }> = {
  exact: {
    name: "Exact",
    desc: "So‘zlaringiz aytilganidek. Faqat tinish belgilari qo‘shiladi.",
    keys: ["Ctrl", "Alt", "1"],
    spoken: "ertaga hmm soat uchda uchrashuvni yani ofisda o‘tkazamiz",
    result: "Ertaga, hmm, soat uchda uchrashuvni, ya’ni, ofisda o‘tkazamiz.",
  },
  clean: {
    name: "Clean",
    desc: "Ortiqcha so‘z va takrorlar olib tashlanadi. Ma’no o‘zgarmaydi.",
    keys: ["Ctrl", "Alt", "2"],
    spoken: "ertaga hmm soat uchda uchrashuvni yani ofisda o‘tkazamiz",
    result: "Ertaga soat uchda uchrashuvni ofisda o‘tkazamiz.",
  },
  prompt: {
    name: "Prompt",
    desc: "Nutqingiz AI uchun tartibli topshiriqqa aylanadi.",
    keys: ["Ctrl", "Alt", "3"],
    spoken: "mijozga ertangi uchrashuv haqida xat yozib ber soat uchda ofisda rasmiyroq bo‘lsin",
    result:
      "Vazifa: mijozga ertangi uchrashuv haqida xat yoz.\nTafsilotlar: uchrashuv ertaga soat 15:00 da, ofisda.\nUslub: rasmiy va qisqa.",
  },
};
const ORDER: SadoMode[] = ["exact", "clean", "prompt"];
const NEXT: Record<Phase, [Phase, number]> = {
  idle: ["press", 700],
  press: ["listen", 450],
  listen: ["process", 0],
  process: ["type", 900],
  type: ["done", 0],
  done: ["idle", 2600],
};
const STATUS: Partial<Record<Phase, string>> = {
  listen: "Tinglayapman",
  process: "Ishlanmoqda",
  type: "Tayyor",
  done: "Tayyor",
};

export default function SadoDemo() {
  const [mode, setMode] = useState<SadoMode>("exact");
  const [phase, setPhase] = useState<Phase>("idle");
  const [words, setWords] = useState(0);
  const [chars, setChars] = useState(0);
  const [visible, setVisible] = useState(false);
  const [still] = useState(() => typeof window !== "undefined" && prefersReducedMotion());
  const root = useRef<HTMLDivElement>(null);
  const emblem = useRef<HTMLDivElement>(null);
  const script = MODES[mode];
  const spoken = script.spoken.split(" ");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    return observeVisibility(el, setVisible);
  }, []);

  // Harakat kamaytirilganda namuna yakuniy holatda turadi.
  useEffect(() => {
    if (!still) return;
    setPhase("done");
    setWords(spoken.length);
    setChars(script.result.length);
  }, [still, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bosqichlar ketma-ketligi.
  useEffect(() => {
    if (still || !visible) return;
    let timer = 0;
    if (phase === "listen") {
      timer = window.setInterval(() => {
        setWords((w) => {
          if (w >= spoken.length) {
            clearInterval(timer);
            setPhase("process");
            return w;
          }
          return w + 1;
        });
      }, mode === "prompt" ? 240 : 300);
      return () => clearInterval(timer);
    }
    if (phase === "type") {
      const step = mode === "prompt" ? 3 : 2;
      timer = window.setInterval(() => {
        setChars((c) => {
          if (c >= script.result.length) {
            clearInterval(timer);
            setPhase("done");
            return c;
          }
          return Math.min(script.result.length, c + step);
        });
      }, 28);
      return () => clearInterval(timer);
    }
    const [next, wait] = NEXT[phase];
    timer = window.setTimeout(() => {
      if (phase === "done") {
        setMode((m) => ORDER[(ORDER.indexOf(m) + 1) % ORDER.length]);
        setWords(0);
        setChars(0);
      }
      setPhase(next);
    }, wait);
    return () => clearTimeout(timer);
  }, [phase, visible, still, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tinglash paytida emblema halqalari ovoz balandligiga o'xshab tebranadi.
  useEffect(() => {
    const el = emblem.current;
    if (!el || phase !== "listen" || !visible) {
      el?.style.setProperty("--lvl", "0");
      return;
    }
    let frame = 0;
    let t = 0;
    const tick = () => {
      t += 1;
      const lvl = Math.abs(Math.sin(t * 0.21) * 0.6 + Math.sin(t * 0.077) * 0.4) * (0.55 + Math.random() * 0.45);
      el.style.setProperty("--lvl", lvl.toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, visible]);

  function pick(m: SadoMode) {
    setMode(m);
    setWords(still ? MODES[m].spoken.split(" ").length : 0);
    setChars(still ? MODES[m].result.length : 0);
    setPhase(still ? "done" : "idle");
  }

  const pressing = phase === "press" || phase === "listen";
  const typed = script.result.slice(0, chars);
  return (
    <div className="sd-demo" ref={root} data-phase={phase} data-mode={mode}>
      <div className="sd-window" aria-hidden="true">
        <div className="sd-titlebar">
          <span className="sd-app-dot" />
          <span>Hujjat.txt — Notepad</span>
          <span className="sd-win-btns">
            <Minus size={13} />
            <Square size={11} />
            <X size={13} />
          </span>
        </div>
        <div className="sd-doc">
          <p className={mode === "prompt" ? "is-prompt" : ""}>
            {typed}
            <i className="sd-caret" />
          </p>
        </div>
        <div className="sd-spoken" aria-hidden="true">
          {spoken.map((w, i) => (
            <span key={`${mode}-${i}`} className={i < words ? "is-on" : ""}>
              {w}
            </span>
          ))}
        </div>
        <div className="sd-overlay">
          <div className="sd-emblem" ref={emblem} data-state={phase}>
            <span className="sd-ring sd-ring-2" />
            <span className="sd-ring sd-ring-1" />
            <span className="sd-core">
              {phase === "process" && <LoaderCircle className="spin" size={14} />}
              {(phase === "type" || phase === "done") && <Check size={15} strokeWidth={2.6} />}
            </span>
          </div>
          <span className="sd-status">{STATUS[phase] ?? ""}</span>
        </div>
      </div>
      <div className="sd-keys" aria-hidden="true">
        {script.keys.map((k, i) => (
          <kbd key={k} className={pressing ? "is-down" : ""} style={{ "--k": i } as CSSProperties}>
            {k}
          </kbd>
        ))}
      </div>
      <div className="sd-modes" role="group" aria-label="Sado rejimlari">
        {ORDER.map((m) => (
          <button key={m} aria-pressed={mode === m} className={mode === m ? "is-active" : ""} onClick={() => pick(m)}>
            <b>{MODES[m].name}</b>
            <small>{MODES[m].desc}</small>
            <span className="sd-mode-bar" />
          </button>
        ))}
      </div>
    </div>
  );
}
