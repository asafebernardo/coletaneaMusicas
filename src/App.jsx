import { Route, Routes } from "react-router-dom";
import AppFrame from "@/components/AppFrame.jsx";
import HomeLayout from "@/components/HomeLayout.jsx";
import CatalogPage from "@/pages/CatalogPage.jsx";
import SongFormPage from "@/pages/SongFormPage.jsx";
import SongPage from "@/pages/SongPage.jsx";

export default function App() {
  return (
    <AppFrame>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="*" element={<CatalogPage />} />
        </Route>
        <Route path="/musicas/nova" element={<SongFormPage />} />
        <Route path="/musicas/:id/editar" element={<SongFormPage />} />
        <Route path="/musicas/:id" element={<SongPage />} />
      </Routes>
    </AppFrame>
  );
}
