import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { DemoCard, DemoNode, DemoScript } from "../../shared/content";
import { tr } from "../lib/i18n";

type Entry =
  | { kind: "bot"; text: string }
  | { kind: "user"; text: string }
  | { kind: "card"; card: DemoCard };

type OwnerEntry = { card: DemoCard; key: number };

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Bot xabarini «yozish» davomiyligi: matn uzunligiga qarab, lekin cheklangan. */
const typingTime = (text: string) => Math.min(1400, 450 + text.length * 9);

function Card({ card, className }: { card: DemoCard; className: string }) {
  return (
    <div className={className}>
      <b>{card.title}</b>
      {card.lines.length > 0 && (
        <ul>
          {card.lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Bosib ko'riladigan bot suhbati. Mehmon tugmani bosadi, bot «yozmoqda» holatidan keyin javob beradi,
 * yonidagi panelda esa shu qadamda egasiga keladigan yozuv paydo bo'ladi. Hammasi brauzerda, serversiz.
 */
export default function DemoChat({ demo }: { demo: DemoScript }) {
  const root = useRef<HTMLDivElement>(null);
  const feed = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const ownerSeq = useRef(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [owner, setOwner] = useState<OwnerEntry[]>([]);
  const [node, setNode] = useState<DemoNode | null>(null);
  const [typing, setTyping] = useState(false);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const play = useCallback(
    (id: string) => {
      const next = demo.nodes.find((n) => n.id === id);
      if (!next) return;
      clear();
      setReady(false);
      setNode(next);
      const instant = reduceMotion();
      let at = instant ? 0 : 250;
      next.messages.forEach((text) => {
        if (!instant) {
          later(() => setTyping(true), at);
          at += typingTime(text);
        }
        later(() => {
          setTyping(false);
          setEntries((e) => [...e, { kind: "bot", text }]);
        }, at);
        at += instant ? 0 : 180;
      });
      later(() => {
        if (next.card) setEntries((e) => [...e, { kind: "card", card: next.card as DemoCard }]);
        if (next.owner) {
          const card = next.owner;
          setOwner((o) => [{ card, key: ++ownerSeq.current }, ...o]);
        }
        setReady(true);
      }, at);
    },
    [demo],
  );

  const restart = useCallback(() => {
    clear();
    setEntries([]);
    setOwner([]);
    setTyping(false);
    play(demo.start);
  }, [demo, play]);

  // Demo mehmon unga yetib kelganda boshlanadi, aks holda animatsiya ko'rinmay o'tib ketadi.
  useEffect(() => {
    const el = root.current;
    if (!el || started) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (started) restart();
    return clear;
  }, [started, restart]);

  // Faqat suhbat oynasi pastga suriladi, sahifa emas.
  useEffect(() => {
    const el = feed.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion() ? "auto" : "smooth" });
  }, [entries, typing, ready]);

  function choose(label: string, next: string) {
    setEntries((e) => [...e, { kind: "user", text: label }]);
    setReady(false);
    play(next);
  }

  const done = ready && node && node.buttons.length === 0;
  return (
    <div className="demo" ref={root}>
      <div className="demo-phone">
        <div className="demo-head">
          <span className="demo-avatar" aria-hidden="true">
            {demo.bot.slice(0, 1)}
          </span>
          <span>
            <b>{demo.bot}</b>
            <small>{typing ? tr("yozmoqda…") : tr("bot")}</small>
          </span>
        </div>
        <div className="demo-feed" ref={feed} aria-live="polite">
          {entries.map((e, i) =>
            e.kind === "card" ? (
              <Card key={i} card={e.card} className="demo-card" />
            ) : (
              <p key={i} className={`demo-msg demo-${e.kind}`}>
                {e.text}
              </p>
            ),
          )}
          {typing && (
            <p className="demo-msg demo-bot demo-typing" aria-label={tr("Bot yozmoqda")}>
              <i />
              <i />
              <i />
            </p>
          )}
        </div>
        <div className="demo-keys">
          {!started && (
            <button type="button" className="demo-start" onClick={() => setStarted(true)}>
              {tr("Demoni boshlash")}
            </button>
          )}
          {ready &&
            node?.buttons.map((b) => (
              <button key={b.label + b.next} type="button" onClick={() => choose(b.label, b.next)}>
                {b.label}
              </button>
            ))}
          {done && (
            <button type="button" className="demo-restart" onClick={restart}>
              <RotateCcw size={15} aria-hidden="true" />
              {tr("Qaytadan")}
            </button>
          )}
        </div>
      </div>
      <div className="demo-owner">
        <div className="demo-owner-head">
          <b>{tr("Siz ko‘rasiz")}</b>
          {started && !done && owner.length > 0 && (
            <button type="button" className="demo-reset" onClick={restart}>
              <RotateCcw size={14} aria-hidden="true" />
              {tr("Qaytadan")}
            </button>
          )}
        </div>
        {owner.length === 0 ? (
          <p className="demo-owner-empty">{tr("Botdagi tugmalarni bosing. Sizga qanday xabar kelishini shu yerda ko‘rasiz.")}</p>
        ) : (
          <div className="demo-owner-list" aria-live="polite">
            {owner.map((o) => (
              <Card key={o.key} card={o.card} className="demo-note" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
