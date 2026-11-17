import { createContext, lazy, Suspense, useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { api, getCourses, getProjects, getServices, initialProjects, initialServices } from "./lib/api";
import { categories as defaultCategories, type Course, type Project, type Service } from "../shared/content";
import Home from "./pages/Home";
import { Projects, ProjectDetail } from "./pages/Projects";
import { Services, ServiceDetail } from "./pages/Services";
import { Courses, CourseDetail } from "./pages/Courses";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import { Journal, JournalDetail } from "./pages/Journal";
import NotFound from "./pages/NotFound";

const Admin = lazy(() => import("./pages/Admin"));

type Content = {
  projects: Project[];
  services: Service[];
  courses: Course[];
  categories: string[];
  /** API javobi kelgunicha false: narxlar faqat bazadan keladi. */
  loaded: boolean;
  error: string;
  refresh: () => void;
};

const Context = createContext<Content>({
  projects: initialProjects,
  services: initialServices,
  courses: [],
  categories: defaultCategories,
  loaded: false,
  error: "",
  refresh: () => {},
});

export const useContent = () => useContext(Context);

export default function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [services, setServices] = useState(initialServices);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  function refresh() {
    Promise.all([getProjects(), getServices(), getCourses(), api<string[]>("/api/categories")])
      .then(([p, s, k, c]) => {
        setProjects(p);
        setServices(s);
        setCourses(k);
        setCategories(["Barchasi", ...c]);
        setLoaded(true);
        setError("");
      })
      .catch(() => setError("Yangi ma’lumotlarni yuklab bo‘lmadi. Sahifani yangilab ko‘ring."));
  }
  useEffect(refresh, []);

  return (
    <Context.Provider value={{ projects, services, courses, categories, loaded, error, refresh }}>
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
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:slug" element={<CourseDetail />} />
          <Route path="academy" element={<Navigate to="/courses" replace />} />
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
