import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { afterIntro } from "../lib/motion";
import type { StageHandle, StageState } from "../three/types";

const DOCK_QUERY = "(min-width: 1024px)";

/** WebGL ishlaydimi — sahna yuklanishidan oldin arzon tekshiruv. */
function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const isDocked = () => typeof window !== "undefined" && matchMedia(DOCK_QUERY).matches;

/**
 * 3D noutbuk va telefon. Katta ekranda — hero va «Ishlar» bo'limlari ortida yopishib turadigan
 * qatlam (o'z joyida chiziladi, bo'limlar tugagach sahifa bilan birga chiqib ketadi);
 * telefonda — hero ichidagi `slot` blokka chiqariladi. three.js sahifa chizilgandan keyin
 * alohida yuklanadi; sahnaning canvas'i shu blokka ulanadi va sahifadan chiqilganda uziladi.
 */
export default function DeviceStage({ state, slot }: { state: StageState; slot: RefObject<HTMLDivElement | null> }) {
  const box = useRef<HTMLDivElement>(null);
  const handle = useRef<StageHandle | null>(null);
  const latest = useRef(state);
  const [docked, setDocked] = useState(isDocked);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slotEl, setSlotEl] = useState<HTMLDivElement | null>(null);
  latest.current = state;

  // Hero ichidagi joy keyinroq chiziladi: u tayyor bo'lgach telefon ko'rinishi o'sha yerga ulanadi.
  useEffect(() => setSlotEl(slot.current), [slot]);

  // Sahna modulini bir marta yuklaydi.
  useEffect(() => {
    if (!webglAvailable()) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    const media = matchMedia(DOCK_QUERY);
    const onMedia = () => setDocked(media.matches);
    media.addEventListener("change", onMedia);
    // Sarlavha va savollar avval chiziladi; qurilmalar kirish animatsiyasi tugagach «ochiladi».
    const start = () =>
      Promise.all([import("../three/scene"), afterIntro()])
        .then(([{ getScene }]) => {
          if (cancelled) return;
          handle.current = getScene({
            docked: media.matches,
            reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
          });
          setReady(true);
        })
        .catch(() => setFailed(true));
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 300);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
      media.removeEventListener("change", onMedia);
    };
  }, []);

  // Canvas joriy blokka ulanadi; joylashuv o'zgarsa (telefon ↔ katta ekran) qayta ulanadi.
  useEffect(() => {
    const h = handle.current;
    if (!ready || !h || !box.current) return;
    h.setDocked(docked);
    h.set(latest.current);
    h.attach(box.current);
    return () => h.detach();
  }, [ready, docked]);

  useEffect(() => {
    handle.current?.set(state);
  }, [state]);

  if (failed) return null;
  const stage = (
    <div ref={box} className={`stage ${ready ? "is-ready" : ""}`} data-section={state.section} aria-hidden="true" />
  );
  // Katta ekranda sahna Hero+Ishlar bo'yi cho'zilgan qatlam ichida yopishadi va uning oxirida to'xtaydi.
  if (docked) return <div className="stage-rail">{stage}</div>;
  return slotEl ? createPortal(stage, slotEl) : null;
}
