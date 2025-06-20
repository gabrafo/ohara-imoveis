import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Importando AnimatePresence
import {
  Bed,
  Bath,
  Square,
  Car,
  ArrowLeft,
  Check,
  Calendar,
  MapPin,
} from "lucide-react";

import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import CasaGrid from "../../assets/casagrid01.png";
import CasaGrid2 from "../../assets/casagrid02.png";
import "./PropertyDetails.css";

// Interface e Mock Data (sem alterações)
interface Property {
  id: number;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  type: string;
  transactionType: "Alugar" | "Comprar";
  vacancies: number;
}

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
    vacancies: 2,
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
    vacancies: 3,
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
    vacancies: 1,
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
    vacancies: 2,
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
    vacancies: 2,
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
    vacancies: 1,
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
    vacancies: 4,
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
    vacancies: 2,
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
    vacancies: 1,
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
    vacancies: 4,
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
    vacancies: 2,
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
    vacancies: 2,
  },
];

const PropertyDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null | undefined>(
    undefined
  );

  const [currentStep, setCurrentStep] = useState<
    "initial" | "preferences" | "contact" | "confirmation"
  >("initial");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [visitType, setVisitType] = useState<"presencial" | "online">(
    "presencial"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      const foundProperty = allProperties.find((p) => p.id === parseInt(id));
      setProperty(foundProperty);
    }
  }, [id]);

  if (property === undefined) {
    return <div className="loading-container">Carregando...</div>;
  }
  if (property === null) {
    return <div className="not-found-container">Imóvel não encontrado.</div>;
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, email, phone, selectedDate, selectedTime, visitType });
    alert(
      "Solicitação de visita enviada com sucesso! Entraremos em contato em breve."
    );
  };

  const handleContinue = () => {
    if (currentStep === "initial") setCurrentStep("preferences");
    else if (currentStep === "preferences") setCurrentStep("contact");
    else if (currentStep === "contact") setCurrentStep("confirmation");
  };

  const handleBack = () => {
    if (currentStep === "preferences") setCurrentStep("initial");
    else if (currentStep === "contact") setCurrentStep("preferences");
    else if (currentStep === "confirmation") setCurrentStep("contact");
  };

  const getDayName = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);
    const days = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    return days[date.getUTCDay()];
  };

  const getDayNumber = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);
    return date.getUTCDate();
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  // Variantes para a animação das etapas do formulário
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50, position: "absolute" },
  };

  return (
    <div className="details-page-app">
      <NavBar />
      <main className="details-container">
        <Link to="/search" className="back-link">
          <ArrowLeft size={20} />
          Voltar para imóveis
        </Link>
        <div className="details-content">
          <motion.div
            className="details-main"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Conteúdo da esquerda (detalhes do imóvel) não foi alterado */}
            <div className="property-image-gallery">
              <img
                src={property.image}
                alt={`${property.type} em ${property.location}`}
              />
            </div>
            <div className="property-header">
              <p className="location">
                <MapPin size={16} />
                {property.location}
              </p>
              <h1>{`${
                property.type
              } para ${property.transactionType.toLowerCase()} com ${
                property.area
              }m², ${property.bedrooms} quartos e ${
                property.vacancies
              } vagas`}</h1>
              <p className="price">{property.price}</p>
            </div>
            <div className="property-key-features">
              <div className="key-feature">
                <Bed size={24} />
                {property.bedrooms} Quartos
              </div>
              <div className="key-feature">
                <Bath size={24} />
                {property.bathrooms} Banheiros
              </div>
              <div className="key-feature">
                <Square size={24} />
                {property.area}m²
              </div>
              <div className="key-feature">
                <Car size={24} />
                {property.vacancies} Vagas
              </div>
            </div>
            <div className="property-description">
              <h2>Descrição</h2>
              <p>
                Este imóvel excepcional oferece um equilíbrio perfeito entre
                elegância e conforto. Localizado em uma área privilegiada, com
                fácil acesso a transportes, comércio e lazer, esta propriedade
                proporciona uma excelente qualidade de vida. Os ambientes são
                amplos e bem iluminados, com acabamentos de alta qualidade e
                ótima distribuição dos espaços.
              </p>
            </div>
            <div className="property-characteristics">
              <h2>Características</h2>
              <ul className="characteristics-list">
                <li className="characteristic-item">
                  <Check className="lucide-check" size={20} />
                  Localização Privilegiada
                </li>
                <li className="characteristic-item">
                  <Check className="lucide-check" size={20} />
                  Acabamento de Alta Qualidade
                </li>
                <li className="characteristic-item">
                  <Check className="lucide-check" size={20} />
                  Área de Lazer
                </li>
                <li className="characteristic-item">
                  <Check className="lucide-check" size={20} />
                  Garagem Coberta
                </li>
                <li className="characteristic-item">
                  <Check className="lucide-check" size={20} />
                  Cozinha Planejada
                </li>
                <li className="characteristic-item">
                  <Check className="lucide-check" size={20} />
                  Segurança 24h
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.aside
            className="details-sidebar"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="visit-card">
              <AnimatePresence mode="wait">
                {/* INÍCIO DA ANIMAÇÃO */}
                {currentStep === "initial" && (
                  <motion.div
                    key="initial"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="visit-initial"
                  >
                    <div className="visit-price-info">
                      <span className="visit-type">
                        {property.transactionType}
                      </span>
                      <span className="visit-price">{property.price}</span>
                    </div>
                    <button
                      className="visit-btn primary"
                      onClick={handleContinue}
                    >
                      Agendar visita
                    </button>
                    <button
                      className="visit-btn secondary"
                      onClick={() => setCurrentStep("contact")}
                    >
                      Quero mais informações
                    </button>
                  </motion.div>
                )}

                {currentStep === "preferences" && (
                  <motion.div
                    key="preferences"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="visit-preferences"
                  >
                    <div className="visit-header">
                      <button className="back-btn" onClick={handleBack}>
                        <ArrowLeft size={20} />
                      </button>
                      <h3>Você prefere:</h3>
                    </div>
                    <div className="date-selection">
                      <div className="available-dates">
                        {getAvailableDates().map((date) => (
                          <button
                            key={date}
                            className={`date-btn ${
                              selectedDate === date ? "selected" : ""
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            <span className="day-name">{getDayName(date)}</span>
                            <span className="day-number">
                              {getDayNumber(date)}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="time-selection">
                        {[
                          "08h00",
                          "09h00",
                          "10h00",
                          "14h00",
                          "15h00",
                          "16h00",
                        ].map((time) => (
                          <button
                            key={time}
                            className={`time-btn ${
                              selectedTime === time ? "selected" : ""
                            }`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="visit-type-selection">
                      <button
                        className={`visit-type-btn ${
                          visitType === "presencial" ? "selected" : ""
                        }`}
                        onClick={() => setVisitType("presencial")}
                      >
                        🏠 Presencial
                      </button>
                    </div>
                    <button
                      className="visit-btn primary"
                      onClick={handleContinue}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Continuar
                    </button>
                  </motion.div>
                )}

                {currentStep === "contact" && (
                  <motion.div
                    key="contact"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="visit-contact"
                  >
                    <div className="visit-header">
                      <button className="back-btn" onClick={handleBack}>
                        <ArrowLeft size={20} />
                      </button>
                      <h3>Confirmar dados para o agendamento</h3>
                    </div>
                    <form onSubmit={handleFormSubmit}>
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Nome"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="tel"
                          placeholder="Telefone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="email"
                          placeholder="E-mail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <p className="terms-text">
                        Ao enviar concordo com os <a href="#">termos de uso</a>{" "}
                        e <a href="#">política de privacidade</a>.
                      </p>
                      <button
                        type="submit"
                        className="visit-btn primary full-width"
                      >
                        Entrar em contato
                      </button>
                    </form>
                  </motion.div>
                )}

                {currentStep === "confirmation" && (
                  <motion.div
                    key="confirmation"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="visit-confirmation"
                  >
                    <div className="visit-header">
                      <button className="back-btn" onClick={handleBack}>
                        <ArrowLeft size={20} />
                      </button>
                    </div>
                    <div className="confirmation-content">
                      <div className="confirmation-icon">
                        <Calendar size={48} />
                        <span className="confirmation-date">
                          {getDayNumber(selectedDate)}
                        </span>
                      </div>
                      <div className="confirmation-details">
                        <h3>
                          {selectedDate
                            ? new Date(
                                `${selectedDate}T00:00:00`
                              ).toLocaleDateString("pt-BR", { timeZone: "UTC" })
                            : ""}
                        </h3>
                        <p>Às {selectedTime}</p>
                      </div>
                      <div className="location-info">
                        <MapPin size={24} />
                        <p>O local será confirmado pelo corretor</p>
                      </div>
                      <button
                        className="visit-btn primary full-width"
                        onClick={() => {
                          handleFormSubmit({
                            preventDefault: () => {},
                          } as React.FormEvent);
                          setCurrentStep("initial");
                        }}
                      >
                        Confirmar Agendamento
                      </button>
                    </div>
                  </motion.div>
                )}
                {/* FIM DA ANIMAÇÃO */}
              </AnimatePresence>
            </div>
          </motion.aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetailsScreen;
