import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AppFrame from "@/components/AppFrame.jsx";
import HomeLayout from "@/components/HomeLayout.jsx";
import { isStandaloneMode } from "@/lib/pwa.js";
import { canManageSongs } from "@/lib/songs.js";
import AppInfoPage from "@/pages/AppInfoPage.jsx";
import CatalogPage from "@/pages/CatalogPage.jsx";
import CategoriesPage from "@/pages/CategoriesPage.jsx";
import FavoritesPage from "@/pages/FavoritesPage.jsx";
import InstallAppPage from "@/pages/InstallAppPage.jsx";
import LandingPage from "@/pages/LandingPage.jsx";
import MissingPreviewsPage from "@/pages/MissingPreviewsPage.jsx";
import PreviewsPage from "@/pages/PreviewsPage.jsx";
import SettingsPage from "@/pages/SettingsPage.jsx";
import SongFormPage from "@/pages/SongFormPage.jsx";
import SongThemeAddPage from "@/pages/SongThemeAddPage.jsx";
import SongThemePage from "@/pages/SongThemePage.jsx";
import SongThemesPage from "@/pages/SongThemesPage.jsx";
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
  const canManage = canManageSongs();
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
          <Route path="/mais" element={<CategoriesPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route path="/previsualizacao" element={<PreviewsPage />} />
          <Route
            path="/admin/previews"
            element={canManage ? <MissingPreviewsPage /> : <Navigate to="/mais" replace />}
          />
          <Route path="/instalar" element={<InstallAppPage />} />
          <Route path="/sobre" element={<AppInfoPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/temas" element={<SongThemesPage />} />
          <Route path="/temas/:themeId/adicionar" element={<SongThemeAddPage />} />
          <Route path="/temas/:themeId" element={<SongThemePage />} />
          <Route path="*" element={<CatalogPage />} />
        </Route>
        <Route
          path="/musicas/nova"
          element={canManage ? <SongFormPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/musicas/:id/editar"
          element={canManage ? <SongFormPage /> : <Navigate to="/" replace />}
        />
        <Route path="/musicas/:id" element={<SongPage />} />
      </Routes>
    </AppFrame>
  );
}
