import { createContext, lazy, Suspense, useContext, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { api, getProjects, getServices, initialProjects, initialServices } from "./lib/api";
import { categories as defaultCategories, type Project, type Service } from "../shared/content";
import Home from "./pages/Home";
import { Projects, ProjectDetail } from "./pages/Projects";
import { Services, ServiceDetail } from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import { Journal, JournalDetail } from "./pages/Journal";
import NotFound from "./pages/NotFound";
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
  const [projects, setProjects] = useState(initialProjects);
  const [services, setServices] = useState(initialServices);
  const [categories, setCategories] = useState(defaultCategories);
  const [error, setError] = useState("");

  function refresh() {
    Promise.all([getProjects(), getServices(), api<string[]>("/api/categories")])
      .then(([p, s, c]) => {
        setProjects(p);
        setServices(s);
        setCategories(["Barchasi", ...c]);
        setError("");
      })
      .catch(() =>
        setError("Yangi ma’lumotlarni yuklab bo‘lmadi. Taqdimot ma’lumotlari ko‘rsatilmoqda."),
      );
  }
  useEffect(refresh, []);

  return (
    <Context.Provider value={{ projects, services, categories, error, refresh }}>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="loading-page">Boshqaruv paneli yuklanmoqda…</div>}>
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
