import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Link já estava importado, o que é ótimo!
import type { Variants } from "framer-motion";
import { Search, Bed, Bath, Square, MapPin } from "lucide-react";
import "./HomeScreen.css";
import HousePic from "../../assets/house01.png";
import CasaGrid from "../../assets/casagrid01.png";
import CasaGrid2 from "../../assets/casagrid02.png";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import CasaAbout from "../../assets/casa1.png";

interface Property {
  id: number;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
}

const HomeScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Alugar");

  const properties: Property[] = [
    {
      id: 1,
      price: "R$ 12.000",
      location: "Centenário, Lavras",
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      image: CasaGrid,
    },
    {
      id: 2,
      price: "R$ 15.000",
      location: "Centro, Lavras",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: CasaGrid2,
    },
    {
      id: 3,
      price: "R$ 18.000",
      location: "Aquenta Sol, Lavras",
      bedrooms: 3,
      bathrooms: 2,
      area: 140,
      image: CasaGrid,
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants: Variants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: { y: -10, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  return (
    <div className="app">
      <NavBar />

      <section className="hero">
        <div className="container">
          <motion.div
            className="hero-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="hero-left">
              <motion.h1 className="hero-title" variants={itemVariants}>
                Encontre um lar para chamar de seu
              </motion.h1>
              <motion.p className="hero-subtitle" variants={itemVariants}>
                Facilidade para quem quer comprar, vender ou alugar.
              </motion.p>
              <motion.div className="search-tabs" variants={itemVariants}>
                {["Alugar", "Comprar", "Vender"].map((tab) => (
                  <motion.button
                    key={tab}
                    className={`tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab}
                  </motion.button>
                ))}
              </motion.div>
              <motion.div className="search-bar" variants={itemVariants}>
                <input
                  type="text"
                  placeholder="Pesquise por código, bairro ou rua"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <motion.button
                  className="search-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Search size={20} />
                </motion.button>
              </motion.div>

              {/* --- BOTÃO "VER TODOS IMÓVEIS" ATUALIZADO COM LINK --- */}
              <Link to="/search">
                <motion.button
                  className="view-all-btn"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ver todos imóveis ›
                </motion.button>
              </Link>
            </div>
            <motion.div
              className="hero-right"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <img
                src={HousePic}
                alt="Modern living room"
                className="hero-image"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="featured">
        <div className="container">
          <motion.h2
            className="featured-title"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Imóveis em Destaque
          </motion.h2>
          <motion.div
            className="properties-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {properties.map((property) => (
              <motion.div
                key={property.id}
                className="property-card"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="property-image">
                  <img src={property.image} alt={`Property ${property.id}`} />
                </div>
                <div className="property-info">
                  <div className="property-price">{property.price}</div>
                  <div className="property-location">
                    <MapPin size={14} />
                    <span>{property.location}</span>
                  </div>
                  <div className="property-details">
                    <span className="property-detail">
                      <Bed size={16} />
                      <span>{property.bedrooms}</span>
                    </span>
                    <span className="property-detail">
                      <Bath size={16} />
                      <span>{property.bathrooms}</span>
                    </span>
                    <span className="property-detail">
                      <Square size={16} />
                      <span>{property.area}m²</span>
                    </span>
                  </div>

                  {/* --- BOTÃO "VER DETALHES" ADICIONADO --- */}
                  <Link
                    to={`/imovel/${property.id}`}
                    className="details-btn-link"
                  >
                    <button className="details-btn">Ver detalhes</button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <motion.div
            className="about-content"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="about-left"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <img
                src={CasaAbout}
                alt="Modern interior"
                className="about-image"
              />
            </motion.div>
            <motion.div
              className="about-right"
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h2>Sobre a Ohara Imóveis</h2>
              <p>
                A Ohara Imóveis representa a evolução do mercado imobiliário em
                Lavras. Nascemos da união de uma vasta expertise local e a
                inovação tecnológica, aliando experiência mais moderna para
                garantir que você busca por um imóvel seja eficiente, prática e
                segura.
              </p>
              <p>
                Entendemos que a tecnologia é apenas uma parte da equação. Nosso
                time é formado por especialistas apaixonados pelo mercado de
                Lavras, prontos para oferecer um atendimento personalizado e
                estratégico.
              </p>
              <motion.button
                className="cta-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Fale conosco ›
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomeScreen;
