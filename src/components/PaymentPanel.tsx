import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { api } from "../lib/api";

/** pay.alifbit.org qaytaradigan buyurtma holati (summalar tiyinda). */
export type PayOrder = {
  id: string;
  reference: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  refunded_amount: number;
  remaining_amount: number;
  progress: string;
  pay_url: string;
  invoices: Array<{ no: number; kind: string; title: string; amount: number; status: string }>;
};

const INVOICE_STATUS: Record<string, string> = {
  open: "Kutilmoqda",
  paid: "To‘langan",
  cancelled: "Bekor qilingan",
  refunded: "Qaytarilgan",
};

const sum = (tiyin: number) =>
  `${Math.round(tiyin / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so‘m`;

/** «1 500 000», «1500000» yoki «1.500.000» ko'rinishidagi matndan butun so'm. */
const parseSum = (value: string) => {
  const digits = value.replace(/[\s.,'’]/g, "");
  return /^\d{1,11}$/.test(digits) ? Number(digits) : NaN;
};

const post = (data?: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(data ?? {}),
});

export function parsePayData(value: string | null | undefined): PayOrder | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as PayOrder;
  } catch {
    return null;
  }
}

/** Murojaat sahifasidagi to'lov bloki: havola yaratish, holatni ko'rish, qoldiq to'lovini ochish. */
export default function PaymentPanel({
  orderId,
  initial,
  onChanged,
}: {
  orderId: string;
  initial: PayOrder | null;
  onChanged: () => void;
}) {
  const [pay, setPay] = useState<PayOrder | null>(initial);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [advanceMode, setAdvanceMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api<{ configured: boolean }>("/api/admin/payments")
      .then((r) => setConfigured(r.configured))
      .catch(() => setConfigured(false));
  }, []);

  async function run(path: string, init: RequestInit) {
    setBusy(true);
    setError("");
    try {
      setPay(await api<PayOrder>(`/api/admin/orders/${orderId}/payment${path}`, init));
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const total = parseSum(String(form.get("total") || ""));
    const advance = advanceMode ? parseSum(String(form.get("advance") || "")) : undefined;
    if (!Number.isFinite(total) || (advanceMode && !Number.isFinite(advance))) {
      setError("Summani so‘mda, faqat raqam bilan kiriting.");
      return;
    }
    void run("", post(advanceMode ? { total, advance } : { total }));
  }

  async function copy() {
    if (!pay) return;
    try {
      await navigator.clipboard.writeText(pay.pay_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Havolani nusxalab bo‘lmadi. Uni qo‘lda belgilab oling.");
    }
  }

  if (!pay)
    return (
      <section className="ad-panel">
        <h3>To‘lov</h3>
        {configured === false ? (
          <p className="ad-help">To‘lov markazi hali ulanmagan.</p>
        ) : (
          <form className="ad-pay-form" onSubmit={create}>
            <label className="field">
              <span>Kelishilgan narx, so‘m</span>
              <input className="input" name="total" inputMode="numeric" placeholder="1 500 000" required disabled={busy} />
            </label>
            <label className="ad-toggle">
              <input type="checkbox" checked={advanceMode} onChange={(e) => setAdvanceMode(e.target.checked)} disabled={busy} />
              <span className="ad-switch" aria-hidden="true" />
              <span>Avval avans</span>
            </label>
            {advanceMode && (
              <label className="field">
                <span>Avans, so‘m</span>
                <input className="input" name="advance" inputMode="numeric" placeholder="500 000" required disabled={busy} />
              </label>
            )}
            {error && <p className="ad-pay-error">{error}</p>}
            <button className="button" disabled={busy || configured === null}>
              To‘lov havolasini yaratish
              <span className="button-icon" aria-hidden="true">
                {busy ? <LoaderCircle className="spin" size={15} /> : <Plus size={15} />}
              </span>
            </button>
          </form>
        )}
      </section>
    );

  const allocated = pay.invoices.filter((i) => i.status === "open" || i.status === "paid").reduce((t, i) => t + i.amount, 0);
  const canOpenBalance = pay.status === "active" && pay.total_amount - allocated > 0;

  return (
    <section className="ad-panel">
      <div className="ad-pay-head">
        <h3>To‘lov</h3>
        <button type="button" className="ad-icon-btn" onClick={() => run("/refresh", post())} disabled={busy} aria-label="To‘lov holatini yangilash">
          {busy ? <LoaderCircle className="spin" size={16} /> : <RefreshCw size={16} />}
        </button>
      </div>
      <dl className="ad-dl">
        <div>
          <dt>Buyurtma</dt>
          <dd>{pay.reference}</dd>
        </div>
        <div>
          <dt>Narx</dt>
          <dd>{sum(pay.total_amount)}</dd>
        </div>
        <div>
          <dt>To‘langan</dt>
          <dd>
            <strong>{sum(pay.paid_amount)}</strong>
            {pay.refunded_amount > 0 && <small className="ad-pay-muted"> · qaytarilgan {sum(pay.refunded_amount)}</small>}
          </dd>
        </div>
        <div>
          <dt>Qoldiq</dt>
          <dd>{sum(pay.remaining_amount)}</dd>
        </div>
      </dl>
      <ul className="ad-pay-invoices">
        {pay.invoices.map((i) => (
          <li key={i.no} className={`is-${i.status}`}>
            <span>
              {i.title} <small>№ {i.no}</small>
            </span>
            <strong>{sum(i.amount)}</strong>
            <em>{INVOICE_STATUS[i.status] || i.status}</em>
          </li>
        ))}
      </ul>
      <div className="ad-pay-link">
        <input className="input" value={pay.pay_url} readOnly aria-label="Mijoz uchun to‘lov havolasi" onFocus={(e) => e.target.select()} />
        <button type="button" className="ad-icon-btn" onClick={copy} aria-label="Havolani nusxalash">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <a className="ad-icon-btn" href={pay.pay_url} target="_blank" rel="noopener noreferrer" aria-label="To‘lov sahifasini ochish">
          <ArrowUpRight size={16} />
        </a>
      </div>
      {canOpenBalance && (
        <button type="button" className="ad-btn-plain" onClick={() => run("/balance", post())} disabled={busy}>
          <Plus size={15} /> Qoldiq to‘lovini ochish ({sum(pay.total_amount - allocated)})
        </button>
      )}
      {error && <p className="ad-pay-error">{error}</p>}
    </section>
  );
}
