import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import {
  getProjects,
  getServices,
  initialProjects,
  initialServices,
} from "./lib/api";
import {
  categories as defaultCategories,
  type Project,
  type Service,
} from "../shared/content";
import { api } from "./lib/api";
import {
  Home,
  Projects,
  ProjectDetail,
  Services,
  ServiceDetail,
  About,
  Contact,
  Privacy,
  NotFound,
  Journal,
  JournalDetail,
} from "./pages/Main";
import { Academy, Library, Films, Render } from "./pages/Ecosystem";
const Admin = lazy(() => import("./pages/Admin"));
type Content = {
  projects: Project[];
  services: Service[];
  categories: string[];
  error: string;
  refresh: () => void;
};
const Context = createContext<Content>({
  projects: initialProjects,
  services: initialServices,
  categories: defaultCategories,
  error: "",
  refresh: () => {},
});
export const useContent = () => useContext(Context);
export default function App() {
  const [projects, setProjects] = useState(initialProjects),
    [services, setServices] = useState(initialServices),
    [categories, setCategories] = useState(defaultCategories),
    [error, setError] = useState("");
  function refresh() {
    Promise.all([
      getProjects(),
      getServices(),
      api<string[]>("/api/categories"),
    ])
      .then(([p, s, c]) => {
        setProjects(p);
        setServices(s);
        setCategories(["Barchasi", ...c]);
        setError("");
      })
      .catch(() =>
        setError(
          "Yangi ma’lumotlarni yuklab bo‘lmadi. Taqdimot ma’lumotlari ko‘rsatilmoqda.",
        ),
      );
  }
  useEffect(refresh, []);
  return (
    <Context.Provider
      value={{ projects, services, categories, error, refresh }}
    >
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense
              fallback={
                <div className="loading-page">
                  Boshqaruv paneli yuklanmoqda…
                </div>
              }
            >
              <Admin />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="academy" element={<Academy />} />
          <Route path="library" element={<Library />} />
          <Route path="films" element={<Films />} />
          <Route path="render" element={<Render />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/:slug" element={<JournalDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Context.Provider>
  );
}
