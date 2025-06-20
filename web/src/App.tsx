import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RegisterScreen from "./pages/RegisterScreen/RegisterScreen";
import LoginScreen from "./pages/LoginScreen/LoginScreen";
import HomeScreen from "./pages/HomeScreen/HomeScreen";
import SearchPropertiesScreen from "./pages/SearchPropertiesScreen/SearchPropertiesScreen";
import PropertyDetailsScreen from "./pages/PropertyDetailsScreen/PropertyDetails";

import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const auth = useAuth();
  if (!auth || auth.loading) return <div>Carregando...</div>;
  if (!auth.user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            {/* Rota padrão redireciona para home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Rotas existentes */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/search" element={<SearchPropertiesScreen />} />

            {/* ATUALIZADO: Nova rota para detalhes do imóvel */}
            <Route path="/imovel/:id" element={<PropertyDetailsScreen />} />

            <Route
              path="/forgot-password"
              element={<div>Página em construção</div>}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
