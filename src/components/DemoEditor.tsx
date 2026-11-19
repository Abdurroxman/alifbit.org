// Admin panelda demo suhbatni tahrirlash: qadamlar, bot xabarlari, karta, tugmalar va egasiga keladigan xabar.
// Natija yashirin `demo_json` maydoni orqali loyiha bilan birga saqlanadi; yonida saytdagi demo jonli ko'rinadi.
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DemoChat from "./DemoChat";
import { MoveButtons, moveItem } from "./AdminParts";
import type { DemoCard, DemoNode, DemoScript } from "../../shared/content";

const LIMITS = { nodes: 20, messages: 4, buttons: 4, lines: 8 };

const blankDemo = (): DemoScript => ({
  bot: "",
  start: "boshlash",
  nodes: [{ id: "boshlash", messages: [""], buttons: [] }],
});

/** Qadam id'si: kichik lotin harf, raqam va chiziqcha (server ham shunday tekshiradi). */
const cleanId = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(0, 40);

function freeId(nodes: DemoNode[]) {
  for (let n = nodes.length + 1; ; n++) {
    const id = `qadam-${n}`;
    if (!nodes.some((x) => x.id === id)) return id;
  }
}

/** Saqlashdan oldin ko'rinadigan xatolar: server qoidalari bilan bir xil. */
function problems(demo: DemoScript) {
  const list: string[] = [];
  const ids = new Set<string>();
  if (demo.bot.trim().length < 2) list.push("Bot nomini yozing.");
  for (const n of demo.nodes) {
    if (!n.id) list.push("Qadam id'si bo‘sh qolmasin.");
    else if (ids.has(n.id)) list.push(`«${n.id}» id'si ikki marta ishlatilgan.`);
    ids.add(n.id);
    if (!n.messages.some((m) => m.trim())) list.push(`«${n.id}» qadamida bot xabari yo‘q.`);
    if (n.card && !n.card.title.trim()) list.push(`«${n.id}» qadamidagi karta sarlavhasini yozing.`);
    if (n.owner && !n.owner.title.trim()) list.push(`«${n.id}» qadamidagi egasiga xabar sarlavhasini yozing.`);
    for (const b of n.buttons) if (!b.label.trim()) list.push(`«${n.id}» qadamida nomsiz tugma bor.`);
  }
  if (!ids.has(demo.start)) list.push("Demo qaysi qadamdan boshlanishini tanlang.");
  for (const n of demo.nodes)
    for (const b of n.buttons)
      if (b.label.trim() && !ids.has(b.next)) list.push(`«${b.label}» tugmasi qaysi qadamga o‘tishini tanlang.`);
  return list;
}

/** Saqlanadigan ko'rinish: bo'sh xabar va qatorlar tashlanadi, matnlar chetidagi bo'shliqsiz. */
function tidy(demo: DemoScript): DemoScript {
  const card = (c?: DemoCard) =>
    c ? { title: c.title.trim(), lines: c.lines.map((l) => l.trim()).filter(Boolean) } : undefined;
  return {
    bot: demo.bot.trim(),
    start: demo.start,
    nodes: demo.nodes.map((n) => ({
      id: n.id,
      messages: n.messages.map((m) => m.trim()).filter(Boolean),
      ...(n.card ? { card: card(n.card) } : {}),
      buttons: n.buttons.map((b) => ({ label: b.label.trim(), next: b.next })),
      ...(n.owner ? { owner: card(n.owner) } : {}),
    })),
  };
}

