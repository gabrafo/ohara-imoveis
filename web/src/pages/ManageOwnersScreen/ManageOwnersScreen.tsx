// src/pages/ManageOwnersScreen/ManageOwnersScreen.tsx
import { useState, useEffect } from "react";
import type { FC, ReactNode } from "react";
import { Pencil, Trash2, X, Home } from "lucide-react"; // Adicionado o ícone Home
import ManagementNavBar from "../../components/ManagementNavBar/ManagementNavBar";
import "./ManageOwnersScreen.css";

// --- INTERFACES DE TIPAGEM ATUALIZADAS ---
interface PropertyInfo {
  id: number;
  title: string;
}

interface Owner {
  id: number | null;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  properties: PropertyInfo[]; // Alterado de propertyCount para uma lista de imóveis
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// --- DADOS INICIAIS ATUALIZADOS ---
const initialOwners: Owner[] = [
  {
    id: 1,
    name: "João Silva",
    cpf: "111.222.333-44",
    email: "joao.silva@email.com",
    phone: "(11) 98888-7777",
    properties: [
      { id: 101, title: "Apartamento Luxo no Centro" },
      { id: 102, title: "Casa de Campo em Atibaia" },
      { id: 103, title: "Sala Comercial na Paulista" },
    ],
  },
  {
    id: 2,
    name: "Maria Oliveira",
    cpf: "222.333.444-55",
    email: "maria.oliveira@email.com",
    phone: "(21) 97777-6666",
    properties: [{ id: 201, title: "Casa com Piscina na Barra" }],
  },
];

const emptyOwner: Owner = {
  id: null,
  name: "",
  cpf: "",
  email: "",
  phone: "",
  properties: [], // Começa com uma lista vazia
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

const ManageOwnersScreen: FC = () => {
  // --- ESTADOS (STATES) ---
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>(initialOwners);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false); // Novo estado para o modal de visualização
  const [selectedOwner, setSelectedOwner] = useState<Owner>(emptyOwner);
  const [newPropertyTitle, setNewPropertyTitle] = useState(""); // Novo estado para o título do imóvel a ser adicionado

  // --- EFEITO PARA FILTRAR ---
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = owners.filter(
      (owner) =>
        owner.name.toLowerCase().includes(lowercasedTerm) ||
        owner.cpf.includes(lowercasedTerm) ||
        owner.email.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredOwners(results);
  }, [searchTerm, owners]);

