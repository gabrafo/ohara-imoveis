// src/pages/ManageVisitsScreen/ManageVisitsScreen.tsx
import { useState, useEffect } from "react";
import type { FC, ReactNode } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import ManagementNavBar from "../../components/ManagementNavBar/ManagementNavBar";
import "./ManageVisitsScreen.css"; // Usaremos um CSS próprio para visitas

// --- INTERFACES DE TIPAGEM ---
type VisitStatus = "Pendente" | "Agendada" | "Concluída" | "Cancelada";

interface Visit {
  id: number | null;
  date: string;
  time: string;
  propertyTitle: string;
  clientName: string;
  status: VisitStatus;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// --- DADOS INICIAIS MOCK ---
const initialVisits: Visit[] = [
  {
    id: 1,
    date: "2025-06-25",
    time: "14:00",
    propertyTitle: "Apartamento Luxo no Centro",
    clientName: "Carlos Pereira",
    status: "Agendada",
  },
  {
    id: 2,
    date: "2025-06-22",
    time: "10:30",
    propertyTitle: "Casa com Piscina",
    clientName: "Ana Souza",
    status: "Concluída",
  },
  {
    id: 3,
    date: "2025-06-28",
    time: "16:00",
    propertyTitle: "Terreno Comercial",
    clientName: "Pedro Martins",
    status: "Pendente",
  },
  {
    id: 4,
    date: "2025-06-18",
    time: "09:00",
    propertyTitle: "Apartamento Luxo no Centro",
    clientName: "Juliana Ferreira",
    status: "Cancelada",
  },
];

const emptyVisit: Visit = {
  id: null,
  date: "",
  time: "",
  propertyTitle: "",
  clientName: "",
  status: "Pendente",
};

// --- COMPONENTE MODAL GENÉRICO ---
const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

const ManageVisitsScreen: FC = () => {
  // --- ESTADOS (STATES) ---
  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>(initialVisits);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit>(emptyVisit);

  // --- EFEITO PARA FILTRAR ---
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = visits.filter(
      (visit) =>
        visit.propertyTitle.toLowerCase().includes(lowercasedTerm) ||
        visit.clientName.toLowerCase().includes(lowercasedTerm) ||
        visit.status.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredVisits(results);
  }, [searchTerm, visits]);

  // --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSelectedVisit({ ...selectedVisit, [name]: value });
  };

  // --- LÓGICA CRUD ---
  const handleAddVisit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVisits([...visits, { ...selectedVisit, id: Date.now() }]);
    setAddModalOpen(false);
  };

  const openEditModal = (visit: Visit) => {
    setSelectedVisit(visit);
    setEditModalOpen(true);
  };

  const handleEditVisit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVisits(
      visits.map((v) => (v.id === selectedVisit.id ? selectedVisit : v))
    );
    setEditModalOpen(false);
  };

  const openDeleteModal = (visit: Visit) => {
    setSelectedVisit(visit);
    setDeleteModalOpen(true);
  };

  const handleDeleteVisit = () => {
    setVisits(visits.filter((v) => v.id !== selectedVisit.id));
    setDeleteModalOpen(false);
  };

  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="manage-visits-screen">
      <ManagementNavBar />
      <main className="visits-main-content">
        <div className="container">
          <aside className="visits-actions">
            <h1 className="visits-title">Gerenciar Visitas</h1>
            <button
              className="action-btn add-btn"
              onClick={() => {
                setSelectedVisit(emptyVisit);
                setAddModalOpen(true);
              }}
            >
              Agendar Nova Visita +
            </button>
            <div className="search-container">
              <label htmlFor="search">Pesquisar Visitas</label>
              <input
                type="text"
                id="search"
                className="search-input"
                placeholder="Cliente, imóvel, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="pagination-info">
              Mostrando {filteredVisits.length} de {visits.length} visitas
            </p>
          </aside>

          <section className="visits-table-section">
            <table className="visits-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Imóvel</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td data-label="Data">
                      {formatDateForDisplay(visit.date)}
                    </td>
                    <td data-label="Horário">{visit.time}</td>
                    <td data-label="Imóvel">{visit.propertyTitle}</td>
                    <td data-label="Cliente">{visit.clientName}</td>
                    <td data-label="Status">
                      <span
                        className={`status-badge status-${visit.status
                          .toLowerCase()
                          .replace("í", "i")
                          .replace("ú", "u")}`}
                      >
                        {visit.status}
                      </span>
                    </td>
                    <td className="action-icons">
                      <button
                        className="icon-btn"
                        aria-label="Editar visita"
                        onClick={() => openEditModal(visit)}
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        className="icon-btn"
                        aria-label="Excluir visita"
                        onClick={() => openDeleteModal(visit)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      {/* --- MODAL DE ADICIONAR/EDITAR --- */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
        }}
        title={isAddModalOpen ? "Agendar Nova Visita" : "Editar Visita"}
      >
        <form
          onSubmit={isAddModalOpen ? handleAddVisit : handleEditVisit}
          className="modal-form"
        >
          <div className="form-grid">
            <input
              name="date"
              type="date"
              value={selectedVisit.date}
              onChange={handleInputChange}
              required
            />
            <input
              name="time"
              type="time"
              value={selectedVisit.time}
              onChange={handleInputChange}
              required
            />
          </div>
          <input
            name="propertyTitle"
            value={selectedVisit.propertyTitle}
            onChange={handleInputChange}
            placeholder="Nome ou Código do Imóvel"
            required
          />
          <input
            name="clientName"
            value={selectedVisit.clientName}
            onChange={handleInputChange}
            placeholder="Nome do Cliente"
            required
          />
          <select
            name="status"
            value={selectedVisit.status}
            onChange={handleInputChange}
          >
            <option value="Pendente">Pendente</option>
            <option value="Agendada">Agendada</option>
            <option value="Concluída">Concluída</option>
            <option value="Cancelada">Cancelada</option>
          </select>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setAddModalOpen(false);
                setEditModalOpen(false);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isAddModalOpen ? "Agendar" : "Atualizar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL DE DELETAR --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <p>
          Tem certeza que deseja excluir a visita do cliente{" "}
          <strong>{selectedVisit?.clientName}</strong> ao imóvel{" "}
          <strong>{selectedVisit?.propertyTitle}</strong>?
        </p>
        <p>Esta ação não poderá ser desfeita.</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleDeleteVisit}
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageVisitsScreen;
