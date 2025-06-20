import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import type { Variants } from "framer-motion";
import { Search, Bed, Bath, Square, MapPin } from "lucide-react";
import "./SearchPropertiesScreen.css";
import CasaGrid from "../../assets/casagrid01.png";
import CasaGrid2 from "../../assets/casagrid02.png";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";

interface Property {
  id: number;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  type: string;
  transactionType: "Alugar" | "Comprar"; // Nova propriedade
}

const SearchPropertiesScreen: React.FC = () => {
  const navigate = useNavigate(); // Hook para navegação
  const [activeTab, setActiveTab] = useState("Alugar");
  const [propertyType, setPropertyType] = useState("Tipo de Imóvel");
  const [priceRange, setPriceRange] = useState("Preço do Imóvel");
  const [rooms, setRooms] = useState("1+Quartos");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  // Mock data com todas as 12 propriedades - agora com transactionType
  const allProperties: Property[] = [
    {
      id: 1,
      price: "R$ 12.000",
      location: "Centenário, Lavras",
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      image: CasaGrid,
      type: "Apartamento",
      transactionType: "Alugar",
    },
    {
      id: 2,
      price: "R$ 22.000",
      location: "Centro, Lavras",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: CasaGrid2,
      type: "Casa",
      transactionType: "Comprar",
    },
    {
      id: 3,
      price: "R$ 8.000",
      location: "Aquenta Sol, Lavras",
      bedrooms: 3,
      bathrooms: 2,
      area: 140,
      image: CasaGrid,
      type: "Apartamento",
      transactionType: "Alugar",
    },
    {
      id: 4,
      price: "R$ 14.000",
      location: "Centenário, Lavras",
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      image: CasaGrid2,
      type: "Casa",
      transactionType: "Alugar",
    },
    {
      id: 5,
      price: "R$ 18.000",
      location: "Centro, Lavras",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: CasaGrid,
      type: "Apartamento",
      transactionType: "Comprar",
    },
    {
      id: 6,
      price: "R$ 9.500",
      location: "Aquenta Sol, Lavras",
      bedrooms: 3,
      bathrooms: 2,
      area: 140,
      image: CasaGrid2,
      type: "Casa",
      transactionType: "Alugar",
    },
    {
      id: 7,
      price: "R$ 25.000",
      location: "Centenário, Lavras",
      bedrooms: 4,
      bathrooms: 3,
      area: 180,
      image: CasaGrid,
      type: "Casa",
      transactionType: "Comprar",
    },
    {
      id: 8,
      price: "R$ 16.000",
      location: "Centro, Lavras",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: CasaGrid2,
      type: "Apartamento",
      transactionType: "Alugar",
    },
    {
      id: 9,
      price: "R$ 7.500",
      location: "Aquenta Sol, Lavras",
      bedrooms: 2,
      bathrooms: 1,
      area: 75,
      image: CasaGrid,
      type: "Apartamento",
      transactionType: "Alugar",
    },
    {
      id: 10,
      price: "R$ 30.000",
      location: "Centenário, Lavras",
      bedrooms: 4,
      bathrooms: 3,
      area: 200,
      image: CasaGrid2,
      type: "Casa",
      transactionType: "Comprar",
    },
    {
      id: 11,
      price: "R$ 11.000",
      location: "Centro, Lavras",
      bedrooms: 2,
      bathrooms: 1,
      area: 90,
      image: CasaGrid,
      type: "Apartamento",
      transactionType: "Alugar",
    },
    {
      id: 12,
      price: "R$ 19.500",
      location: "Aquenta Sol, Lavras",
      bedrooms: 3,
      bathrooms: 2,
      area: 140,
      image: CasaGrid2,
      type: "Casa",
      transactionType: "Comprar",
    },
  ];

  const extractPriceValue = (priceString: string): number => {
    return parseInt(priceString.replace(/[^\d]/g, ""));
  };

  const handleSearch = () => {
    const filtered = allProperties.filter((property) => {
      // Filtro por tipo de transação (Alugar/Comprar)
      const matchesTransaction = property.transactionType === activeTab;

      const matchesType =
        propertyType === "Tipo de Imóvel" || property.type === propertyType;
      const matchesRooms =
        rooms === "1+Quartos" || property.bedrooms >= parseInt(rooms);
      let matchesPrice = true;
      if (priceRange !== "Preço do Imóvel") {
        const propertyPrice = extractPriceValue(property.price);
        switch (priceRange) {
          case "Até R$ 10.000":
            matchesPrice = propertyPrice <= 10000;
            break;
          case "R$ 10.000 - R$ 15.000":
            matchesPrice = propertyPrice > 10000 && propertyPrice <= 15000;
            break;
          case "R$ 15.000 - R$ 20.000":
            matchesPrice = propertyPrice > 15000 && propertyPrice <= 20000;
            break;
          case "Acima de R$ 20.000":
            matchesPrice = propertyPrice > 20000;
            break;
        }
      }
      return matchesTransaction && matchesType && matchesRooms && matchesPrice;
    });
    setFilteredProperties(filtered);
  };

  // Função para navegar para a página de detalhes
  const handleViewDetails = (propertyId: number) => {
    navigate(`/imovel/${propertyId}`);
  };

  // Atualizar filtros automaticamente quando activeTab mudar
  React.useEffect(() => {
    handleSearch();
  }, [activeTab]);

  React.useEffect(() => {
    setFilteredProperties(
      allProperties.filter((property) => property.transactionType === activeTab)
    );
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
    <div className="search-app">
      <NavBar />
      <section className="search-hero">
        <div className="container">
          <motion.div
            className="search-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="search-hero-title">Encontre seu Imóvel</h1>
            <p className="search-hero-subtitle">
              Use os filtros abaixo para encontrar o imóvel perfeito para você.
            </p>

            <div className="search-form">
              <div className="search-filters">
                <div className="search-tabs-container">
                  {["Alugar", "Comprar"].map((tab) => (
                    <button
                      key={tab}
                      className={`search-tab ${
                        activeTab === tab ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="filter-group">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="filter-select"
                  >
                    <option>Tipo de Imóvel</option>
                    <option>Casa</option>
                    <option>Apartamento</option>
                  </select>
                </div>

                <div className="filter-group">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="filter-select"
                  >
                    <option>Preço do Imóvel</option>
                    <option>Até R$ 10.000</option>
                    <option>R$ 10.000 - R$ 15.000</option>
                    <option>R$ 15.000 - R$ 20.000</option>
                    <option>Acima de R$ 20.000</option>
                  </select>
                </div>

                <div className="filter-group">
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="filter-select"
                  >
                    <option>1+Quartos</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4+</option>
                  </select>
                </div>
              </div>

              <motion.button
                className="search-action-btn"
                onClick={handleSearch}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search size={20} />
                Buscar Imóveis
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="search-results">
        <div className="container">
          <h2 className="results-count">
            {filteredProperties.length} Imóveis Encontrados
          </h2>
          <motion.div
            className="results-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredProperties.map((property) => (
              <motion.div
                key={property.id}
                className="result-card"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="result-image">
                  <img src={property.image} alt={`Property ${property.id}`} />
                  <div className="result-badge">{property.transactionType}</div>
                </div>
                <div className="result-info">
                  <div className="result-price">{property.price}</div>
                  <div className="result-location">
                    <MapPin size={14} />
                    <span>{property.location}</span>
                  </div>
                  <div className="result-details">
                    <span className="result-detail">
                      <Bed size={16} />
                      <span>{property.bedrooms}</span>
                    </span>
                    <span className="result-detail">
                      <Bath size={16} />
                      <span>{property.bathrooms}</span>
                    </span>
                    <span className="result-detail">
                      <Square size={16} />
                      <span>{property.area}m²</span>
                    </span>
                  </div>
                  <motion.button
                    className="result-details-btn"
                    onClick={() => handleViewDetails(property.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Ver detalhes →
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SearchPropertiesScreen;
