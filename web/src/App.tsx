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
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const auth = useAuth();

  // Garantimos que auth não é undefined antes de acessar suas propriedades.
  if (!auth || auth.loading) {
    return <div>Carregando...</div>;
  }

  if (!auth.user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
    <Router>
      <div>
        <Routes>
          {/* Rota padrão redireciona para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rota de login */}
          <Route path="/login" element={<LoginScreen />} />

          {/* Rota de cadastro */}
          <Route path="/register" element={<RegisterScreen />} />

          {/* Rota da página inicial/home */}
          <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />

          {/* Rota para "esqueci a senha" (pode criar depois) */}
          <Route
            path="/forgot-password"
            element={<div>Página em construção</div>}
          />

          {/* Rota 404 - página não encontrada */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
