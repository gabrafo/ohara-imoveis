import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";
import Logo02 from "../../assets/logo02.svg";
import { useAuth } from "../../context/AuthContext";

interface NavBarProps {
  activeLink?: string;
}

const NavBar: React.FC<NavBarProps> = ({ activeLink }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <motion.header
      className="navbar"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container">
        <div className="navbar-logo">
          <Link to="/home">
            <img
              src={Logo02}
              alt="Ohara Imóveis"
              className="navbar-logo-image"
            />
          </Link>
        </div>
        <nav className="navbar-nav">
          <Link to="/home" className={activeLink === "home" ? "active" : ""}>
            Início
          </Link>
          <Link
            to="/search"
            className={activeLink === "search" ? "active" : ""}
          >
            Buscar Imóveis
          </Link>
          {user ? (
            <button className="navbar-link-btn" onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', padding: 0 }}>
              Sair
            </button>
          ) : (
            <Link to="/login" className={activeLink === "login" ? "active" : ""}>
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default NavBar;
