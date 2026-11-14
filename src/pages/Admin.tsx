import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  History,
  ImagePlus,
  Inbox,
  Layers,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import Brand, { BrandMark } from "../components/Brand";
import { Status } from "../components/Projects";
import { useContent } from "../App";
import { api } from "../lib/api";
import {
  initialProjects,
  orderStatuses,
  projectStatuses,
  type Project,
  type Service,
} from "../../shared/content";
import "../styles/admin.css";

type Order = {
  id: string;
  reference: string;
  name: string;
  contact: string;
  service: string;
  description: string;
  budget: string;
  deadline: string;
  status: string;
  created_at: string;
  attachment_key: string | null;
  attachment_name: string | null;
};
type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
};
type Audit = { id: number; action: string; entity_id: string; created_at: string };
type Tab = "overview" | "projects" | "orders" | "services" | "articles" | "categories" | "audit";

const blankProject = (): Project => ({
  ...initialProjects[0],
  id: crypto.randomUUID(),
  slug: "",
  name: "",
  summary: "",
  description: "",
  purpose: "",
  features: [],
  platforms: [],
  cover: "custom",
  url: "",
  published: false,
  status: "Ishlab chiqilmoqda",
});
const blankArticle = (): Article => ({
  id: crypto.randomUUID(),
  slug: "",
  title: "",
  summary: "",
  body: "",
  category: "Qaydlar",
  published: false,
});
const post = (data: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(data),
});
const formatDate = (value: string) => {
  const d = new Date(value + "Z");
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("uz-UZ");
};

const TITLES: Record<Tab, string> = {
  overview: "Umumiy ko‘rinish",
  projects: "Loyihalar",
  orders: "Murojaatlar",
  services: "Xizmatlar",
  articles: "Qaydlar",
  categories: "Kategoriyalar",
  audit: "Faoliyat tarixi",
};
const TABS: Array<[Tab, typeof Inbox]> = [
  ["overview", LayoutDashboard],
  ["projects", Layers],
  ["orders", Inbox],
  ["services", Settings2],
  ["articles", BookOpen],
  ["categories", Tags],
  ["audit", History],
];

