import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { PublicShell } from "./components/layout/PublicShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { ToastViewport } from "./components/common/ToastViewport";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { EmpresasPage } from "./pages/EmpresasPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { FavoritosPage } from "./pages/FavoritosPage";
import { BusquedaPage } from "./pages/BusquedaPage";
import { MensajesPage } from "./pages/MensajesPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { ComprobantesPage } from "./pages/ComprobantesPage";
import { ReportesPage } from "./pages/ReportesPage";
import { PublicidadesPage } from "./pages/PublicidadesPage";
import { NotificacionesPage } from "./pages/NotificacionesPage";
import { PerfilPage } from "./pages/PerfilPage";
import { PermissionGate } from "./components/common/PermissionGate";
import { AdminLivePage } from "./pages/AdminLivePage";
import { PublicEmpresaDetallePage } from "./pages/PublicEmpresaDetallePage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PublicShell />}>
          <Route path="/" element={<EmpresasPage readOnly />} />
          <Route path="/empresas" element={<EmpresasPage readOnly />} />
          <Route path="/empresas/:empresaId" element={<PublicEmpresaDetallePage />} />
          <Route path="/marketplace" element={<MarketplacePage readOnly />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="empresas" element={<EmpresasPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="favoritos" element={<FavoritosPage />} />
          <Route path="busqueda" element={<BusquedaPage />} />
          <Route path="mensajes" element={<MensajesPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="comprobantes" element={<ComprobantesPage />} />
          <Route
            path="reportes"
            element={
              <PermissionGate
                anyOf={["ver_reportes"]}
                fallback={<Navigate to="/admin" replace />}
              >
                <ReportesPage />
              </PermissionGate>
            }
          />
          <Route path="publicidades" element={<PublicidadesPage />} />
          <Route
            path="admin-live"
            element={
              <PermissionGate adminOnly fallback={<Navigate to="/admin" replace />}>
                <AdminLivePage />
              </PermissionGate>
            }
          />
          <Route path="notificaciones" element={<NotificacionesPage />} />
          <Route path="perfil" element={<PerfilPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastViewport />
    </>
  );
}

export default App;
