import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Bot,
  Briefcase,
  Bug,
  Building2,
  ChartColumn,
  ClipboardList,
  CreditCard,
  Database,
  Eye,
  FileCheck,
  FileText,
  Gauge,
  Globe,
  Layers,
  LifeBuoy,
  MessageCircle,
  Monitor,
  MousePointerClick,
  Palette,
  PenTool,
  Plug,
  ScanSearch,
  Search,
  Send,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { accentStyle } from "../lib/accent";

const ICONS: Record<string, LucideIcon> = {
  Bell,
  Bot,
  Briefcase,
  Bug,
  Building2,
  ChartColumn,
  ClipboardList,
  CreditCard,
  Database,
  Eye,
  FileCheck,
  FileText,
  Gauge,
  Globe,
  Layers,
  LifeBuoy,
  MessageCircle,
  Monitor,
  MousePointerClick,
  Palette,
  PenTool,
  Plug,
  ScanSearch,
  Search,
  Send,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
  Workflow,
  Wrench,
};

/** Xizmat belgisi → chizmadagi belgi. */
export const SERVICE_GLYPH: Record<string, string> = {
  web: "Globe",
  telegram: "Send",
  ai: "Sparkles",
  app: "Smartphone",
  design: "PenTool",
  integration: "Plug",
  seo: "Search",
  support: "LifeBuoy",
  audit: "ScanSearch",
};

export type DiagramItem = {
  key: string;
  icon: string;
  label: string;
  title: string;
  text: string;
  /** Xizmat belgisi: tugun va uning chizig'i shu xizmat rangida. */
  accent?: string;
  to?: string;
};

type Wire = { d: string; accent?: string };

function Glyph({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = ICONS[name] || Sparkles;
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" />;
}

/** Chiziqlar konteyner o'lchami o'zgarganda qayta hisoblanadi; ekranga kirganda «chiziladi». */
function useWires(compute: (box: HTMLElement) => Wire[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [drawn, setDrawn] = useState(false);

  const measure = useCallback(() => {
    const box = ref.current;
    if (!box) return;
    setSize({ w: box.clientWidth, h: box.clientHeight });
    setWires(compute(box));
  }, [compute]);

  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    document.fonts?.ready.then(measure).catch(() => {});
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(box);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [measure]);

  return { ref, wires, size, drawn };
}

function rectIn(box: HTMLElement, el: Element) {
  const b = box.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
}

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} C${mx.toFixed(1)} ${y1.toFixed(1)} ${mx.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};

function Wires({ wires, size }: { wires: Wire[]; size: { w: number; h: number } }) {
  if (!size.w) return null;
  return (
    <svg className="fd-wires" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
      {wires.map((wire, i) => (
        <g key={i} style={accentStyle(wire.accent, { "--i": i } as CSSProperties)}>
          <path className="fd-wire-base" d={wire.d} />
          <path className="fd-wire-line" d={wire.d} pathLength={1} />
          <path className="fd-wire-comet" d={wire.d} pathLength={1} />
        </g>
      ))}
    </svg>
  );
}

function Frame({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div className={`fd-frame ${className}`}>
      <i className="fd-corner" />
      <i className="fd-corner" />
      <i className="fd-corner" />
      <i className="fd-corner" />
      {children}
    </div>
  );
}

function NodeText({ item }: { item: DiagramItem }) {
  return (
    <span className="fd-text">
      <small>{item.label}</small>
      <b>{item.to ? <Link to={item.to}>{item.title}</Link> : item.title}</b>
      <span>{item.text}</span>
    </span>
  );
}

/**
 * Markaziy tugun va uning atrofidagi tugunlar: har tugundan markazga egri chiziq boradi.
 * Telefonda tugunlar markaz ostida ro'yxat bo'lib turadi.
 */
export function HubDiagram({ center, items }: { center: { icon: string; label: string }; items: DiagramItem[] }) {
  const half = Math.ceil(items.length / 2);
  const left = items.slice(0, half);
  const right = items.slice(half);

  const compute = useCallback(
    (box: HTMLElement): Wire[] => {
      const hub = box.querySelector(".fd-hub-box");
      if (!hub || box.clientWidth < 960) return [];
      const c = rectIn(box, hub);
      const wires: Wire[] = [];
      box.querySelectorAll<HTMLElement>(".fd-node").forEach((node) => {
        const icon = node.querySelector(".fd-icon");
        if (!icon) return;
        const r = rectIn(box, icon);
        const side = node.dataset.side;
        const k = Number(node.dataset.k);
        const n = Number(node.dataset.n);
        const y2 = c.y + c.h / 2 + (k - (n - 1) / 2) * Math.min(14, (c.h - 24) / Math.max(1, n - 1));
        wires.push(
          side === "left"
            ? { d: curve(r.x + r.w, r.y + r.h / 2, c.x, y2), accent: node.dataset.accent }
            : { d: curve(r.x, r.y + r.h / 2, c.x + c.w, y2), accent: node.dataset.accent },
        );
      });
      return wires;
    },
    [],
  );
  const { ref, wires, size, drawn } = useWires(compute);

  const column = (list: DiagramItem[], side: "left" | "right") => (
    <ul className={`fd-col fd-col-${side}`}>
      {list.map((item, k) => (
        <li
          key={item.key}
          className="fd-node"
          data-side={side}
          data-k={k}
          data-n={list.length}
          data-accent={item.accent}
          style={accentStyle(item.accent)}
        >
          <span className="fd-icon">
            <Glyph name={item.icon} />
          </span>
          <NodeText item={item} />
        </li>
      ))}
    </ul>
  );

  return (
    <Frame className={`fd-hub ${drawn ? "is-drawn" : ""}`}>
      <div className="fd-stage" ref={ref}>
        <Wires wires={wires} size={size} />
        {column(left, "left")}
        <div className="fd-hub-center">
          <span className="fd-hub-box">
            <Glyph name={center.icon} size={40} />
          </span>
          <span className="fd-hub-label">{center.label}</span>
        </div>
        {column(right, "right")}
      </div>
    </Frame>
  );
}

/** Ketma-ket qadamlar: har tugundan keyingisiga chiziq; telefonda ustma-ust. */
export function ChainDiagram({ items, accent }: { items: DiagramItem[]; accent?: string }) {
  const compute = useCallback(
    (box: HTMLElement): Wire[] => {
      const icons = [...box.querySelectorAll(".fd-icon")].map((el) => rectIn(box, el));
      const wires: Wire[] = [];
      for (let i = 0; i < icons.length - 1; i++) {
        const a = icons[i];
        const b = icons[i + 1];
        const sameRow = Math.abs(a.y - b.y) < a.h / 2;
        wires.push({
          d: sameRow
            ? curve(a.x + a.w + 6, a.y + a.h / 2, b.x - 6, b.y + b.h / 2)
            : `M${a.x + a.w / 2} ${a.y + a.h + 6} L${b.x + b.w / 2} ${b.y - 6}`,
          accent,
        });
      }
      return wires;
    },
    [accent],
  );
  const { ref, wires, size, drawn } = useWires(compute);
  return (
    <Frame className={`fd-chain ${drawn ? "is-drawn" : ""}`}>
      <div className="fd-stage" ref={ref} style={accentStyle(accent)}>
        <Wires wires={wires} size={size} />
        <ol className="fd-steps">
          {items.map((item, i) => (
            <li key={item.key} className="fd-node" style={{ "--i": i } as CSSProperties}>
              <span className="fd-icon">
                <Glyph name={item.icon} />
              </span>
              <NodeText item={item} />
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  );
}