function Login({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    try {
      await api("/api/admin/login", post({ password: new FormData(form).get("password") }));
      form.reset();
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="ad-login">
      <section className="ad-login-art" aria-hidden="true">
        <BrandMark />
        <p>
          Ilmdan g‘oyaga.
          <br />
          <em>G‘oyadan amalga.</em>
        </p>
      </section>
      <section className="ad-login-panel">
        <Link to="/" aria-label="AlifBit — bosh sahifa">
          <Brand />
        </Link>
        <form onSubmit={login} className="ad-login-form">
          <span className="ad-login-icon">
            <ShieldCheck size={22} strokeWidth={1.5} />
          </span>
          <small>ALIFBIT / BOSHQARUV</small>
          <h1>Xush kelibsiz.</h1>
          <p>Kontent va murojaatlarni boshqarish uchun kiring.</p>
          <label className="field">
            <span>Administrator paroli</span>
            <input className="input" name="password" type="password" autoComplete="current-password" required minLength={12} />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Tekshirilmoqda…" : "Boshqaruvga kirish"}
            <span className="button-icon" aria-hidden="true">
              {busy ? <LoaderCircle className="spin" size={15} /> : <ArrowUpRight size={15} />}
            </span>
          </button>
        </form>
        <Link className="ad-back" to="/">
          <ArrowLeft size={15} /> Saytga qaytish
        </Link>
      </section>
    </main>
  );
}

function Row({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button className="ad-row" onClick={onClick}>
      {children}
      <ChevronRight size={18} className="ad-row-arrow" />
    </button>
  );
}

function Publish({ on }: { on: boolean }) {
  return <span className={`ad-publish ${on ? "is-on" : ""}`}>{on ? "Nashrda" : "Qoralama"}</span>;
}

function Empty({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="ad-empty">
      <span>{icon}</span>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export default function Admin() {
  const { categories, refresh: refreshPublic } = useContent();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [notification, setNotification] = useState({ configured: false, pending: 0 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [edit, setEdit] = useState<Project | Service | Article | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("Barchasi");
  const [deleteId, setDeleteId] = useState("");
  const [categoryText, setCategoryText] = useState("");

  async function refresh() {
    try {
      const [p, s, o, a, n, l] = await Promise.all([
        api<Project[]>("/api/admin/projects"),
        api<Service[]>("/api/admin/services"),
        api<Order[]>("/api/admin/orders"),
        api<Article[]>("/api/admin/articles"),
        api<{ configured: boolean; pending: number }>("/api/admin/notifications"),
        api<Audit[]>("/api/admin/audit"),
      ]);
      setProjects(p);
      setServices(s);
      setOrders(o);
      setArticles(a);
      setNotification(n);
      setAudit(l);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    document.title = "Boshqaruv — AlifBit";
    api("/api/admin/session")
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false));
  }, []);
  useEffect(() => {
    if (authenticated) void refresh();
  }, [authenticated]);

  async function logout() {
    try {
      await api("/api/admin/logout", { method: "POST" });
      setAuthenticated(false);
      setEdit(null);
      setSelected(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function go(value: Tab) {
    setTab(value);
    setEdit(null);
    setSelected(null);
    setMessage("");
    setError("");
    setMenu(false);
    if (value === "categories") setCategoryText(categories.slice(1).join("\n"));
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const data: Record<string, unknown> = { ...edit };
    for (const [k, v] of form.entries()) data[k] = v;
    data.published = form.has("published");
    if (tab === "projects" || tab === "services")
      data.features = String(form.get("features") || "")
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean);
    if (tab === "projects")
      data.platforms = String(form.get("platforms") || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    try {
      await api(`/api/admin/${tab}`, post(data));
      setMessage("O‘zgarishlar saqlandi.");
      setEdit(null);
      refreshPublic();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Rasm 5 MB dan kichik bo‘lsin.");
      const result = await api<{ url: string }>("/api/admin/upload", {
        method: "POST",
        headers: { "content-type": file.type },
        body: file,
      });
      setEdit((value) => (value ? { ...value, cover: result.url } : null));
      setMessage("Muqova yuklandi. Loyihani saqlang.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function updateStatus(value: string) {
    if (!selected) return;
    setBusy(true);
    try {
      await api(`/api/admin/orders/${selected.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      setSelected({ ...selected, status: value });
      setMessage("Buyurtma holati yangilandi.");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function removeOrder() {
    if (!selected || deleteId !== selected.id) return;
    setBusy(true);
    try {
      await api(`/api/admin/orders/${selected.id}`, { method: "DELETE" });
      setSelected(null);
      setDeleteId("");
      setMessage("Murojaat va biriktirilgan fayl o‘chirildi.");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function saveCategories(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(
        "/api/admin/categories",
        post(
          categoryText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      );
      refreshPublic();
      setMessage("Kategoriyalar saqlandi.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (authenticated === null) return <div className="loading-page">Kirish tekshirilmoqda…</div>;
  if (!authenticated) return <Login onDone={() => setAuthenticated(true)} />;

  const newOrders = orders.filter((o) => o.status === "Yangi").length;
  const heading = edit
    ? "name" in edit
      ? edit.name || "Yangi loyiha"
      : edit.title || "Yangi qayd"
    : selected
      ? selected.reference
      : tab === "overview"
        ? "Xush kelibsiz."
        : TITLES[tab];
  const sub =
    tab === "overview"
      ? "Yangi g‘oyalar, tartibli kontent va yaxshi hamkorlik."
      : edit
        ? "Ma’lumotlarni to‘ldiring va saqlang. Nashr holatini o‘zingiz tanlaysiz."
        : tab === "orders"
          ? "Saytdan kelgan murojaatlar va ularning bajarilish holati."
          : "Saytingizdagi ma’lumotlarni shu yerdan boshqaring.";
  const filteredOrders = orders.filter(
    (o) =>
      (orderFilter === "Barchasi" || o.status === orderFilter) &&
      `${o.name} ${o.contact} ${o.reference}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className={`ad-shell ${menu ? "menu-open" : ""}`}>
      <aside className="ad-side">
        <div className="ad-side-head">
          <Link to="/" aria-label="AlifBit — bosh sahifa">
            <Brand light />
          </Link>
          <button className="ad-icon-btn ad-only-mobile" onClick={() => setMenu(false)} aria-label="Menyuni yopish">
            <X size={20} />
          </button>
        </div>
        <span className="ad-side-label">ISH MAYDONI</span>
        <nav aria-label="Boshqaruv menyusi">
          {TABS.map(([key, Icon]) => (
            <button key={key} className={tab === key ? "is-active" : ""} aria-current={tab === key ? "page" : undefined} onClick={() => go(key)}>
              <Icon size={18} strokeWidth={1.5} />
              {TITLES[key]}
              {key === "orders" && newOrders > 0 && <i>{newOrders}</i>}
            </button>
          ))}
        </nav>
        <div className="ad-side-foot">
          <a href="/" target="_blank" rel="noreferrer">
            Saytni ko‘rish <ArrowUpRight size={15} />
          </a>
          <button onClick={logout}>
            <LogOut size={15} /> Chiqish
          </button>
        </div>
      </aside>
      <button className="ad-backdrop" aria-label="Menyuni yopish" tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)} />
      <main className="ad-main">
        <header className="ad-top">
          <button className="ad-icon-btn ad-only-mobile" aria-label="Menyuni ochish" onClick={() => setMenu(true)}>
            <Menu size={20} />
          </button>
          <span className="ad-crumbs">
            AlifBit <i>/</i> Boshqaruv <i>/</i> <b>{TITLES[tab]}</b>
          </span>
          <span className="ad-owner">
            <i /> Administrator
          </span>
        </header>
        <div className="ad-content">
          <div className="ad-heading">
            <div>
              <small>ALIFBIT BOSHQARUV PANELI</small>
              <h1>{heading}</h1>
              <p>{sub}</p>
            </div>
            {!edit && !selected && (tab === "projects" || tab === "articles") && (
              <button className="button" onClick={() => setEdit(tab === "projects" ? blankProject() : blankArticle())}>
                {tab === "projects" ? "Loyiha qo‘shish" : "Qayd yozish"}
                <span className="button-icon" aria-hidden="true">
                  <Plus size={16} />
                </span>
              </button>
            )}
            {(edit || selected) && (
              <button
                className="button button-outline"
                onClick={() => {
                  setEdit(null);
                  setSelected(null);
                  setDeleteId("");
                }}
              >
                <ArrowLeft size={16} /> Ro‘yxatga qaytish
              </button>
            )}
          </div>

          {error && (
            <div className="form-error ad-flash" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="ad-success ad-flash" role="status">
              <Check size={16} /> {message}
            </div>
          )}

          {tab === "overview" && (
            <>
              <div className="ad-stats">
                {(
                  [
                    [newOrders, "Yangi murojaatlar", Inbox, "orders"],
                    [projects.filter((p) => p.published).length, "Nashrdagi loyihalar", Layers, "projects"],
                    [projects.filter((p) => !p.published).length, "Qoralama loyihalar", Settings2, "projects"],
                    [articles.filter((a) => a.published).length, "Nashrdagi qaydlar", BookOpen, "articles"],
                  ] as const
                ).map(([n, label, Icon, target]) => (
                  <button key={label} className="ad-stat" onClick={() => go(target)}>
                    <span className="ad-stat-icon">
                      <Icon size={19} strokeWidth={1.5} />
                    </span>
                    <strong>{n}</strong>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <section className="ad-panel">
                <div className="ad-panel-head">
                  <h2>Oxirgi murojaatlar</h2>
                  <button onClick={() => go("orders")}>
                    Barchasini ko‘rish <ArrowUpRight size={15} />
                  </button>
                </div>
                {orders.length ? (
                  <div className="ad-list">
                    {orders.slice(0, 5).map((o) => (
                      <Row
                        key={o.id}
                        onClick={() => {
                          go("orders");
                          setSelected(o);
                        }}
                      >
                        <span className="ad-row-main">
                          <strong>{o.name}</strong>
                          <small>{o.reference}</small>
                        </span>
                        <span className="ad-row-meta">{o.service}</span>
                        <Status value={o.status} />
                      </Row>
                    ))}
                  </div>
                ) : (
                  <Empty icon={<Inbox strokeWidth={1.3} />} title="Hozircha murojaatlar yo‘q.">
                    <p>Sayt orqali yuborilgan birinchi murojaat shu yerda ko‘rinadi.</p>
                    <Link to="/contact" target="_blank" className="text-link">
                      Murojaat shaklini ochish <ArrowUpRight size={15} />
                    </Link>
                  </Empty>
                )}
              </section>
              <div className={`ad-note ${notification.configured ? "is-ok" : ""}`}>
                <ShieldCheck size={22} strokeWidth={1.5} />
                <div>
                  <h3>{notification.configured ? "Bildirishnomalar ulangan." : "Telegram bildirishnomalari sozlanmagan."}</h3>
                  <p>
                    {notification.configured
                      ? `Yetkazilmagan bildirishnomalar: ${notification.pending}.`
                      : "Murojaatlar bazaga saqlanadi va shu panelda ko‘rinadi. Bildirishnoma uchun README’dagi Telegram sozlamalarini bajaring."}
                  </p>
                </div>
              </div>
            </>
          )}

          {!edit && !selected && tab === "projects" && (
            <section className="ad-panel ad-list">
              {projects.map((p) => (
                <Row key={p.id} onClick={() => setEdit(p)}>
                  <span className="ad-thumb">{p.name.slice(0, 1)}</span>
                  <span className="ad-row-main">
                    <strong>{p.name}</strong>
                    <small>/projects/{p.slug}</small>
                  </span>
                  <Status value={p.status} />
                  <Publish on={p.published} />
                </Row>
              ))}
            </section>
          )}

          {!edit && tab === "services" && (
            <section className="ad-panel ad-list">
              {services.map((s) => (
                <Row key={s.slug} onClick={() => setEdit(s)}>
                  <span className="ad-thumb">{s.number}</span>
                  <span className="ad-row-main">
                    <strong>{s.name}</strong>
                    <small>{s.short}</small>
                  </span>
                </Row>
              ))}
            </section>
          )}

          {!edit && tab === "articles" && (
            <section className="ad-panel ad-list">
              {articles.length ? (
                articles.map((a) => (
                  <Row key={a.id} onClick={() => setEdit(a)}>
                    <span className="ad-thumb">
                      <BookOpen size={17} />
                    </span>
                    <span className="ad-row-main">
                      <strong>{a.title}</strong>
                      <small>/journal/{a.slug}</small>
                    </span>
                    <Publish on={a.published} />
                  </Row>
                ))
              ) : (
                <Empty icon={<BookOpen strokeWidth={1.3} />} title="Yangi fikr uchun ochiq sahifa.">
                  <p>«Qayd yozish» orqali birinchi maqolangizni yarating.</p>
                </Empty>
              )}
            </section>
          )}

          {edit && (
            <form className="ad-editor" onSubmit={save}>
              {tab === "projects" ? (
                <ProjectEditor project={edit as Project} onUpload={upload} busy={busy} />
              ) : tab === "services" ? (
                <ServiceEditor service={edit as Service} />
              ) : (
                <ArticleEditor article={edit as Article} />
              )}
              <div className="ad-savebar">
                {tab !== "services" && (
                  <label className="ad-toggle">
                    <input name="published" type="checkbox" defaultChecked={"published" in edit && edit.published} />
                    <span className="ad-switch" aria-hidden="true" />
                    <span>Saytda nashr qilish</span>
                  </label>
                )}
                <button className="button" type="submit" disabled={busy}>
                  O‘zgarishlarni saqlash
                  <span className="button-icon" aria-hidden="true">
                    {busy ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}
                  </span>
                </button>
              </div>
            </form>
          )}

          {tab === "orders" && !selected && (
            <>
              <div className="ad-toolbar">
                <label className="ad-search">
                  <Search size={17} />
                  <input
                    className="input"
                    placeholder="Ism, manzil yoki murojaat raqami…"
                    aria-label="Murojaatlarni qidirish"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select className="input" aria-label="Murojaat holati" value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
                  {["Barchasi", ...orderStatuses].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <section className="ad-panel ad-list">
                {filteredOrders.map((o) => (
                  <Row
                    key={o.id}
                    onClick={() => {
                      setSelected(o);
                      setMessage("");
                    }}
                  >
                    <span className="ad-row-main">
                      <strong>{o.name}</strong>
                      <small>
                        {o.reference} · {formatDate(o.created_at)}
                      </small>
                    </span>
                    <span className="ad-row-meta">{o.service}</span>
                    <Status value={o.status} />
                  </Row>
                ))}
                {!orders.length && <Empty icon={<Inbox strokeWidth={1.3} />} title="Murojaatlar shu yerda to‘planadi." />}
              </section>
            </>
          )}

          {selected && (
            <div className="ad-order">
              <section className="ad-panel">
                <h2>{selected.name}</h2>
                <dl className="ad-dl">
                  <div>
                    <dt>Aloqa</dt>
                    <dd>{selected.contact}</dd>
                  </div>
                  <div>
                    <dt>Yo‘nalish</dt>
                    <dd>{selected.service}</dd>
                  </div>
                  <div>
                    <dt>Byudjet</dt>
                    <dd>{selected.budget || "Ko‘rsatilmagan"}</dd>
                  </div>
                  <div>
                    <dt>Muddat</dt>
                    <dd>{selected.deadline || "Ko‘rsatilmagan"}</dd>
                  </div>
                  <div>
                    <dt>Kelgan vaqt</dt>
                    <dd>{selected.created_at} UTC</dd>
                  </div>
                </dl>
                <h3>Loyiha tavsifi</h3>
                <p className="ad-description">{selected.description}</p>
                {selected.attachment_key && (
                  <a className="button button-outline" href={`/media/${selected.attachment_key}`} download>
                    {selected.attachment_name || "Biriktirilgan fayl"}
                    <span className="button-icon" aria-hidden="true">
                      <ArrowUpRight size={15} />
                    </span>
                  </a>
                )}
              </section>
              <div className="ad-order-side">
                <section className="ad-panel">
                  <h3>Murojaat holati</h3>
                  <select className="input" value={selected.status} onChange={(e) => updateStatus(e.target.value)} disabled={busy}>
                    {orderStatuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <p className="ad-help">Holat o‘zgarganda avtomatik saqlanadi.</p>
                </section>
                <section className="ad-panel ad-danger">
                  <h3>Ma’lumotni o‘chirish</h3>
                  <p className="ad-help">
                    Maxfiylik so‘rovi yoki saqlash muddati tugaganda murojaat va uning faylini o‘chiring. Amal qaytarilmaydi.
                  </p>
                  {deleteId === selected.id ? (
                    <div className="ad-danger-actions">
                      <button type="button" className="ad-btn-danger" onClick={removeOrder} disabled={busy}>
                        Ha, butunlay o‘chirish
                      </button>
                      <button type="button" className="ad-btn-plain" onClick={() => setDeleteId("")}>
                        Bekor qilish
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="ad-btn-plain ad-btn-danger-soft" onClick={() => setDeleteId(selected.id)}>
                      <Trash2 size={15} /> O‘chirish
                    </button>
                  )}
                </section>
              </div>
            </div>
          )}

          {tab === "categories" && (
            <form className="ad-panel ad-form" onSubmit={saveCategories}>
              <h2>Loyiha kategoriyalari</h2>
              <p className="ad-help">
                Har bir kategoriya alohida satrda bo‘lsin. Loyihalarda ishlatilayotgan kategoriyani o‘chirishdan oldin o‘sha loyihalarni boshqa kategoriyaga
                o‘tkazing.
              </p>
              <label className="field">
                <span>Kategoriyalar</span>
                <textarea className="input" value={categoryText} onChange={(e) => setCategoryText(e.target.value)} rows={12} required />
              </label>
              <button className="button" disabled={busy}>
                Saqlash
                <span className="button-icon" aria-hidden="true">
                  <Check size={15} />
                </span>
              </button>
            </form>
          )}

          {tab === "audit" && (
            <section className="ad-panel ad-audit">
              <div className="ad-audit-head">
                <span>AMAL</span>
                <span>OBYEKT</span>
                <span>VAQT (UTC)</span>
              </div>
              {audit.map((a) => (
                <div key={a.id} className="ad-audit-row">
                  <strong>{a.action}</strong>
                  <span>{a.entity_id}</span>
                  <small>{a.created_at}</small>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  required = false,
  area = false,
  maxLength = 6000,
  type = "text",
}: {
  label: string;
  name: string;
  value?: string;
  required?: boolean;
  area?: boolean;
  maxLength?: number;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {area ? (
        <textarea className="input" name={name} defaultValue={value} required={required} maxLength={maxLength} rows={6} />
      ) : (
        <input className="input" name={name} type={type} defaultValue={value} required={required} maxLength={maxLength} />
      )}
    </label>
  );
}

function ProjectEditor({ project: p, onUpload, busy }: { project: Project; onUpload: (f: File) => void; busy: boolean }) {
  const { categories } = useContent();
  return (
    <>
      <section className="ad-panel ad-form">
        <h2>Asosiy ma’lumotlar</h2>
        <div className="ad-grid">
          <Field label="Loyiha nomi *" name="name" value={p.name} required maxLength={150} />
          <Field label="Sahifa manzili (slug) *" name="slug" value={p.slug} required maxLength={100} />
          <label className="field">
            <span>Kategoriya</span>
            <select className="input" name="category" defaultValue={p.category}>
              {categories.slice(1).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Loyiha holati</span>
            <select className="input" name="status" defaultValue={p.status}>
              {projectStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <Field label="Qisqa tavsif *" name="summary" value={p.summary} required maxLength={500} />
        <Field label="Loyiha haqida *" name="description" value={p.description} required area maxLength={12000} />
        <Field label="Nima uchun yaratilmoqda? *" name="purpose" value={p.purpose} required area />
        <div className="ad-grid">
          <Field label="Asosiy funksiyalar — har biri yangi satrda *" name="features" value={p.features.join("\n")} required area />
          <div className="ad-stack">
            <Field label="Platformalar — vergul bilan ajrating" name="platforms" value={p.platforms.join(", ")} />
            <Field label="Rasmiy foydalanish havolasi — ixtiyoriy" name="url" value={p.url} type="url" maxLength={1000} />
          </div>
        </div>
      </section>
      <section className="ad-panel ad-form">
        <h2>Muqova</h2>
        <label className="field">
          <span>Muqova uslubi yoki yuklangan rasm</span>
          <select className="input" name="cover" key={p.cover} defaultValue={p.cover}>
            {["custom", "dalolat", "voice", "academy", "library", "films", "render", ...(p.cover.startsWith("/media/") ? [p.cover] : [])].map((x) => (
              <option key={x} value={x}>
                {x.startsWith("/media/") ? "Yuklangan rasm" : x}
              </option>
            ))}
          </select>
        </label>
        <label className="ad-upload">
          <span className="ad-upload-icon">
            <ImagePlus size={22} strokeWidth={1.5} />
          </span>
          <span>
            <b>Yangi muqova yuklash</b>
            <small>PNG, JPG yoki WEBP · 5 MB gacha</small>
          </span>
          <input
            type="file"
            disabled={busy}
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
        {p.cover.startsWith("/media/") && <img className="ad-cover" src={p.cover} alt="Yuklangan muqova" />}
      </section>
      <SEO item={p} />
    </>
  );
}

function ServiceEditor({ service: s }: { service: Service }) {
  return (
    <section className="ad-panel ad-form">
      <h2>Xizmat ma’lumotlari</h2>
      <div className="ad-grid">
        <Field label="Xizmat nomi *" name="name" value={s.name} required maxLength={100} />
        <Field label="Tartib raqami (01–99) *" name="number" value={s.number} required maxLength={2} />
      </div>
      <Field label="Qisqa matn *" name="short" value={s.short} required maxLength={300} />
      <Field label="Tavsif *" name="description" value={s.description} required area />
      <Field label="Xizmat tarkibi — har biri yangi satrda *" name="features" value={s.features.join("\n")} required area />
    </section>
  );
}

function ArticleEditor({ article: a }: { article: Article }) {
  return (
    <>
      <section className="ad-panel ad-form">
        <h2>Qayd mazmuni</h2>
        <Field label="Sarlavha *" name="title" value={a.title} required maxLength={200} />
        <div className="ad-grid">
          <Field label="Sahifa manzili (slug) *" name="slug" value={a.slug} required maxLength={100} />
          <Field label="Kategoriya *" name="category" value={a.category} required maxLength={100} />
        </div>
        <Field label="Qisqa mazmun *" name="summary" value={a.summary} required maxLength={500} />
        <Field label="Maqola matni * — xatboshilarni bo‘sh satr bilan ajrating" name="body" value={a.body} required area maxLength={40000} />
      </section>
      <SEO item={a} />
    </>
  );
}

function SEO({ item }: { item: { seoTitle?: string; seoDescription?: string } }) {
  return (
    <section className="ad-panel ad-form">
      <h2>Qidiruv va taqdimot</h2>
      <Field label="SEO sarlavha — ixtiyoriy" name="seoTitle" value={item.seoTitle} maxLength={160} />
      <Field label="SEO tavsif — ixtiyoriy" name="seoDescription" value={item.seoDescription} maxLength={350} area />
    </section>
  );
}
