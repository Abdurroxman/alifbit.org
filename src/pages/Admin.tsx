import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Inbox,
  Settings2,
  BookOpen,
  LogOut,
  ArrowUpRight,
  Plus,
  Check,
  ImagePlus,
  ArrowLeft,
  Search,
  Trash2,
  LoaderCircle,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import Brand from "../components/Brand";
import { useContent } from "../App";
import { api } from "../lib/api";
import {
  initialProjects,
  initialServices,
  categories,
  orderStatuses,
  projectStatuses,
  type Project,
  type Service,
} from "../../shared/content";
import { Status } from "../components/Projects";
import "../admin.css";
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
type Audit = {
  id: number;
  action: string;
  entity_id: string;
  created_at: string;
};
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
export default function Admin() {
  const { categories, refresh: refreshPublic } = useContent();
  const [categoryText, setCategoryText] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null),
    [tab, setTab] = useState("overview"),
    [projects, setProjects] = useState<Project[]>([]),
    [services, setServices] = useState<Service[]>([]),
    [orders, setOrders] = useState<Order[]>([]),
    [articles, setArticles] = useState<Article[]>([]),
    [audit, setAudit] = useState<Audit[]>([]),
    [notification, setNotification] = useState({
      configured: false,
      pending: 0,
    }),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [menu, setMenu] = useState(false);
  const [edit, setEdit] = useState<Project | Service | Article | null>(null),
    [selected, setSelected] = useState<Order | null>(null),
    [query, setQuery] = useState(""),
    [orderFilter, setOrderFilter] = useState("Barchasi"),
    [deleteId, setDeleteId] = useState("");
  async function refresh() {
    try {
      const [p, s, o, a, n, l] = await Promise.all([
        api<Project[]>("/api/admin/projects"),
        api<Service[]>("/api/admin/services"),
        api<Order[]>("/api/admin/orders"),
        api<Article[]>("/api/admin/articles"),
        api<{ configured: boolean; pending: number }>(
          "/api/admin/notifications",
        ),
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
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    try {
      await api(
        "/api/admin/login",
        post({ password: new FormData(form).get("password") }),
      );
      form.reset();
      setAuthenticated(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
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
  function go(value: string) {
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
    const form = new FormData(event.currentTarget),
      data: Record<string, unknown> = { ...edit };
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
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Rasm 5 MB dan kichik bo‘lsin.");
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
  if (authenticated === null)
    return <div className="loading-page">Kirish tekshirilmoqda…</div>;
  if (!authenticated)
    return (
      <main className="admin-login">
        <Link to="/">
          <Brand />
        </Link>
        <form onSubmit={login}>
          <ShieldCheck strokeWidth={1} />
          <small>ALIFBIT / BOSHQARUV</small>
          <h1>Xush kelibsiz.</h1>
          <p>Kontent va murojaatlarni boshqarish uchun kiring.</p>
          <label>
            Administrator paroli
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={12}
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Tekshirilmoqda…" : "Boshqaruvga kirish"}
            <ArrowUpRight size={18} />
          </button>
        </form>
        <Link className="admin-back" to="/">
          <ArrowLeft size={15} /> Saytga qaytish
        </Link>
      </main>
    );
  const titles: Record<string, string> = {
    overview: "Xush kelibsiz.",
    projects: "Loyihalar",
    orders: "Murojaatlar",
    services: "Xizmatlar",
    articles: "Qaydlar",
    categories: "Kategoriyalar",
    audit: "Faoliyat tarixi",
  };
  const tabs = [
    ["overview", "Umumiy ko‘rinish", LayoutDashboard],
    ["projects", "Loyihalar", Layers],
    ["orders", "Murojaatlar", Inbox],
    ["services", "Xizmatlar", Settings2],
    ["articles", "Qaydlar", BookOpen],
    ["categories", "Kategoriyalar", Settings2],
    ["audit", "Faoliyat tarixi", ShieldCheck],
  ] as const;
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menu ? "admin-sidebar-open" : ""}`}>
        <div className="admin-sidebar-brand">
          <Link to="/">
            <Brand light />
          </Link>
          <button
            className="admin-mobile-close"
            onClick={() => setMenu(false)}
            aria-label="Menyuni yopish"
          >
            <X />
          </button>
        </div>
        <span className="admin-workspace-label">ISH MAYDONI</span>
        <nav aria-label="Boshqaruv menyusi">
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              onClick={() => go(key)}
            >
              <Icon size={17} strokeWidth={1.4} />
              {label}
              {key === "orders" && orders.some((o) => o.status === "Yangi") && (
                <i>{orders.filter((o) => o.status === "Yangi").length}</i>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            Saytni ko‘rish
            <ArrowUpRight size={16} />
          </a>
          <button onClick={logout}>
            <LogOut size={16} />
            Chiqish
          </button>
          <small>AlifBit · Kontent boshqaruvi</small>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-mobile-open icon-button"
            aria-label="Menyuni ochish"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </button>
          <span>
            AlifBit <i>/</i> Boshqaruv <i>/</i> {titles[tab]}
          </span>
          <span className="admin-owner">
            <i /> Administrator
          </span>
        </header>
        <div className="admin-content">
          <div className="admin-heading">
            <div>
              <small>ALIFBIT BOSHQARUV PANELI</small>
              <h1>
                {edit
                  ? "name" in edit
                    ? edit.name || "Yangi loyiha"
                    : edit.title || "Yangi qayd"
                  : selected
                    ? selected.reference
                    : titles[tab]}
              </h1>
              <p>
                {tab === "overview"
                  ? "Yangi g‘oyalar, tartibli kontent va yaxshi hamkorlik."
                  : edit
                    ? "Ma’lumotlarni to‘ldiring va saqlang. Nashr holatini o‘zingiz tanlaysiz."
                    : tab === "orders"
                      ? "Saytdan kelgan murojaatlar va ularning bajarilish holati."
                      : "Saytingizdagi ma’lumotlarni shu yerdan boshqaring."}
              </p>
            </div>
            {!edit && !selected && ["projects", "articles"].includes(tab) && (
              <button
                className="button"
                onClick={() =>
                  setEdit(tab === "projects" ? blankProject() : blankArticle())
                }
              >
                <Plus size={17} />
                {tab === "projects" ? "Loyiha qo‘shish" : "Qayd yozish"}
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
                <ArrowLeft size={16} />
                Ro‘yxatga qaytish
              </button>
            )}
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="admin-success" role="status">
              <Check size={16} />
              {message}
            </div>
          )}
          {tab === "overview" && (
            <>
              <div className="admin-stats">
                {[
                  [
                    orders.filter((o) => o.status === "Yangi").length,
                    "Yangi murojaatlar",
                    Inbox,
                  ],
                  [
                    projects.filter((p) => p.published).length,
                    "Nashrdagi loyihalar",
                    Layers,
                  ],
                  [
                    projects.filter((p) => !p.published).length,
                    "Qoralama loyihalar",
                    Settings2,
                  ],
                  [
                    articles.filter((a) => a.published).length,
                    "Nashrdagi qaydlar",
                    BookOpen,
                  ],
                ].map(([n, l, Icon], i) => {
                  const I = Icon as typeof Inbox;
                  return (
                    <div key={i}>
                      <I size={20} strokeWidth={1.2} />
                      <strong>{n as number}</strong>
                      <span>{l as string}</span>
                    </div>
                  );
                })}
              </div>
              <section className="admin-panel">
                <div className="admin-panel-head">
                  <h2>Oxirgi murojaatlar</h2>
                  <button onClick={() => go("orders")}>
                    Barchasini ko‘rish
                    <ArrowUpRight size={15} />
                  </button>
                </div>
                {orders.length ? (
                  <div className="admin-order-list">
                    {orders.slice(0, 5).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          go("orders");
                          setSelected(o);
                        }}
                      >
                        <span>
                          <strong>{o.name}</strong>
                          <small>{o.reference}</small>
                        </span>
                        <span>{o.service}</span>
                        <Status value={o.status} />
                        <ArrowUpRight size={16} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty">
                    <Inbox strokeWidth={1} />
                    <h3>Hozircha murojaatlar yo‘q.</h3>
                    <p>
                      Sayt orqali yuborilgan birinchi murojaat shu yerda
                      ko‘rinadi.
                    </p>
                    <Link to="/contact" target="_blank">
                      Murojaat shaklini ochish
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                )}
              </section>
              <div className="admin-notification">
                <ShieldCheck size={22} />
                <div>
                  <h3>
                    {notification.configured
                      ? "Bildirishnomalar ulangan."
                      : "Telegram bildirishnomalari sozlanmagan."}
                  </h3>
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
            <div className="admin-panel admin-content-list">
              {projects.map((p) => (
                <button key={p.id} onClick={() => setEdit(p)}>
                  <div className={`admin-project-icon mini-${p.cover}`}>
                    {p.name.slice(0, 1)}
                  </div>
                  <span>
                    <strong>{p.name}</strong>
                    <small>/projects/{p.slug}</small>
                  </span>
                  <Status value={p.status} />
                  <span
                    className={`admin-publish ${p.published ? "published" : ""}`}
                  >
                    {p.published ? "Nashrda" : "Qoralama"}
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              ))}
            </div>
          )}
          {!edit && tab === "services" && (
            <div className="admin-panel admin-content-list">
              {services.map((s) => (
                <button key={s.slug} onClick={() => setEdit(s)}>
                  <div className="admin-project-icon">{s.number}</div>
                  <span>
                    <strong>{s.name}</strong>
                    <small>{s.short}</small>
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              ))}
            </div>
          )}
          {!edit && tab === "articles" && (
            <div className="admin-panel admin-content-list">
              {articles.length ? (
                articles.map((a) => (
                  <button key={a.id} onClick={() => setEdit(a)}>
                    <div className="admin-project-icon">
                      <BookOpen size={19} />
                    </div>
                    <span>
                      <strong>{a.title}</strong>
                      <small>/journal/{a.slug}</small>
                    </span>
                    <span
                      className={`admin-publish ${a.published ? "published" : ""}`}
                    >
                      {a.published ? "Nashrda" : "Qoralama"}
                    </span>
                    <ArrowUpRight size={17} />
                  </button>
                ))
              ) : (
                <div className="admin-empty">
                  <BookOpen strokeWidth={1} />
                  <h3>Yangi fikr uchun ochiq sahifa.</h3>
                  <p>«Qayd yozish» orqali birinchi maqolangizni yarating.</p>
                </div>
              )}
            </div>
          )}
          {edit && (
            <form className="admin-editor" onSubmit={save}>
              {tab === "projects" ? (
                <ProjectEditor
                  project={edit as Project}
                  onUpload={upload}
                  busy={busy}
                />
              ) : tab === "services" ? (
                <ServiceEditor service={edit as Service} />
              ) : (
                <ArticleEditor article={edit as Article} />
              )}
              <div className="admin-savebar">
                {tab !== "services" && (
                  <label className="admin-toggle">
                    <input
                      name="published"
                      type="checkbox"
                      defaultChecked={"published" in edit && edit.published}
                    />
                    <span>Saytda nashr qilish</span>
                  </label>
                )}
                <button className="button" type="submit" disabled={busy}>
                  {busy ? (
                    <LoaderCircle className="spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                  O‘zgarishlarni saqlash
                </button>
              </div>
            </form>
          )}
          {tab === "orders" && !selected && (
            <>
              <div className="admin-order-toolbar">
                <label>
                  <Search size={16} />
                  <input
                    placeholder="Ism, manzil yoki murojaat raqami…"
                    aria-label="Murojaatlarni qidirish"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Murojaat holati"
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                >
                  {["Barchasi", ...orderStatuses].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="admin-panel admin-order-list">
                {orders
                  .filter(
                    (o) =>
                      (orderFilter === "Barchasi" ||
                        o.status === orderFilter) &&
                      `${o.name} ${o.contact} ${o.reference}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                  )
                  .map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setSelected(o);
                        setMessage("");
                      }}
                    >
                      <span>
                        <strong>{o.name}</strong>
                        <small>
                          {o.reference} ·{" "}
                          {new Date(o.created_at + "Z").toLocaleDateString(
                            "uz-UZ",
                          )}
                        </small>
                      </span>
                      <span>{o.service}</span>
                      <Status value={o.status} />
                      <ArrowUpRight size={16} />
                    </button>
                  ))}
                {!orders.length && (
                  <div className="admin-empty">
                    <Inbox strokeWidth={1} />
                    <h3>Murojaatlar shu yerda to‘planadi.</h3>
                  </div>
                )}
              </div>
            </>
          )}
          {selected && (
            <div className="admin-order-detail">
              <div className="admin-panel">
                <h2>{selected.name}</h2>
                <dl>
                  <dt>Aloqa</dt>
                  <dd>{selected.contact}</dd>
                  <dt>Yo‘nalish</dt>
                  <dd>{selected.service}</dd>
                  <dt>Byudjet</dt>
                  <dd>{selected.budget || "Ko‘rsatilmagan"}</dd>
                  <dt>Muddat</dt>
                  <dd>{selected.deadline || "Ko‘rsatilmagan"}</dd>
                  <dt>Kelgan vaqt</dt>
                  <dd>{selected.created_at} UTC</dd>
                </dl>
                <h3>Loyiha tavsifi</h3>
                <p className="order-description">{selected.description}</p>
                {selected.attachment_key && (
                  <a
                    className="button button-outline"
                    href={`/media/${selected.attachment_key}`}
                    download
                  >
                    {selected.attachment_name || "Biriktirilgan fayl"}
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
              <div>
                <section className="admin-panel">
                  <h3>Murojaat holati</h3>
                  <select
                    value={selected.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    disabled={busy}
                  >
                    {orderStatuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <p>Holat o‘zgarganda avtomatik saqlanadi.</p>
                </section>
                <section className="admin-panel admin-delete">
                  <h3>Ma’lumotni o‘chirish</h3>
                  <p>
                    Maxfiylik so‘rovi yoki saqlash muddati tugaganda murojaat va
                    uning faylini o‘chiring. Amal qaytarilmaydi.
                  </p>
                  {deleteId === selected.id ? (
                    <div>
                      <button
                        type="button"
                        onClick={removeOrder}
                        disabled={busy}
                      >
                        Ha, butunlay o‘chirish
                      </button>
                      <button type="button" onClick={() => setDeleteId("")}>
                        Bekor qilish
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteId(selected.id)}
                    >
                      <Trash2 size={14} />
                      O‘chirish
                    </button>
                  )}
                </section>
              </div>
            </div>
          )}
          {tab === "categories" && (
            <form
              className="admin-panel"
              onSubmit={async (event) => {
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
              }}
            >
              <h2>Loyiha kategoriyalari</h2>
              <p className="admin-help">
                Har bir kategoriya alohida satrda bo‘lsin. Loyihalarda
                ishlatilayotgan kategoriyani o‘chirishdan oldin o‘sha
                loyihalarni boshqa kategoriyaga o‘tkazing.
              </p>
              <label className="admin-field">
                Kategoriyalar
                <textarea
                  value={categoryText}
                  onChange={(e) => setCategoryText(e.target.value)}
                  rows={12}
                  required
                />
              </label>
              <button className="button" disabled={busy}>
                Saqlash
                <Check size={16} />
              </button>
            </form>
          )}
          {tab === "audit" && (
            <div className="admin-panel admin-audit">
              <div className="admin-audit-head">
                <span>AMAL</span>
                <span>OBYEKT</span>
                <span>VAQT (UTC)</span>
              </div>
              {audit.map((a) => (
                <div key={a.id}>
                  <strong>{a.action}</strong>
                  <span>{a.entity_id}</span>
                  <small>{a.created_at}</small>
                </div>
              ))}
            </div>
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
    <label className="admin-field">
      {label}
      {area ? (
        <textarea
          name={name}
          defaultValue={value}
          required={required}
          maxLength={maxLength}
          rows={6}
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={value}
          required={required}
          maxLength={maxLength}
        />
      )}
    </label>
  );
}
function ProjectEditor({
  project: p,
  onUpload,
  busy,
}: {
  project: Project;
  onUpload: (f: File) => void;
  busy: boolean;
}) {
  const { categories } = useContent();
  return (
    <>
      <section className="admin-panel">
        <h2>Asosiy ma’lumotlar</h2>
        <div className="admin-form-grid">
          <Field
            label="Loyiha nomi *"
            name="name"
            value={p.name}
            required
            maxLength={150}
          />
          <Field
            label="Sahifa manzili (slug) *"
            name="slug"
            value={p.slug}
            required
            maxLength={100}
          />
          <label className="admin-field">
            Kategoriya
            <select name="category" defaultValue={p.category}>
              {categories.slice(1).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Loyiha holati
            <select name="status" defaultValue={p.status}>
              {projectStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <Field
          label="Qisqa tavsif *"
          name="summary"
          value={p.summary}
          required
          maxLength={500}
        />
        <Field
          label="Loyiha haqida *"
          name="description"
          value={p.description}
          required
          area
          maxLength={12000}
        />
        <Field
          label="Nima uchun yaratilmoqda? *"
          name="purpose"
          value={p.purpose}
          required
          area
        />
        <div className="admin-form-grid">
          <Field
            label="Asosiy funksiyalar — har biri yangi satrda *"
            name="features"
            value={p.features.join("\n")}
            required
            area
          />
          <div>
            <Field
              label="Platformalar — vergul bilan ajrating"
              name="platforms"
              value={p.platforms.join(", ")}
            />
            <Field
              label="Rasmiy foydalanish havolasi — ixtiyoriy"
              name="url"
              value={p.url}
              type="url"
              maxLength={1000}
            />
          </div>
        </div>
      </section>
      <section className="admin-panel">
        <h2>Muqova</h2>
        <label className="admin-field">
          Muqova uslubi yoki yuklangan rasm
          <select name="cover" key={p.cover} defaultValue={p.cover}>
            {[
              "custom",
              "dalolat",
              "voice",
              "academy",
              "library",
              "films",
              "render",
              ...(p.cover.startsWith("/media/") ? [p.cover] : []),
            ].map((x) => (
              <option key={x} value={x}>
                {x.startsWith("/media/") ? "Yuklangan rasm" : x}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-upload">
          <ImagePlus size={23} />
          <span>Yangi muqova yuklash</span>
          <small>PNG, JPG yoki WEBP · 5 MB gacha</small>
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
        {p.cover.startsWith("/media/") && (
          <img
            className="admin-cover-preview"
            src={p.cover}
            alt="Yuklangan muqova"
          />
        )}
      </section>
      <SEO item={p} />
    </>
  );
}
function ServiceEditor({ service: s }: { service: Service }) {
  return (
    <section className="admin-panel">
      <h2>Xizmat ma’lumotlari</h2>
      <div className="admin-form-grid">
        <Field
          label="Xizmat nomi *"
          name="name"
          value={s.name}
          required
          maxLength={100}
        />
        <Field
          label="Tartib raqami (01–99) *"
          name="number"
          value={s.number}
          required
          maxLength={2}
        />
      </div>
      <Field
        label="Qisqa matn *"
        name="short"
        value={s.short}
        required
        maxLength={300}
      />
      <Field
        label="Tavsif *"
        name="description"
        value={s.description}
        required
        area
      />
      <Field
        label="Xizmat tarkibi — har biri yangi satrda *"
        name="features"
        value={s.features.join("\n")}
        required
        area
      />
    </section>
  );
}
function ArticleEditor({ article: a }: { article: Article }) {
  return (
    <>
      <section className="admin-panel">
        <h2>Qayd mazmuni</h2>
        <Field
          label="Sarlavha *"
          name="title"
          value={a.title}
          required
          maxLength={200}
        />
        <div className="admin-form-grid">
          <Field
            label="Sahifa manzili (slug) *"
            name="slug"
            value={a.slug}
            required
            maxLength={100}
          />
          <Field
            label="Kategoriya *"
            name="category"
            value={a.category}
            required
            maxLength={100}
          />
        </div>
        <Field
          label="Qisqa mazmun *"
          name="summary"
          value={a.summary}
          required
          maxLength={500}
        />
        <Field
          label="Maqola matni * — xatboshilarni bo‘sh satr bilan ajrating"
          name="body"
          value={a.body}
          required
          area
          maxLength={40000}
        />
      </section>
      <SEO item={a} />
    </>
  );
}
function SEO({
  item,
}: {
  item: { seoTitle?: string; seoDescription?: string };
}) {
  return (
    <section className="admin-panel">
      <h2>Qidiruv va taqdimot</h2>
      <Field
        label="SEO sarlavha — ixtiyoriy"
        name="seoTitle"
        value={item.seoTitle}
        maxLength={160}
      />
      <Field
        label="SEO tavsif — ixtiyoriy"
        name="seoDescription"
        value={item.seoDescription}
        maxLength={350}
        area
      />
    </section>
  );
}
