import { Route, Routes } from "react-router-dom";
import AppFrame from "@/components/AppFrame.jsx";
import HomeLayout from "@/components/HomeLayout.jsx";
import CatalogPage from "@/pages/CatalogPage.jsx";
import CategoriesPage from "@/pages/CategoriesPage.jsx";
import SettingsPage from "@/pages/SettingsPage.jsx";
import SongFormPage from "@/pages/SongFormPage.jsx";
import SongInfoPage from "@/pages/SongInfoPage.jsx";
import SongPage from "@/pages/SongPage.jsx";

export default function App() {
  return (
    <AppFrame>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<CatalogPage />} />
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