function CardFields({
  label,
  card,
  onChange,
}: {
  label: string;
  card: DemoCard | undefined;
  onChange: (c: DemoCard | undefined) => void;
}) {
  return (
    <div className="ad-demo-card">
      <label className="ad-check">
        <input
          type="checkbox"
          checked={!!card}
          onChange={(e) => onChange(e.target.checked ? { title: "", lines: [] } : undefined)}
        />
        {label}
      </label>
      {card && (
        <div className="ad-grid">
          <label className="field">
            <span>Sarlavha</span>
            <input className="input" value={card.title} maxLength={120} onChange={(e) => onChange({ ...card, title: e.target.value })} />
          </label>
          <label className="field">
            <span>Qatorlar — har biri yangi satrda (8 tagacha)</span>
            <textarea
              className="input"
              rows={3}
              value={card.lines.join("\n")}
              onChange={(e) => onChange({ ...card, lines: e.target.value.split("\n").slice(0, LIMITS.lines) })}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default function DemoEditor({ initial }: { initial?: DemoScript }) {
  const [demo, setDemo] = useState<DemoScript | null>(initial || null);
  const [json, setJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [preview, setPreview] = useState(0);
  // Ochiq turgan qadamlar (tartib raqami bo'yicha); boshida hammasi yig'ilgan.
  const [opened, setOpened] = useState<number[]>(initial ? [] : [0]);

  useEffect(() => {
    setJson(demo ? JSON.stringify(tidy(demo), null, 2) : "");
  }, [demo]);

  if (!demo)
    return (
      <div className="ad-demo-empty">
        <h3>Demo suhbat</h3>
        <p className="ad-hint">Demo bo‘lmasa, sahifada bosib ko‘riladigan suhbat chiqmaydi.</p>
        <input type="hidden" name="demo_json" value="" />
        <button
          type="button"
          className="button button-outline"
          onClick={() => {
            setDemo(blankDemo());
            setOpened([0]);
          }}
        >
          Demo qo‘shish
          <span className="button-icon" aria-hidden="true">
            <Plus size={16} />
          </span>
        </button>
      </div>
    );

  const issues = problems(demo);
  const ids = demo.nodes.map((n) => n.id);
  const setNode = (i: number, patch: Partial<DemoNode>) =>
    setDemo({ ...demo, nodes: demo.nodes.map((n, j) => (j === i ? { ...n, ...patch } : n)) });
  // Id almashsa, boshlanish va unga olib boradigan tugmalar ham yangi id'ga o'tadi.
  const rename = (i: number, raw: string) => {
    const old = demo.nodes[i].id;
    const id = cleanId(raw);
    setDemo({
      ...demo,
      start: demo.start === old ? id : demo.start,
      nodes: demo.nodes.map((n, j) => ({
        ...n,
        id: j === i ? id : n.id,
        buttons: n.buttons.map((b) => (b.next === old ? { ...b, next: id } : b)),
      })),
    });
  };

  return (
    <div className="ad-demo">
      <input type="hidden" name="demo_json" value={JSON.stringify(tidy(demo))} />
      <div className="ad-demo-edit">
        <h3>Demo suhbat</h3>
        <div className="ad-grid">
          <label className="field">
            <span>Bot nomi *</span>
            <input className="input" value={demo.bot} maxLength={60} onChange={(e) => setDemo({ ...demo, bot: e.target.value })} />
          </label>
          <label className="field">
            <span>Qaysi qadamdan boshlanadi</span>
            <select className="input" value={demo.start} onChange={(e) => setDemo({ ...demo, start: e.target.value })}>
              {ids.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
        </div>

        {demo.nodes.map((n, i) => (
          <details className="ad-package ad-demo-node" key={i} open={opened.includes(i)}>
            <summary
              onClick={(e) => {
                e.preventDefault();
                setOpened(opened.includes(i) ? opened.filter((x) => x !== i) : [...opened, i]);
              }}
            >
              <b>
                {i + 1}. {n.id || "—"}
              </b>
              {n.id === demo.start && <em>boshlanish</em>}
              {n.buttons.length === 0 && <em>oxiri</em>}
              <span>{n.messages[0] || "Bot xabari yo‘q"}</span>
            </summary>
            <MoveButtons
              index={i}
              count={demo.nodes.length}
              onMove={(step) => {
                setDemo({ ...demo, nodes: moveItem(demo.nodes, i, step) });
                setOpened(opened.map((x) => (x === i ? i + step : x === i + step ? i : x)));
              }}
            />
            <label className="field">
              <span>Id — tugmalar shu nom bilan shu qadamga olib boradi</span>
              <input className="input" value={n.id} maxLength={40} onChange={(e) => rename(i, e.target.value)} />
            </label>

            <div className="ad-demo-list">
              <span className="ad-demo-label">Bot xabarlari</span>
              {n.messages.map((m, k) => (
                <div className="ad-demo-row" key={k}>
                  <textarea
                    className="input"
                    rows={2}
                    value={m}
                    maxLength={600}
                    aria-label={`Bot xabari ${k + 1}`}
                    onChange={(e) => setNode(i, { messages: n.messages.map((x, j) => (j === k ? e.target.value : x)) })}
                  />
                  {n.messages.length > 1 && (
                    <button
                      type="button"
                      className="ad-icon-btn"
                      aria-label="Xabarni olib tashlash"
                      onClick={() => setNode(i, { messages: n.messages.filter((_, j) => j !== k) })}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              {n.messages.length < LIMITS.messages && (
                <button type="button" className="ad-add" onClick={() => setNode(i, { messages: [...n.messages, ""] })}>
                  <Plus size={15} /> Xabar qo‘shish
                </button>
              )}
            </div>

            <CardFields label="Xabar ostida karta (buyurtma, jadval qatori…)" card={n.card} onChange={(card) => setNode(i, { card })} />

            <div className="ad-demo-list">
              <span className="ad-demo-label">Mijoz bosadigan tugmalar — tugmasiz qadam demo oxiri bo‘ladi</span>
              {n.buttons.map((b, k) => (
                <div className="ad-demo-row ad-demo-button" key={k}>
                  <input
                    className="input"
                    value={b.label}
                    maxLength={60}
                    placeholder="Tugma matni"
                    aria-label={`Tugma ${k + 1} matni`}
                    onChange={(e) => setNode(i, { buttons: n.buttons.map((x, j) => (j === k ? { ...x, label: e.target.value } : x)) })}
                  />
                  <select
                    className="input"
                    value={ids.includes(b.next) ? b.next : ""}
                    aria-label={`Tugma ${k + 1} qaysi qadamga o‘tadi`}
                    onChange={(e) => setNode(i, { buttons: n.buttons.map((x, j) => (j === k ? { ...x, next: e.target.value } : x)) })}
                  >
                    <option value="">→ qadamni tanlang</option>
                    {ids.map((id) => (
                      <option key={id} value={id}>
                        → {id}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="ad-icon-btn"
                    aria-label="Tugmani olib tashlash"
                    onClick={() => setNode(i, { buttons: n.buttons.filter((_, j) => j !== k) })}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {n.buttons.length < LIMITS.buttons && (
                <button type="button" className="ad-add" onClick={() => setNode(i, { buttons: [...n.buttons, { label: "", next: "" }] })}>
                  <Plus size={15} /> Tugma qo‘shish
                </button>
              )}
            </div>

            <CardFields label="Shu qadamda egasiga keladigan xabar" card={n.owner} onChange={(owner) => setNode(i, { owner })} />

            {demo.nodes.length > 1 && (
              <button
                type="button"
                className="ad-remove"
                onClick={() => {
                  setOpened(opened.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x)));
                  const nodes = demo.nodes.filter((_, j) => j !== i);
                  setDemo({ ...demo, nodes, start: demo.start === n.id ? nodes[0].id : demo.start });
                }}
              >
                <Trash2 size={15} /> Qadamni olib tashlash
              </button>
            )}
          </details>
        ))}

        <div className="ad-demo-actions">
          {demo.nodes.length < LIMITS.nodes && (
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setDemo({ ...demo, nodes: [...demo.nodes, { id: freeId(demo.nodes), messages: [""], buttons: [] }] });
                setOpened([...opened, demo.nodes.length]);
              }}
            >
              Qadam qo‘shish
              <span className="button-icon" aria-hidden="true">
                <Plus size={16} />
              </span>
            </button>
          )}
          <button
            type="button"
            className="ad-remove"
            onClick={() => {
              if (window.confirm("Demo suhbat butunlay olib tashlansinmi? Loyihani saqlaganingizdan keyin u saytdan ham yo‘qoladi.")) setDemo(null);
            }}
          >
            <Trash2 size={15} /> Demoni olib tashlash
          </button>
        </div>

        <details className="ad-demo-json">
          <summary>JSON ko‘rinishi</summary>
          <p className="ad-hint">Demoni boshqa loyihadan ko‘chirish yoki bir yo‘la almashtirish uchun. To‘g‘ri JSON kiritilsa, yuqoridagi maydonlar darhol yangilanadi.</p>
          <textarea
            className="input"
            rows={10}
            value={json}
            spellCheck={false}
            onChange={(e) => {
              setJson(e.target.value);
              try {
                const next = JSON.parse(e.target.value) as DemoScript;
                if (!next || typeof next.bot !== "string" || !Array.isArray(next.nodes)) throw new Error();
                setJsonError("");
                setDemo({
                  bot: next.bot,
                  start: String(next.start || ""),
                  nodes: next.nodes.map((n) => ({
                    id: String(n.id || ""),
                    messages: Array.isArray(n.messages) && n.messages.length ? n.messages.map(String) : [""],
                    buttons: Array.isArray(n.buttons) ? n.buttons.map((b) => ({ label: String(b.label || ""), next: String(b.next || "") })) : [],
                    ...(n.card ? { card: { title: String(n.card.title || ""), lines: (n.card.lines || []).map(String) } } : {}),
                    ...(n.owner ? { owner: { title: String(n.owner.title || ""), lines: (n.owner.lines || []).map(String) } } : {}),
                  })),
                });
              } catch {
                setJsonError("JSON hali to‘liq emas yoki xato — yuqoridagi maydonlar o‘zgarmadi.");
              }
            }}
          />
          {jsonError && <p className="form-error">{jsonError}</p>}
        </details>
      </div>

      <aside className="ad-demo-preview">
        <div className="ad-demo-preview-head">
          <span className="ad-demo-label">Saytda shunday ko‘rinadi</span>
          <button type="button" className="ad-add" onClick={() => setPreview((v) => v + 1)}>
            Qayta boshlash
          </button>
        </div>
        {issues.length ? (
          <ul className="ad-demo-issues" role="status">
            {issues.slice(0, 6).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ) : (
          <DemoChat key={`${preview}-${JSON.stringify(tidy(demo))}`} demo={tidy(demo)} />
        )}
      </aside>
    </div>
  );
}
