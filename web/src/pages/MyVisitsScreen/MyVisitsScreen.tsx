// src/pages/MyVisitsScreen/MyVisitsScreen.tsx
import React, { useState } from "react";
import type { FC, ReactNode } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Clock, MapPin, Edit, Save } from "lucide-react";

import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import CasaGrid from "../../assets/casagrid01.png";
import CasaGrid2 from "../../assets/casagrid02.png";
import "./MyVisitsScreen.css";

// --- INTERFACES E TIPOS ---
type VisitStatus = "Agendada" | "Concluída" | "Cancelada";

interface Visit {
  id: number;
  date: string;
  time: string;
  propertyTitle: string;
  propertyLocation: string;
  image: string;
  status: VisitStatus;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
}

// --- DADOS MOCK ---
const initialVisits: Visit[] = [
  {
    id: 1,
    date: "28/06/2025",
    time: "14:00",
    propertyTitle: "Apartamento Luxo no Centro",
    propertyLocation: "Centenário, Lavras",
    image: CasaGrid,
    status: "Agendada",
  },
  {
    id: 2,
    date: "22/06/2025",
    time: "10:30",
    propertyTitle: "Casa com Piscina",
    propertyLocation: "Aquenta Sol, Lavras",
    image: CasaGrid2,
    status: "Concluída",
  },
  {
    id: 4,
    date: "05/07/2025",
    time: "11:00",
    propertyTitle: "Kitnet mobiliada perto da UFLA",
    propertyLocation: "Universitário, Lavras",
    image: CasaGrid2,
    status: "Agendada",
  },
  {
    id: 3,
    date: "18/05/2025",
    time: "09:00",
    propertyTitle: "Sala Comercial na Principal",
    propertyLocation: "Centro, Lavras",
    image: CasaGrid,
    status: "Cancelada",
  },
];

// --- COMPONENTE MODAL DE CONFIRMAÇÃO ---
const ConfirmationModal: FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay-visits" onClick={onClose}>
      <div
        className="modal-content-visits"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-visits">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-btn-visits">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body-visits">{children}</div>
        <div className="modal-actions-visits">
          <button className="btn-secondary-visits" onClick={onClose}>
            Voltar
          </button>
          <button className="btn-danger-visits" onClick={onConfirm}>
            Confirmar Cancelamento
          </button>
        </div>
      </div>
    </div>
  );
};

const MyVisitsScreen: FC = () => {
  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  // --- NOVOS ESTADOS PARA EDIÇÃO ---
  const [editingVisitId, setEditingVisitId] = useState<number | null>(null);
  const [newTime, setNewTime] = useState("");

  const handleOpenCancelModal = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedVisit) return;
    setVisits(
      visits.map((visit) =>
        visit.id === selectedVisit.id
          ? { ...visit, status: "Cancelada" }
          : visit
      )
    );
    setIsModalOpen(false);
    setSelectedVisit(null);
  };

  // --- NOVAS FUNÇÕES PARA EDIÇÃO DE HORÁRIO ---
  const handleEditClick = (visit: Visit) => {
    setEditingVisitId(visit.id);
    setNewTime(visit.time);
  };

  const handleCancelEdit = () => {
    setEditingVisitId(null);
    setNewTime("");
  };

  const handleSaveTime = (visitId: number) => {
    setVisits(
      visits.map((visit) =>
        visit.id === visitId ? { ...visit, time: newTime } : visit
      )
    );
    setEditingVisitId(null);
    setNewTime("");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="my-visits-app">
      <NavBar />
      <main className="my-visits-container">
        <div className="container">
          <motion.h1
            className="my-visits-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Minhas Visitas
          </motion.h1>
          <p className="my-visits-subtitle">
            Acompanhe, gerencie e cancele suas visitas agendadas.
          </p>

          <motion.div
            className="visits-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {visits.length > 0 ? (
              visits.map((visit) => (
                <motion.div
                  key={visit.id}
                  className="visit-card"
                  variants={itemVariants}
                >
                  <div className="visit-card-image">
                    <img
                      src={visit.image}
                      alt={`Imagem do imóvel: ${visit.propertyTitle}`}
                    />
                    <span
                      className={`visit-status-badge status-${visit.status.toLowerCase()}`}
                    >
                      {visit.status}
                    </span>
                  </div>
                  <div className="visit-card-info">
                    <h2 className="visit-property-title">
                      {visit.propertyTitle}
                    </h2>
                    <p className="visit-property-location">
                      <MapPin size={14} /> {visit.propertyLocation}
                    </p>

                    <div className="visit-date-time">
                      <div className="visit-detail-item">
                        <Calendar size={16} />
                        <span>{visit.date}</span>
                      </div>

                      {/* --- LÓGICA DE EDIÇÃO DE HORÁRIO --- */}
                      {editingVisitId === visit.id ? (
                        <div className="time-edit-container">
                          <input
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="time-input"
                          />
                        </div>
                      ) : (
                        <div className="visit-detail-item">
                          <Clock size={16} />
                          <span>{visit.time}</span>
                        </div>
                      )}
                    </div>

                    {/* --- BOTÕES DE AÇÃO DINÂMICOS --- */}
                    {visit.status === "Agendada" && (
                      <div className="visit-actions">
                        {editingVisitId === visit.id ? (
                          <>
                            <button
                              className="action-btn-visits save-btn"
                              onClick={() => handleSaveTime(visit.id)}
                            >
                              <Save size={16} /> Salvar
                            </button>
                            <button
                              className="action-btn-visits cancel-edit-btn"
                              onClick={handleCancelEdit}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="action-btn-visits edit-btn"
                              onClick={() => handleEditClick(visit)}
                            >
                              <Edit size={16} /> Alterar Horário
                            </button>
                            <button
                              className="action-btn-visits cancel-btn"
                              onClick={() => handleOpenCancelModal(visit)}
                            >
                              Cancelar Visita
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="no-visits-message">
                Você ainda não possui visitas agendadas.
              </p>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Visita"
      >
        <p>
          Tem certeza que deseja cancelar sua visita ao imóvel{" "}
          <strong>{selectedVisit?.propertyTitle}</strong> agendada para o dia{" "}
          <strong>
            {selectedVisit?.date} às {selectedVisit?.time}
          </strong>
          ?
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default MyVisitsScreen;
