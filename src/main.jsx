import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { initTheme } from "@/lib/theme.js";
import "./index.css";

initTheme();

const rawBase = import.meta.env.BASE_URL || "/";
const basename = rawBase === "/" ? undefined : rawBase.replace(/\/$/, "");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${rawBase.replace(/\/$/, "")}/sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      /* ignore service worker registration errors */
    });
  });
}
