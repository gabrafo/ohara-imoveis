import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./NavBar.css";
import Logo02 from "../../assets/logo02.svg";

interface NavBarProps {
  activeLink?: string;
}

const NavBar: React.FC<NavBarProps> = ({ activeLink }) => {
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
          <Link to="/login" className={activeLink === "login" ? "active" : ""}>
            Entrar
          </Link>
        </nav>
      </div>
    </motion.header>
  );
};

export default NavBar;
