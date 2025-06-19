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

function App() {
  return (
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
          <Route path="/home" element={<HomeScreen />} />

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
  );
}

export default App;
