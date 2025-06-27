import React, { useState } from "react";
import { motion, easeOut } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Ícones para o menu móvel
import Logo02 from "../../assets/logo02.svg";
import "./ManagementNavBar.css";
import { useAuth } from "../../context/AuthContext";

const ManagementNavBar: React.FC = () => {
  // Estado para controlar a abertura/fechamento do menu em dispositivos móveis
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Função para alternar o estado do menu
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <motion.header
      className="mgmt-navbar"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: easeOut }}
    >
      <div className="container">
        <div className="mgmt-navbar-logo">
          <NavLink to="/home" onClick={() => setMenuOpen(false)}>
            <img src={Logo02} alt="Ohara Imóveis Logo" className="logo-image" />
          </NavLink>
        </div>

        {/* Adiciona a classe 'active' quando o menu estiver aberto */}
        <nav className={`mgmt-navbar-nav ${isMenuOpen ? "active" : ""}`}>
          <NavLink to="/admin/menu" onClick={toggleMenu}>
            Menu Principal
          </NavLink>
          <NavLink to="/admin/clientes" onClick={toggleMenu}>
            Clientes
          </NavLink>
          <NavLink to="/admin/imoveis" onClick={toggleMenu}>
            Imóveis
          </NavLink>
          <NavLink to="/admin/visitas" onClick={toggleMenu}>
            Visitas
          </NavLink>
          <NavLink to="/admin/proprietarios" onClick={toggleMenu}>
            Proprietarios
          </NavLink>
          {user && (
            <button
              className="mgmt-logout-btn"
              onClick={handleLogout}
            >
              Sair
            </button>
          )}
        </nav>

        {/* Botão do menu hambúrguer que só aparece em telas menores */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Abrir menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </motion.header>
  );
};

export default ManagementNavBar;
