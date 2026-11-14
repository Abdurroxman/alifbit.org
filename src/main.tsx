import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { bootMotion } from "./lib/motion";
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/layout.css";
import "./styles/motion.css";
import "./styles/art.css";
import "./styles/intro.css";
import "./styles/hero.css";
import "./styles/process.css";
import "./styles/home.css";
import "./styles/pages.css";
import "./styles/sado-promo.css";

// Kirish rejimi birinchi chizishdan oldin aniqlanadi, sahifa lip etib ko'rinmaydi.
bootMotion();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
