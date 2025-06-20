import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import "./Footer.css";
import Logo02 from "../../assets/logo02.svg";

const Footer: React.FC = () => {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img
                src={Logo02}
                alt="Ohara Imóveis"
                className="footer-logo-image"
              />
            </div>
            <p>
              Uma nova forma para você viver com Ohara Imóveis. Alugamos ou
              compramos o seu próximo lar ou sua próxima oportunidade.
            </p>
          </div>
          <div className="footer-section">
            <h4>Links Rápidos</h4>
            <ul>
              <li>
                <a href="#inicio">Início</a>
              </li>
              <li>
                <a href="#alugar">Alugar Imóveis</a>
              </li>
              <li>
                <a href="#comprar">Comprar</a>
              </li>
              <li>
                <a href="#sobre">Sobre Nós</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contato</h4>
            <div className="contact-info">
              <p className="contact-item">
                <MapPin size={16} />
                <span>
                  Centenário SN - 100 - 1842
                  <br />
                  Lavras Garcia - MG 030-100
                </span>
              </p>
              <p className="contact-item">
                <Phone size={16} />
                <span>(35) 9999-26933</span>
              </p>
              <p className="contact-item">
                <Mail size={16} />
                <span>ohara.imoveis@gmail.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
