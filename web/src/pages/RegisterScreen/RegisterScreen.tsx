import React, { useState } from "react";
import "./RegisterScreen.css"; // Importando nossos estilos
import logo from "../../assets/logo.svg"; // Importando o logo

const RegisterScreen: React.FC = () => {
  // Estados para controlar os valores dos inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Função para lidar com o envio do formulário
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Previne o recarregamento da página

    console.log({
      name,
      email,
      password,
    });

    alert(`Cadastro enviado!\nNome: ${name}\nEmail: ${email}`);
  };

  return (
    <div className="register-container">
      {/* Seção do Formulário (esquerda) */}
      <div className="form-section">
        <h1>Bem-vindo à Ohara Imóveis!</h1>
        <p>Faça seu cadastro para ter acesso completo à nossa plataforma.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
          </div>

          <button type="submit">Cadastrar</button>
        </form>

        <div className="login-link">
          Já tem uma conta? <a href="/login">Entrar</a>
        </div>
      </div>

      {/* Seção do Logo (direita) */}
      <div className="logo-section">
        <img src={logo} alt="Ohara Imóveis Logo" className="logo-pic" />
      </div>
    </div>
  );
};

export default RegisterScreen;
