import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { Variants } from "framer-motion";
import {
  Search,
  Bed,
  Bath,
  Square,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  type: "Apartamento" | "Casa" | "Kitnet";
  transactionType: "Alugar" | "Comprar";
}

// --- MOCK DATA EXPANDIDO PARA 28 IMÓVEIS ---
const allProperties: Property[] = [
  // Alugar
  {
    id: 1,
    price: "R$ 1.200",
    location: "Centenário, Lavras",
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    image: CasaGrid,
    type: "Apartamento",
    transactionType: "Alugar",
  },
  {
    id: 3,
    price: "R$ 800",
    location: "Aquenta Sol, Lavras",
    bedrooms: 1,
    bathrooms: 1,
    area: 40,
    image: CasaGrid,
    type: "Kitnet",
    transactionType: "Alugar",
  },
  {
    id: 4,
    price: "R$ 1.400",
    location: "Jardim Glória, Lavras",
    bedrooms: 2,
    bathrooms: 1,
    area: 90,
    image: CasaGrid2,
    type: "Casa",
    transactionType: "Alugar",
  },
  {
    id: 6,
    price: "R$ 950",
    location: "Vila Rica, Lavras",
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    image: CasaGrid2,
    type: "Apartamento",
    transactionType: "Alugar",
  },
  {
    id: 8,
    price: "R$ 1.600",
    location: "Centro, Lavras",
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    image: CasaGrid2,
    type: "Apartamento",
    transactionType: "Alugar",
  },
  {
    id: 9,
    price: "R$ 750",
    location: "Universitário, Lavras",
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    image: CasaGrid,
    type: "Kitnet",
    transactionType: "Alugar",
  },
  {
    id: 11,
    price: "R$ 1.100",
    location: "Colinas da Serra, Lavras",
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    image: CasaGrid,
    type: "Apartamento",
    transactionType: "Alugar",
  },
  {
    id: 13,
    price: "R$ 2.500",
    location: "Vale do Sol, Lavras",
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    image: CasaGrid,
    type: "Casa",
    transactionType: "Alugar",
  },
  {
    id: 14,
    price: "R$ 1.350",
    location: "Lavrinhas, Lavras",
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    image: CasaGrid2,
    type: "Apartamento",
    transactionType: "Alugar",
  },
  {
    id: 15,
    price: "R$ 850",
    location: "Centro, Lavras",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    image: CasaGrid,
    type: "Kitnet",
    transactionType: "Alugar",
  },
  {
    id: 16,
    price: "R$ 1.700",
    location: "Jardim Europa, Lavras",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: CasaGrid2,
    type: "Casa",
    transactionType: "Alugar",
  },
  {
    id: 17,
    price: "R$ 1.250",
    location: "Centenário, Lavras",
    bedrooms: 2,
    bathrooms: 1,
    area: 88,
    image: CasaGrid,
    type: "Apartamento",
    transactionType: "Alugar",
  },
  {
    id: 25,
    price: "R$ 1.900",
    location: "Vila Paraíso, Lavras",
    bedrooms: 3,
    bathrooms: 2,
    area: 130,
    image: CasaGrid,
    type: "Casa",
    transactionType: "Alugar",
  },
  {
    id: 26,
    price: "R$ 900",
    location: "Tipuana, Lavras",
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    image: CasaGrid2,
    type: "Apartamento",
    transactionType: "Alugar",
  },

  // Comprar
  {
    id: 2,
    price: "R$ 420.000",
    location: "Centro, Lavras",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: CasaGrid2,
    type: "Casa",
    transactionType: "Comprar",
  },
  {
    id: 5,
    price: "R$ 280.000",
    location: "Jardim Glória, Lavras",
    bedrooms: 3,
    bathrooms: 2,
    area: 100,
    image: CasaGrid,
    type: "Apartamento",
    transactionType: "Comprar",
  },
  {
    id: 7,
    price: "R$ 650.000",
    location: "Condomínio Flamboyant, Lavras",
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    image: CasaGrid,
    type: "Casa",
    transactionType: "Comprar",
  },
  {
    id: 10,
    price: "R$ 300.000",
    location: "Centenário, Lavras",
    bedrooms: 2,
    bathrooms: 2,
    area: 90,
    image: CasaGrid2,
    type: "Apartamento",
    transactionType: "Comprar",
  },
  {
    id: 12,
    price: "R$ 595.000",
    location: "Aquenta Sol, Lavras",
    bedrooms: 3,
    bathrooms: 3,
    area: 220,
    image: CasaGrid2,
    type: "Casa",
    transactionType: "Comprar",
  },
  {
    id: 18,
    price: "R$ 180.000",
    location: "Vila Rica, Lavras",
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    image: CasaGrid,
    type: "Apartamento",
    transactionType: "Comprar",
  },
  {
    id: 19,
    price: "R$ 750.000",
    location: "Jardim Europa, Lavras",
    bedrooms: 4,
    bathrooms: 4,
    area: 320,
    image: CasaGrid2,
    type: "Casa",
    transactionType: "Comprar",
  },
  {
    id: 20,
    price: "R$ 150.000",
    location: "Universitário, Lavras",
    bedrooms: 1,
    bathrooms: 1,
    area: 40,
    image: CasaGrid,
    type: "Kitnet",
    transactionType: "Comprar",
  },
  {
    id: 21,
    price: "R$ 320.000",
    location: "Colinas da Serra, Lavras",
    bedrooms: 3,
    bathrooms: 2,
    area: 115,
    image: CasaGrid2,
    type: "Casa",
    transactionType: "Comprar",
  },
  {
    id: 22,
    price: "R$ 250.000",
    location: "Lavrinhas, Lavras",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    image: CasaGrid,
    type: "Apartamento",
    transactionType: "Comprar",
  },
  {
    id: 23,
    price: "R$ 890.000",
    location: "Condomínio Flamboyant, Lavras",
    bedrooms: 5,
    bathrooms: 5,
    area: 400,
    image: CasaGrid2,
    type: "Casa",
    transactionType: "Comprar",
  },
  {
    id: 24,
    price: "R$ 210.000",
    location: "Centro, Lavras",
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    image: CasaGrid,
    type: "Apartamento",
    transactionType: "Comprar",
  },
  {
    id: 27,
    price: "R$ 450.000",
    location: "Vila Paraíso, Lavras",
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    image: CasaGrid,
    type: "Casa",
    transactionType: "Comprar",
  },
  {
    id: 28,
    price: "R$ 195.000",
    location: "Tipuana, Lavras",
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    image: CasaGrid2,
    type: "Apartamento",
    transactionType: "Comprar",
  },
];

const SearchPropertiesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Alugar");
  const [propertyType, setPropertyType] = useState("Tipo de Imóvel");
  const [priceRange, setPriceRange] = useState("Preço do Imóvel");
  const [rooms, setRooms] = useState("1+ Quartos");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  // --- ESTADOS PARA PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(9);
  const resultsRef = useRef<HTMLElement>(null);

  const extractPriceValue = (priceString: string): number => {
    return parseInt(priceString.replace(/[^\d]/g, ""));
  };

  const handleSearch = () => {
    const filtered = allProperties.filter((property) => {
      const matchesTransaction = property.transactionType === activeTab;
      const matchesType =
        propertyType === "Tipo de Imóvel" || property.type === propertyType;
      const matchesRooms =
        rooms === "1+ Quartos" || property.bedrooms >= parseInt(rooms);

      let matchesPrice = true;
      if (priceRange !== "Preço do Imóvel") {
        const propertyPrice = extractPriceValue(property.price);
        const range = priceRange.replace(/[^\d-]/g, "").split("-");
        const minPrice = parseInt(range[0]) * 1000;
        const maxPrice = range[1] ? parseInt(range[1]) * 1000 : Infinity;
        matchesPrice =
          propertyPrice >= minPrice &&
          (maxPrice === Infinity ? true : propertyPrice <= maxPrice);
      }
      return matchesTransaction && matchesType && matchesRooms && matchesPrice;
    });
    setFilteredProperties(filtered);
    setCurrentPage(1); // Reseta para a primeira página a cada nova busca
  };

  const handleViewDetails = (propertyId: number) => {
    navigate(`/imovel/${propertyId}`);
  };

  // --- LÓGICA DE PAGINAÇÃO ---
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    resultsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    handleSearch();
  }, [activeTab, propertyType, priceRange, rooms]);

  useEffect(() => {
    setFilteredProperties(
      allProperties.filter((property) => property.transactionType === "Alugar")
    );
  }, []);

  const containerVariants: Variants = {
    /* ... sem alterações ... */
  };
  const cardVariants: Variants = {
    /* ... sem alterações ... */
  };

  return (
    <div className="search-app">
      <NavBar />
      <section className="search-hero">
        <div className="container">
          <motion.div /* ... */>
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
                    <option>Kitnet</option>
                  </select>
                </div>
                <div className="filter-group">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="filter-select"
                  >
                    <option>Preço do Imóvel</option>
                    <option>Até R$ 1.000</option>
                    <option>R$ 1.000 - R$ 2.000</option>
                    <option>Acima de R$ 2.000</option>
                    <option>Até R$ 200.000</option>
                    <option>R$ 200.000 - R$ 400.000</option>
                    <option>Acima de R$ 400.000</option>
                  </select>
                </div>
                <div className="filter-group">
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="filter-select"
                  >
                    <option>1+ Quartos</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
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

      <section className="search-results" ref={resultsRef}>
        <div className="container">
          <h2 className="results-count">
            {filteredProperties.length} Imóveis Encontrados
          </h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              className="results-grid"
              variants={containerVariants}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentProperties.map((property) => (
                <motion.div
                  key={property.id}
                  className="result-card"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className="result-image">
                    <img src={property.image} alt={`Property ${property.id}`} />
                    <div className="result-badge">
                      {property.transactionType}
                    </div>
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
          </AnimatePresence>

          <Pagination
            propertiesPerPage={propertiesPerPage}
            totalProperties={filteredProperties.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- COMPONENTE DE PAGINAÇÃO ---
const Pagination: React.FC<{
  propertiesPerPage: number;
  totalProperties: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}> = ({ propertiesPerPage, totalProperties, paginate, currentPage }) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalProperties / propertiesPerPage); i++) {
    pageNumbers.push(i);
  }

  if (totalProperties <= propertiesPerPage) {
    return null;
  }

  return (
    <nav className="pagination-container">
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-arrow"
      >
        <ChevronLeft size={20} />
      </button>
      <ul className="pagination-list">
        {pageNumbers.map((number) => (
          <li key={number} className="pagination-item">
            <button
              onClick={() => paginate(number)}
              className={`pagination-button ${
                currentPage === number ? "active" : ""
              }`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === pageNumbers.length}
        className="pagination-arrow"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default SearchPropertiesScreen;
