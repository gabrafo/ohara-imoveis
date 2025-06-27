// App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

// Importação de contexto
import { AuthProvider } from "./context/AuthContext";

// Importação das Telas
import RegisterScreen from "./pages/RegisterScreen/RegisterScreen";
import LoginScreen from "./pages/LoginScreen/LoginScreen";
import HomeScreen from "./pages/HomeScreen/HomeScreen";
import SearchPropertiesScreen from "./pages/SearchPropertiesScreen/SearchPropertiesScreen";
import PropertyDetailsScreen from "./pages/PropertyDetailsScreen/PropertyDetails";
import ManagementMenuScreen from "./pages/ManagementMenuScreen/ManagementMenuScreen";
import ManageClientsScreen from "./pages/ManageClientesScreen/ManageClientsScreen";
import ManagePropertiesScreen from "./pages/ManagePropertiesScreen/ManagePropertiesScreen";
import ManageVisitsScreen from "./pages/ManageVisitsScreen/ManageVisitsScreen";
import ManageOwnersScreen from "./pages/ManageOwnersScreen/ManageOwnersScreen";
// --- NOVA IMPORTAÇÃO ---
import MyVisitsScreen from "./pages/MyVisitsScreen/MyVisitsScreen";

function RequireAdmin({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null; // ou um spinner
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            {/* Rota padrão redireciona para login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Rotas Públicas */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/search" element={<SearchPropertiesScreen />} />
            <Route path="/imovel/:id" element={<PropertyDetailsScreen />} />
            <Route
              path="/forgot-password"
              element={<div>Página em construção</div>}
            />

            {/* ROTA DO CLIENTE LOGADO */}
            <Route path="/minhas-visitas" element={<MyVisitsScreen />} />

            {/* Rotas de Administração */}
            <Route path="/admin/menu" element={<RequireAdmin><ManagementMenuScreen /></RequireAdmin>} />
            <Route path="/admin/clientes" element={<RequireAdmin><ManageClientsScreen /></RequireAdmin>} />
            <Route path="/admin/imoveis" element={<RequireAdmin><ManagePropertiesScreen /></RequireAdmin>} />
            <Route path="/admin/visitas" element={<RequireAdmin><ManageVisitsScreen /></RequireAdmin>} />
            <Route
              path="/admin/proprietarios"
              element={<RequireAdmin><ManageOwnersScreen /></RequireAdmin>}
            />

            {/* Rota Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
