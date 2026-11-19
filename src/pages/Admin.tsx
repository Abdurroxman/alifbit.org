import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  GraduationCap,
  History,
  ImagePlus,
  Inbox,
  Layers,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  Sun,
  ShieldCheck,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import Brand, { BrandMark } from "../components/Brand";
import { MoveButtons, moveItem } from "../components/AdminParts";
import DemoEditor from "../components/DemoEditor";
import { Status } from "../components/Projects";
import PaymentPanel, { parsePayData } from "../components/PaymentPanel";
import { useContent } from "../App";
import { api } from "../lib/api";
import { setAdminTheme, useTheme } from "../lib/theme";
import {
  initialProjects,
  orderStatuses,
  projectCovers,
  projectStatuses,
  type Course,
  type Project,
  type Service,
  type ServiceExample,
  type ServicePackage,
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
  pay_data?: string | null;
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
type Tab = "overview" | "projects" | "orders" | "services" | "courses" | "articles" | "categories" | "audit" | "settings";

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
const blankCourse = (): Course => ({
  id: crypto.randomUUID(),
  slug: "",
  title: "",
  tagline: "",
  description: "",
  price: "",
  format: "",
  start: "",
  steps: [],
  contents: [],
  published: false,
});
const lines = (value: FormDataEntryValue | null) =>
  String(value || "")
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
/** Juft qatorlar muharriridan (qadamlar, oldin/keyin, savol-javob) kelgan JSON: bo'sh qatorlar tashlanadi. */
const pairsFrom = (value: FormDataEntryValue | null) => {
  try {
    return (JSON.parse(String(value || "[]")) as Array<[string, string]>)
      .map(([a, b]) => [a.trim(), b.trim()] as const)
      .filter(([a, b]) => a || b);
  } catch {
    return [];
  }
};
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
  courses: "Kurslar",
  articles: "Qaydlar",
  categories: "Kategoriyalar",
  audit: "Faoliyat tarixi",
  settings: "Sozlamalar",
};
const TABS: Array<[Tab, typeof Inbox]> = [
  ["overview", LayoutDashboard],
  ["projects", Layers],
  ["orders", Inbox],
  ["services", Settings2],
  ["courses", GraduationCap],
  ["articles", BookOpen],
  ["categories", Tags],
  ["audit", History],
  ["settings", SlidersHorizontal],
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
  const theme = useTheme();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [notification, setNotification] = useState({ configured: false, pending: 0 });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [edit, setEdit] = useState<Project | Service | Course | Article | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("Barchasi");
  const [deleteId, setDeleteId] = useState("");
  const [categoryText, setCategoryText] = useState("");
  // Tahrir oynasida saqlanmagan o'zgarish bor-yo'qligi: chiqib ketishdan oldin so'raladi.
  const [dirty, setDirty] = useState(false);

  async function refresh() {
    try {
      const [p, s, k, o, a, n, l] = await Promise.all([
        api<Project[]>("/api/admin/projects"),
        api<Service[]>("/api/admin/services"),
        api<Course[]>("/api/admin/courses"),
        api<Order[]>("/api/admin/orders"),
        api<Article[]>("/api/admin/articles"),
        api<{ configured: boolean; pending: number }>("/api/admin/notifications"),
        api<Audit[]>("/api/admin/audit"),
      ]);
      setProjects(p);
      setServices(s);
      setCourses(k);
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
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /** Saqlanmagan o'zgarish bo'lsa, tasdiq so'raydi; true — davom etish mumkin. */
  function canLeave() {
    if (!dirty) return true;
    if (!window.confirm("Saqlanmagan o‘zgarishlar bor. Chiqib ketsangiz, ular yo‘qoladi. Davom etasizmi?")) return false;
    setDirty(false);
    return true;
  }
  function openEdit(item: Project | Service | Course | Article | null) {
    setDirty(false);
    setEdit(item);
  }

  async function logout() {
    if (!canLeave()) return;
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
    if (!canLeave()) return;
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
    if (tab === "services") {
      // Belgi qo'yilgan bo'lsa (standart holat) maydon umuman yozilmaydi.
      if (form.has("promises_on")) delete data.promises;
      else data.promises = false;
      delete data.promises_on;
      const packages = JSON.parse(String(form.get("packages_json") || "[]")) as ServicePackage[];
      data.packages = packages.map((p) => ({
        ...p,
        name: p.name.trim(),
        price: p.price.trim(),
        term: p.term.trim(),
        fit: (p.fit || "").trim(),
        hidden: !!p.hidden,
        features: p.features.map((f) => f.trim()).filter(Boolean),
      }));
      delete data.packages_json;
      const examples = JSON.parse(String(form.get("examples_json") || "[]")) as ServiceExample[];
      data.examples = examples
        .map((x) => ({
          name: x.name.trim(),
          owner: x.owner.trim(),
          text: x.text.trim(),
          url: x.url.trim(),
          image: x.image,
          imageMobile: x.imageMobile || "",
        }))
        .filter((x) => x.name || x.url);
      delete data.examples_json;
    }
    if (tab === "courses") {
      data.contents = lines(form.get("contents"));
      data.steps = pairsFrom(form.get("steps_json")).map(([title, text]) => ({ title, text }));
      delete data.steps_json;
    }
    if (tab === "projects") {
      data.steps = pairsFrom(form.get("steps_json")).map(([title, text]) => ({ title, text }));
      data.customerView = lines(form.get("customerView"));
      data.ownerView = lines(form.get("ownerView"));
      data.beforeAfter = pairsFrom(form.get("beforeAfter_json")).map(([before, after]) => ({ before, after }));
      data.fit = lines(form.get("fit"));
      data.faq = pairsFrom(form.get("faq_json")).map(([q, a]) => ({ q, a }));
      delete data.steps_json;
      delete data.beforeAfter_json;
      delete data.faq_json;
      // Demo JSON ko'rinishida tahrirlanadi; tuzilmasini server tekshiradi.
      const demo = String(form.get("demo_json") || "").trim();
      delete data.demo_json;
      delete data.demo;
      if (demo) {
        try {
          data.demo = JSON.parse(demo);
        } catch {
          setError("Demo suhbatni o‘qib bo‘lmadi: «JSON ko‘rinishi»dagi matnni tekshiring.");
          setBusy(false);
          return;
        }
      }
    }
    try {
      await api(`/api/admin/${tab}`, post(data));
      setMessage("O‘zgarishlar saqlandi.");
      setDirty(false);
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
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const next = String(form.get("next") || "");
    setError("");
    setMessage("");
    if (next !== String(form.get("repeat") || "")) {
      setError("Yangi parol ikki marta bir xil yozilmadi.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/admin/password", post({ current: String(form.get("current") || ""), next }));
      formEl.reset();
      setMessage("Parol almashtirildi. Boshqa qurilmalardagi kirishlar yopildi.");
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
      : edit.title || (tab === "courses" ? "Yangi kurs" : "Yangi qayd")
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
          : tab === "settings"
            ? "Kirish paroli va panel sozlamalari."
          : "Saytingizdagi ma’lumotlarni shu yerdan boshqaring.";
  // Tahrirdagi yozuvning saytdagi sahifasi: faqat saqlangan va nashrdagi yozuv uchun.
  const publicPath = (() => {
    if (!edit || !edit.slug) return "";
    if (tab === "services") {
      const saved = services.find((x) => x.slug === edit.slug);
      return saved && saved.published !== false ? `/services/${saved.slug}` : "";
    }
    const list: Array<{ id: string; slug: string; published: boolean }> =
      tab === "projects" ? projects : tab === "courses" ? courses : tab === "articles" ? articles : [];
    const saved = "id" in edit ? list.find((x) => x.id === edit.id) : undefined;
    const base = tab === "projects" ? "/projects/" : tab === "courses" ? "/courses/" : "/journal/";
    return saved && saved.published ? base + saved.slug : "";
  })();
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
          <button
            className="ad-icon-btn ad-theme-btn"
            aria-label={theme === "dark" ? "Yorug‘ rejimga o‘tish" : "To‘q rejimga o‘tish"}
            title={theme === "dark" ? "Yorug‘ rejim" : "To‘q rejim"}
            onClick={() => setAdminTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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
            {!edit && !selected && (tab === "projects" || tab === "articles" || tab === "courses") && (
              <button
                className="button"
                onClick={() => openEdit(tab === "projects" ? blankProject() : tab === "courses" ? blankCourse() : blankArticle())}
              >
                {tab === "projects" ? "Loyiha qo‘shish" : tab === "courses" ? "Kurs qo‘shish" : "Qayd yozish"}
                <span className="button-icon" aria-hidden="true">
                  <Plus size={16} />
                </span>
              </button>
            )}
            {(edit || selected) && (
              <div className="ad-heading-actions">
              {publicPath && (
                <a className="button button-outline" href={publicPath} target="_blank" rel="noreferrer">
                  Saytda ko‘rish <ArrowUpRight size={16} />
                </a>
              )}
              <button
                className="button button-outline"
                onClick={() => {
                  if (!canLeave()) return;
                  setEdit(null);
                  setSelected(null);
                  setDeleteId("");
                }}
              >
                <ArrowLeft size={16} /> Ro‘yxatga qaytish
              </button>
              </div>
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
                <Row key={p.id} onClick={() => openEdit(p)}>
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
              {[...services].sort((a, b) => a.number.localeCompare(b.number)).map((s) => (
                <Row key={s.slug} onClick={() => openEdit(s)}>
                  <span className="ad-thumb">{s.number}</span>
                  <span className="ad-row-main">
                    <strong>{s.name}</strong>
                    <small>{s.short}</small>
                  </span>
                  <span className="ad-row-meta">{s.price || "Kelishiladi"}</span>
                  <Publish on={s.published !== false} />
                </Row>
              ))}
            </section>
          )}

          {!edit && tab === "courses" && (
            <section className="ad-panel ad-list">
              {courses.length ? (
                courses.map((c) => (
                  <Row key={c.id} onClick={() => openEdit(c)}>
                    <span className="ad-thumb">
                      <GraduationCap size={17} />
                    </span>
                    <span className="ad-row-main">
                      <strong>{c.title}</strong>
                      <small>/courses/{c.slug}</small>
                    </span>
                    <span className="ad-row-meta">{c.price}</span>
                    <Publish on={c.published} />
                  </Row>
                ))
              ) : (
                <Empty icon={<GraduationCap strokeWidth={1.3} />} title="Hozircha kurs yo‘q.">
                  <p>«Kurs qo‘shish» orqali birinchi kursni yarating.</p>
                </Empty>
              )}
            </section>
          )}

          {!edit && tab === "articles" && (
            <section className="ad-panel ad-list">
              {articles.length ? (
                articles.map((a) => (
                  <Row key={a.id} onClick={() => openEdit(a)}>
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
            <form
              className="ad-editor"
              onSubmit={save}
              onChange={() => setDirty(true)}
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("button[type=button]")) setDirty(true);
              }}
            >
              {tab === "projects" ? (
                <ProjectEditor project={edit as Project} onUpload={upload} busy={busy} />
              ) : tab === "services" ? (
                <ServiceEditor service={edit as Service} />
              ) : tab === "courses" ? (
                <CourseEditor course={edit as Course} />
              ) : (
                <ArticleEditor article={edit as Article} />
              )}
              <div className="ad-savebar">
                <label className="ad-toggle">
                  <input
                    name="published"
                    type="checkbox"
                    defaultChecked={tab === "services" ? (edit as Service).published !== false : "published" in edit && !!edit.published}
                  />
                  <span className="ad-switch" aria-hidden="true" />
                  <span>{tab === "services" ? "Saytda ko‘rinsin" : "Saytda nashr qilish"}</span>
                </label>
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
                <PaymentPanel key={selected.id} orderId={selected.id} initial={parsePayData(selected.pay_data)} onChanged={() => void refresh()} />
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

          {tab === "settings" && (
            <form className="ad-panel ad-form ad-settings" onSubmit={changePassword}>
              <h2>Kirish paroli</h2>
              <p className="ad-help">
                Yangi parol kamida 16 belgidan iborat bo‘lsin. Almashtirilgach, boshqa qurilma va brauzerlardagi kirishlar yopiladi, shu oyna
                ochiq qoladi.
              </p>
              <input type="text" name="username" autoComplete="username" value="admin" readOnly hidden />
              <label className="field">
                <span>Joriy parol</span>
                <input className="input" name="current" type="password" autoComplete="current-password" required maxLength={256} />
              </label>
              <label className="field">
                <span>Yangi parol</span>
                <input className="input" name="next" type="password" autoComplete="new-password" required minLength={16} maxLength={256} />
              </label>
              <label className="field">
                <span>Yangi parol — yana bir marta</span>
                <input className="input" name="repeat" type="password" autoComplete="new-password" required minLength={16} maxLength={256} />
              </label>
              <button className="button" disabled={busy}>
                Parolni almashtirish
                <span className="button-icon" aria-hidden="true">
                  {busy ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}
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
  const { categories, services } = useContent();
  // Yechim ma'lumoti bor loyihada blok ochiq, oddiy loyihada yig'ilgan turadi.
  const hasSolution = !!(
    p.service ||
    p.problem ||
    p.demo ||
    [p.steps, p.customerView, p.ownerView, p.beforeAfter, p.fit, p.faq].some((x) => x && x.length)
  );
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
        <Field label="Maqsadi *" name="purpose" value={p.purpose} required area />
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
            {[...projectCovers, ...(p.cover.startsWith("/media/") ? [p.cover] : [])].map((x) => (
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
      <details className="ad-panel ad-form ad-fold" open={hasSolution}>
        <summary>
          <h2>Yechim sahifasi</h2>
          <small>Muammo, qanday ishlashi, oldin/keyin, savol-javob va demo — namuna yechimlar uchun</small>
        </summary>
        <label className="field">
          <span>Xizmat — sahifada narx havolasi va buyurtma shundan olinadi</span>
          <select className="input" name="service" defaultValue={p.service || ""}>
            <option value="">—</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <Field label="Muammo — mijozning hayotiy holati" name="problem" value={p.problem} area maxLength={2000} />
        <PairListEditor
          title="Qanday ishlaydi"
          name="steps_json"
          item="Qadam"
          labels={["Sarlavha", "Izoh"]}
          limits={[120, 400]}
          max={8}
          initial={(p.steps || []).map((x) => [x.title, x.text])}
        />
        <div className="ad-grid">
          <Field label="Mijoz ko‘radi — har biri yangi satrda" name="customerView" value={(p.customerView || []).join("\n")} area />
          <Field label="Siz ko‘rasiz — har biri yangi satrda" name="ownerView" value={(p.ownerView || []).join("\n")} area />
        </div>
        <PairListEditor
          title="Oldin va keyin"
          name="beforeAfter_json"
          item="Qator"
          labels={["Oldin", "Keyin"]}
          limits={[300, 300]}
          max={8}
          initial={(p.beforeAfter || []).map((x) => [x.before, x.after])}
        />
        <Field label="Kimga mos — har biri yangi satrda" name="fit" value={(p.fit || []).join("\n")} area />
        <PairListEditor
          title="Savol-javob"
          name="faq_json"
          item="Savol"
          labels={["Savol", "Javob"]}
          limits={[300, 1200]}
          max={10}
          initial={(p.faq || []).map((x) => [x.q, x.a])}
        />
        <DemoEditor initial={p.demo} />
      </details>
      <SEO item={p} />
    </>
  );
}

function ServiceEditor({ service: s }: { service: Service }) {
  return (
    <>
      <section className="ad-panel ad-form">
        <h2>Xizmat ma’lumotlari</h2>
        <div className="ad-grid">
          <Field label="Xizmat nomi *" name="name" value={s.name} required maxLength={100} />
          <Field label="Tartib raqami (01–99) *" name="number" value={s.number} required maxLength={2} />
          <Field label="Boshlang‘ich narx — masalan, 1 200 000 so‘m" name="price" value={s.price || ""} maxLength={100} />
          <Field label="Muddat — masalan, 2 haftadan" name="term" value={s.term || ""} maxLength={100} />
        </div>
        <Field label="Qisqa matn *" name="short" value={s.short} required maxLength={300} />
        <Field label="Tavsif *" name="description" value={s.description} required area />
        <Field
          label="«Xizmatga nimalar kiradi?» — barcha paketlarga kiradigan bandlar, har biri yangi satrda *"
          name="features"
          value={s.features.join("\n")}
          required
          area
        />
        <label className="ad-check">
          <input type="checkbox" name="promises_on" defaultChecked={s.promises !== false} />
          «Har bir loyihada» va’dalari ko‘rinsin — 3 oy bepul texnik yordam, o‘rgatish, 1 yil kafolat
        </label>
      </section>
      <PackagesEditor initial={s.packages || []} />
      <ExamplesEditor initial={s.examples || []} />
    </>
  );
}

/** Ikki maydonli qatorlar ro'yxati (sarlavha va izoh, savol va javob): qo'shish, surish, olib tashlash. */
function PairListEditor({
  title,
  name,
  item,
  labels,
  limits,
  max,
  initial,
}: {
  title: string;
  name: string;
  item: string;
  labels: [string, string];
  limits: [number, number];
  max: number;
  initial: Array<[string, string]>;
}) {
  const [items, setItems] = useState<Array<[string, string]>>(initial);
  const update = (i: number, k: 0 | 1, v: string) =>
    setItems(items.map((x, j) => (j === i ? ((k ? [x[0], v] : [v, x[1]]) as [string, string]) : x)));
  return (
    <div className="ad-pairs">
      <h3>{title}</h3>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((x, i) => (
        <fieldset className="ad-package ad-pair" key={i}>
          <legend>
            {item} {i + 1}
          </legend>
          <MoveButtons index={i} count={items.length} onMove={(step) => setItems(moveItem(items, i, step))} />
          <label className="field">
            <span>{labels[0]}</span>
            <input className="input" value={x[0]} maxLength={limits[0]} onChange={(e) => update(i, 0, e.target.value)} />
          </label>
          <label className="field">
            <span>{labels[1]}</span>
            <textarea className="input" rows={2} value={x[1]} maxLength={limits[1]} onChange={(e) => update(i, 1, e.target.value)} />
          </label>
          <button type="button" className="ad-remove" onClick={() => setItems(items.filter((_, j) => j !== i))}>
            <Trash2 size={15} /> Olib tashlash
          </button>
        </fieldset>
      ))}
      {items.length < max && (
        <button type="button" className="button button-outline" onClick={() => setItems([...items, ["", ""]])}>
          {item} qo‘shish
          <span className="button-icon" aria-hidden="true">
            <Plus size={16} />
          </span>
        </button>
      )}
    </div>
  );
}

const blankExample = (): ServiceExample => ({ name: "", owner: "", text: "", url: "", image: "", imageMobile: "" });
type ShotField = "image" | "imageMobile";
const SHOT_LABEL: Record<ShotField, [string, string]> = {
  image: ["Kompyuter ekrani", "16:9 skrinshot · noutbuk ekraniga"],
  imageMobile: ["Telefon ekrani", "9:16 skrinshot · telefon ekraniga"],
};

/** Xizmat sahifasidagi misollar: har biriga alohida rasm yuklanadi, xizmat saqlanganda bazaga yoziladi. */
function ExamplesEditor({ initial }: { initial: ServiceExample[] }) {
  const [items, setItems] = useState(initial);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const update = (i: number, patch: Partial<ServiceExample>) =>
    setItems((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  async function upload(i: number, field: ShotField, file: File) {
    setUploadError("");
    if (file.size > 5 * 1024 * 1024) return setUploadError("Rasm 5 MB dan kichik bo‘lsin.");
    setUploading(`${i}-${field}`);
    try {
      const result = await api<{ url: string }>("/api/admin/upload", {
        method: "POST",
        headers: { "content-type": file.type },
        body: file,
      });
      update(i, { [field]: result.url });
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(null);
    }
  }
  return (
    <section className="ad-panel ad-form">
      <h2>Misollar</h2>
      <p className="ad-hint">
        Shu turdagi, boshqa kompaniyalar ishga tushirgan yechimlar. Karta manba havolasiga yangi oynada olib
        boradi. Skrinshotlar kartada noutbuk va telefon ekranida, bosh sahifada esa shu xizmat tanlanganda 3D
        qurilmalar ekranida chiqadi. Bittasi yuklansa, faqat o‘sha qurilma ko‘rinadi; ikkalasi ham bo‘lmasa,
        kartada xizmat rangidagi fon turadi. Yuklagach xizmatni saqlang.
      </p>
      <input type="hidden" name="examples_json" value={JSON.stringify(items)} />
      {uploadError && <p role="alert" className="form-error">{uploadError}</p>}
      {items.map((x, i) => (
        <fieldset className="ad-package" key={i}>
          <legend>Misol {i + 1}</legend>
          <div className="ad-grid">
            <label className="field">
              <span>Nomi *</span>
              <input className="input" value={x.name} required maxLength={120} onChange={(e) => update(i, { name: e.target.value })} />
            </label>
            <label className="field">
              <span>Kimniki — masalan «EVOS · O‘zbekiston»</span>
              <input className="input" value={x.owner} maxLength={120} onChange={(e) => update(i, { owner: e.target.value })} />
            </label>
          </div>
          <label className="field">
            <span>Havola * — sayt yoki t.me/…</span>
            <input className="input" type="url" value={x.url} required maxLength={1000} onChange={(e) => update(i, { url: e.target.value })} />
          </label>
          <label className="field">
            <span>Qisqa tavsif</span>
            <textarea className="input" rows={3} value={x.text} maxLength={400} onChange={(e) => update(i, { text: e.target.value })} />
          </label>
          <div className="ad-example-shots">
            {(Object.keys(SHOT_LABEL) as ShotField[]).map((field) => (
              <div key={field}>
                <label className="ad-upload">
                  <span className="ad-upload-icon">
                    <ImagePlus size={22} strokeWidth={1.5} />
                  </span>
                  <span>
                    <b>{uploading === `${i}-${field}` ? "Yuklanmoqda…" : SHOT_LABEL[field][0]}</b>
                    <small>{SHOT_LABEL[field][1]} · PNG, JPG, WEBP · 5 MB gacha</small>
                  </span>
                  <input
                    type="file"
                    disabled={uploading !== null}
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) upload(i, field, file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {x[field] && (
                  <>
                    <img className="ad-cover" src={x[field]} alt={`${x.name} — ${SHOT_LABEL[field][0]}`} />
                    <button type="button" className="ad-remove" onClick={() => update(i, { [field]: "" })}>
                      <Trash2 size={15} /> Olib tashlash
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="ad-example-actions">
            <button type="button" className="ad-remove" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <Trash2 size={15} /> Misolni olib tashlash
            </button>
          </div>
        </fieldset>
      ))}
      {items.length < 8 && (
        <button type="button" className="button button-outline" onClick={() => setItems([...items, blankExample()])}>
          Misol qo‘shish
          <span className="button-icon" aria-hidden="true">
            <Plus size={16} />
          </span>
        </button>
      )}
    </section>
  );
}

const blankPackage = (): ServicePackage => ({
  name: "",
  price: "",
  term: "",
  features: [],
  recommended: false,
  fit: "",
  hidden: false,
});

function PackagesEditor({ initial }: { initial: ServicePackage[] }) {
  const [items, setItems] = useState(initial);
  const update = (i: number, patch: Partial<ServicePackage>) =>
    setItems(items.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const move = (i: number, step: -1 | 1) => setItems(moveItem(items, i, step));
  return (
    <section className="ad-panel ad-form">
      <h2>Paketlar</h2>
      <p className="ad-hint">
        Narx bo‘sh qolsa, saytda «Narxi kelishiladi» deb chiqadi. Paketlardagi bir xil yozilgan bandlar
        taqqoslash jadvalida bitta qator bo‘ladi. «Saytda ko‘rinsin» belgisi olinsa, paket saytda chiqmaydi,
        lekin shu yerda saqlanib qoladi.
      </p>
      <input type="hidden" name="packages_json" value={JSON.stringify(items)} />
      {items.map((p, i) => (
        <fieldset className="ad-package" key={i}>
          <legend>Paket {i + 1}</legend>
          <MoveButtons index={i} count={items.length} onMove={(step) => move(i, step)} />
          <div className="ad-grid">
            <label className="field">
              <span>Nomi *</span>
              <input className="input" value={p.name} required maxLength={100} onChange={(e) => update(i, { name: e.target.value })} />
            </label>
            <label className="field">
              <span>Narxi</span>
              <input className="input" value={p.price} maxLength={100} onChange={(e) => update(i, { price: e.target.value })} />
            </label>
            <label className="field">
              <span>Muddati</span>
              <input className="input" value={p.term} maxLength={100} onChange={(e) => update(i, { term: e.target.value })} />
            </label>
            <label className="ad-check">
              <input type="checkbox" checked={p.recommended} onChange={(e) => update(i, { recommended: e.target.checked })} />
              Tavsiya etiladi
            </label>
            <label className="ad-check">
              <input type="checkbox" checked={!p.hidden} onChange={(e) => update(i, { hidden: !e.target.checked })} />
              Saytda ko‘rinsin
            </label>
          </div>
          <label className="field">
            <span>Kimga mos — paket nomi ostida chiqadi, masalan «Internetda sotmoqchiman»</span>
            <input className="input" value={p.fit || ""} maxLength={160} onChange={(e) => update(i, { fit: e.target.value })} />
          </label>
          <label className="field">
            <span>Paketning o‘ziga xos tarkibi — har biri yangi satrda</span>
            <textarea
              className="input"
              rows={5}
              value={p.features.join("\n")}
              onChange={(e) => update(i, { features: e.target.value.split("\n") })}
            />
          </label>
          <button type="button" className="ad-remove" onClick={() => setItems(items.filter((_, j) => j !== i))}>
            <Trash2 size={15} /> Paketni olib tashlash
          </button>
        </fieldset>
      ))}
      {items.length < 6 && (
        <button type="button" className="button button-outline" onClick={() => setItems([...items, blankPackage()])}>
          Paket qo‘shish
          <span className="button-icon" aria-hidden="true">
            <Plus size={16} />
          </span>
        </button>
      )}
    </section>
  );
}

function CourseEditor({ course: c }: { course: Course }) {
  return (
    <>
      <section className="ad-panel ad-form">
        <h2>Kurs ma’lumotlari</h2>
        <div className="ad-grid">
          <Field label="Kurs nomi *" name="title" value={c.title} required maxLength={150} />
          <Field label="Sahifa manzili (slug) *" name="slug" value={c.slug} required maxLength={100} />
          <Field label="Narxi — masalan, 1 200 000 so‘m" name="price" value={c.price} maxLength={100} />
          <Field label="Format — masalan, Onlayn" name="format" value={c.format} maxLength={100} />
          <Field label="Boshlanishi — ixtiyoriy" name="start" value={c.start} maxLength={100} />
        </div>
        <Field label="Qisqa jumla *" name="tagline" value={c.tagline} required maxLength={300} />
        <Field
          label="Bosh sahifadagi «Sizga nima kerak?» javobi — bo‘sh bo‘lsa, kurs u yerda chiqmaydi"
          name="need"
          value={c.need || ""}
          maxLength={160}
        />
        <Field label="Kurs haqida *" name="description" value={c.description} required area />
        <PairListEditor
          title="Qadamlar"
          name="steps_json"
          item="Qadam"
          labels={["Sarlavha", "Izoh"]}
          limits={[120, 400]}
          max={6}
          initial={c.steps.map((x) => [x.title, x.text])}
        />
        <Field label="Kurs ichida — har biri yangi satrda" name="contents" value={c.contents.join("\n")} area />
      </section>
      <SEO item={c} />
    </>
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