  // --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedOwner({ ...selectedOwner, [name]: value });
  };

  // --- LÓGICA CRUD ---
  const handleAddOwner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOwners([
      ...owners,
      { ...selectedOwner, id: Date.now(), properties: [] },
    ]);
    setAddModalOpen(false);
  };

  const openEditModal = (owner: Owner) => {
    setSelectedOwner(owner);
    setEditModalOpen(true);
  };

  const handleEditOwner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOwners(
      owners.map((o) => (o.id === selectedOwner.id ? selectedOwner : o))
    );
    setEditModalOpen(false);
  };

  const openDeleteModal = (owner: Owner) => {
    setSelectedOwner(owner);
    setDeleteModalOpen(true);
  };

  const handleDeleteOwner = () => {
    setOwners(owners.filter((o) => o.id !== selectedOwner.id));
    setDeleteModalOpen(false);
  };

  // --- NOVAS FUNÇÕES PARA GERENCIAR IMÓVEIS ---
  const openViewModal = (owner: Owner) => {
    setSelectedOwner(owner);
    setViewModalOpen(true);
  };

  const handleAddPropertyToOwner = () => {
    if (newPropertyTitle.trim() === "") return;
    const newProperty: PropertyInfo = {
      id: Date.now(),
      title: newPropertyTitle.trim(),
    };
    setSelectedOwner({
      ...selectedOwner,
      properties: [...selectedOwner.properties, newProperty],
    });
    setNewPropertyTitle(""); // Limpa o input
  };

  const handleRemovePropertyFromOwner = (propertyId: number) => {
    setSelectedOwner({
      ...selectedOwner,
      properties: selectedOwner.properties.filter(
        (prop) => prop.id !== propertyId
      ),
    });
  };

  return (
    <div className="manage-owners-screen">
      <ManagementNavBar />
      <main className="owners-main-content">
        <div className="container">
          <aside className="owners-actions">
            <h1 className="owners-title">Gerenciar Proprietários</h1>
            <button
              className="action-btn add-btn"
              onClick={() => {
                setSelectedOwner(emptyOwner);
                setAddModalOpen(true);
              }}
            >
              Adicionar Proprietário +
            </button>
            <div className="search-container">
              <label htmlFor="search">Pesquisar Proprietário</label>
              <input
                type="text"
                id="search"
                className="search-input"
                placeholder="Nome, CPF, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="pagination-info">
              Mostrando {filteredOwners.length} de {owners.length} proprietários
            </p>
          </aside>

          <section className="owners-table-section">
            <table className="owners-table">
              <thead>
                <tr>
                  <th>Nome Completo</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Qtd. Imóveis</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.map((owner) => (
                  <tr key={owner.id}>
                    <td data-label="Nome">{owner.name}</td>
                    <td data-label="CPF">{owner.cpf}</td>
                    <td data-label="Email">{owner.email}</td>
                    <td data-label="Telefone">{owner.phone}</td>
                    <td data-label="Qtd. Imóveis">{owner.properties.length}</td>
                    <td className="action-icons">
                      <button
                        className="icon-btn"
                        aria-label="Ver imóveis"
                        title="Ver Imóveis"
                        onClick={() => openViewModal(owner)}
                      >
                        <Home size={20} />
                      </button>
                      <button
                        className="icon-btn"
                        aria-label="Editar proprietário"
                        title="Editar Proprietário"
                        onClick={() => openEditModal(owner)}
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        className="icon-btn"
                        aria-label="Excluir proprietário"
                        title="Excluir Proprietário"
                        onClick={() => openDeleteModal(owner)}
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

      {/* --- MODAL DE ADICIONAR/EDITAR (ATUALIZADO) --- */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
        }}
        title={
          isAddModalOpen ? "Adicionar Novo Proprietário" : "Editar Proprietário"
        }
      >
        <form
          onSubmit={isAddModalOpen ? handleAddOwner : handleEditOwner}
          className="modal-form"
        >
          <input
            name="name"
            value={selectedOwner.name}
            onChange={handleInputChange}
            placeholder="Nome Completo"
            required
          />
          <input
            name="cpf"
            value={selectedOwner.cpf}
            onChange={handleInputChange}
            placeholder="CPF"
            required
          />
          <input
            name="email"
            type="email"
            value={selectedOwner.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
          <input
            name="phone"
            value={selectedOwner.phone}
            onChange={handleInputChange}
            placeholder="Telefone"
            required
          />

          {/* NOVA SEÇÃO PARA GERENCIAR IMÓVEIS DENTRO DO MODAL DE EDIÇÃO */}
          {isEditModalOpen && (
            <div className="property-manager">
              <h4>Imóveis do Proprietário</h4>
              <ul className="property-list">
                {selectedOwner.properties.map((prop) => (
                  <li key={prop.id} className="property-item">
                    <span>{prop.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePropertyFromOwner(prop.id)}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
                {selectedOwner.properties.length === 0 && (
                  <li className="empty-list">Nenhum imóvel cadastrado.</li>
                )}
              </ul>
              <div className="add-property-form">
                <input
                  type="text"
                  placeholder="Adicionar novo imóvel"
                  value={newPropertyTitle}
                  onChange={(e) => setNewPropertyTitle(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-add-property"
                  onClick={handleAddPropertyToOwner}
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}

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
              {isAddModalOpen ? "Adicionar" : "Atualizar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- NOVO MODAL PARA VISUALIZAR IMÓVEIS --- */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Imóveis de ${selectedOwner?.name}`}
      >
        <ul className="property-list">
          {selectedOwner?.properties.map((prop) => (
            <li key={prop.id} className="property-item view-only">
              <span>{prop.title}</span>
            </li>
          ))}
          {selectedOwner?.properties.length === 0 && (
            <li className="empty-list">
              Nenhum imóvel cadastrado para este proprietário.
            </li>
          )}
        </ul>
        <div className="modal-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setViewModalOpen(false)}
          >
            Fechar
          </button>
        </div>
      </Modal>

      {/* --- MODAL DE DELETAR --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <p>
          Tem certeza que deseja excluir o proprietário{" "}
          <strong>{selectedOwner?.name}</strong>?
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
            onClick={handleDeleteOwner}
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageOwnersScreen;
