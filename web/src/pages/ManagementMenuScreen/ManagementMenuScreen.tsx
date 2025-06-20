import React from "react";
import { motion, easeOut, easeInOut } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Home, Calendar, FileText } from "lucide-react";

// Importe o componente da sua nova localização
import ManagementNavBar from "../../components/ManagementNavBar/ManagementNavBar";
import "./ManagementMenuScreen.css"; //

const ManagementMenuScreen: React.FC = () => {
  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: easeOut },
    },
    hover: { y: -10, transition: { duration: 0.3, ease: easeInOut } },
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: easeOut },
    },
  };

  return (
    <div className="mgmt-screen">
      {/* Use o componente importado aqui */}
      <ManagementNavBar />

      <main className="mgmt-main-content">
        <div className="container">
          {/* Seção de Gerenciamento */}
          <motion.section
            className="mgmt-cards-section"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <Link to="/admin/clientes" className="mgmt-card-link">
              <motion.div
                className="mgmt-card"
                variants={cardVariants}
                whileHover="hover"
              >
                <Users size={40} className="mgmt-card-icon" />
                <h3 className="mgmt-card-title">Gerenciar Clientes</h3>
                <p className="mgmt-card-description">
                  Registrar, editar e deletar clientes
                </p>
              </motion.div>
            </Link>
            <Link to="/admin/imoveis" className="mgmt-card-link">
              <motion.div
                className="mgmt-card"
                variants={cardVariants}
                whileHover="hover"
              >
                <Home size={40} className="mgmt-card-icon" />
                <h3 className="mgmt-card-title">Gerenciar Imóveis</h3>
                <p className="mgmt-card-description">
                  Registrar, editar e deletar imóveis
                </p>
              </motion.div>
            </Link>
            <Link to="/admin/visitas" className="mgmt-card-link">
              <motion.div
                className="mgmt-card"
                variants={cardVariants}
                whileHover="hover"
              >
                <Calendar size={40} className="mgmt-card-icon" />
                <h3 className="mgmt-card-title">Gerenciar Visitas</h3>
                <p className="mgmt-card-description">
                  Registrar, editar e deletar visitas de clientes
                </p>
              </motion.div>
            </Link>
            <Link to="/admin/proprietario" className="mgmt-card-link">
              <motion.div
                className="mgmt-card"
                variants={cardVariants}
                whileHover="hover"
              >
                <FileText size={40} className="mgmt-card-icon" />
                <h3 className="mgmt-card-title">Gerenciar Proprietários</h3>
                <p className="mgmt-card-description">
                  Registrar, editar e deletar proprietários de imóveis.
                </p>
              </motion.div>
            </Link>
          </motion.section>

          {/* Seção de Atividades e Status */}
          <section className="mgmt-dashboard-section">
            <motion.div
              className="activity-feed"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
            >
              <h2 className="dashboard-title">Últimas Atividades</h2>
              <motion.ul
                className="activity-list"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.li className="activity-item" variants={itemVariants}>
                  <h4>Nova visita agendada</h4>
                  <p>João Silva - Apartamento Centenário</p>
                </motion.li>
                <motion.li className="activity-item" variants={itemVariants}>
                  <h4>Nova proposta recebida</h4>
                  <p>Maria Oliveira - Casa Jardim das Acácias</p>
                </motion.li>
                <motion.li className="activity-item" variants={itemVariants}>
                  <h4>Cliente cadastrado</h4>
                  <p>Carlos Pereira</p>
                </motion.li>
                <motion.li className="activity-item" variants={itemVariants}>
                  <h4>Imóvel atualizado</h4>
                  <p>Código 125 - Status alterado para Alugado</p>
                </motion.li>
              </motion.ul>
            </motion.div>

            <motion.div
              className="property-status"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: easeOut }}
            >
              <h2 className="dashboard-title">Status dos Imóveis</h2>
              <motion.ul
                className="status-list"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.li className="status-item" variants={itemVariants}>
                  <span>Disponíveis</span>
                  <span className="status-count">210</span>
                </motion.li>
                <motion.li className="status-item" variants={itemVariants}>
                  <span>Reservados</span>
                  <span className="status-count">09</span>
                </motion.li>
                <motion.li className="status-item" variants={itemVariants}>
                  <span>Vendidos</span>
                  <span className="status-count">20</span>
                </motion.li>
                <motion.li className="status-item" variants={itemVariants}>
                  <span>Alugados</span>
                  <span className="status-count">37</span>
                </motion.li>
              </motion.ul>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ManagementMenuScreen;
