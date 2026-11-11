import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import AppFrame from "@/components/AppFrame.jsx";
import HomeLayout from "@/components/HomeLayout.jsx";
import { isStandaloneMode } from "@/lib/pwa.js";
import AppInfoPage from "@/pages/AppInfoPage.jsx";
import CatalogPage from "@/pages/CatalogPage.jsx";
import CategoriesPage from "@/pages/CategoriesPage.jsx";
import LandingPage from "@/pages/LandingPage.jsx";
import SettingsPage from "@/pages/SettingsPage.jsx";
import SongFormPage from "@/pages/SongFormPage.jsx";
import SongInfoPage from "@/pages/SongInfoPage.jsx";
import SongPage from "@/pages/SongPage.jsx";

const WEB_MODE_KEY = "coletanea-web-mode";

function readEnteredWeb() {
  if (isStandaloneMode()) return true;
  try {
    return sessionStorage.getItem(WEB_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function App() {
  const [enteredWeb, setEnteredWeb] = useState(readEnteredWeb);
  const navigate = useNavigate();

  const enterWebApp = () => {
    try {
      sessionStorage.setItem(WEB_MODE_KEY, "1");
    } catch {
      /* ignore */
    }
    setEnteredWeb(true);
  };

  if (!enteredWeb) {
    return (
      <AppFrame>
        <LandingPage onEnterWeb={enterWebApp} />
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <Routes>
        <Route
          path="/inicio"
          element={
            <LandingPage
              onEnterWeb={() => {
                enterWebApp();
                navigate("/", { replace: true });
              }}
            />
          }
        />
        <Route element={<HomeLayout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/sobre" element={<AppInfoPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<CatalogPage />} />
        </Route>
        <Route path="/musicas/nova" element={<SongFormPage />} />
        <Route path="/musicas/:id/editar" element={<SongFormPage />} />
        <Route path="/musicas/:id/info" element={<SongInfoPage />} />
        <Route path="/musicas/:id" element={<SongPage />} />
      </Routes>
    </AppFrame>
  );
}
