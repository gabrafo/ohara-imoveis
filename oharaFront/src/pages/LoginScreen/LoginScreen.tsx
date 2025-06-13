import React, { useState } from "react";
import "./LoginScreen.css"; // Importando nossos estilos
import logo from "../../assets/logo.svg"; // Importando o logo

const LoginScreen: React.FC = () => {
  // Estados para controlar os valores dos inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Função para lidar com o envio do formulário
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Previne o recarregamento da página

    console.log({
      email,
      password,
    });

    alert(`Login enviado!\nEmail: ${email}`);
  };

  return (
    <div className="login-container">
      {/* Seção do Formulário (esquerda) */}
      <div className="form-section">
        <h1>Bem-vindo de volta!</h1>
        <p>Faça seu login para acessar sua conta na Ohara Imóveis.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="forgot-password">
              <a href="/forgot-password">Esqueci a senha</a>
            </div>
          </div>

          <button type="submit">Entrar</button>
        </form>

        <div className="register-link">
          Não tem uma conta? <a href="/register">Cadastrar</a>
        </div>
      </div>

      {/* Seção do Logo (direita) */}
      <div className="logo-section">
        <img src={logo} alt="Ohara Imóveis Logo" className="logo-pic" />
      </div>
    </div>
  );
};

export default LoginScreen;
