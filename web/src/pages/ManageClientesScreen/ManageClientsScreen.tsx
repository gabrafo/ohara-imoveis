import { useState, useEffect } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import ManagementNavBar from "../../components/ManagementNavBar/ManagementNavBar";
import "./ManageClientesScreen.css";

// --- TIPOS ---
interface Client {
  id: number | null;
  firstName: string;
  lastName: string;
  cpf: string;
  email: string;
  phone: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// --- DADOS INICIAIS ---
const initialClients: Client[] = [
  {
    id: 1,
    firstName: "João",
    lastName: "Silva",
    cpf: "120.945.789-31",
    email: "joao.silva@hotmail.com",
    phone: "(12) 93456-7890",
  },
  {
    id: 2,
    firstName: "Maria",
    lastName: "Oliveira",
    cpf: "234.567.890-12",
    email: "maria.o@gmail.com",
    phone: "(11) 98765-4321",
  },
  {
    id: 3,
    firstName: "Carlos",
    lastName: "Pereira",
    cpf: "345.678.901-23",
    email: "carlos.pereira@yahoo.com",
    phone: "(21) 99887-7665",
  },
  {
    id: 4,
    firstName: "Ana",
    lastName: "Souza",
    cpf: "456.789.012-34",
    email: "ana.souza@outlook.com",
    phone: "(31) 98877-6655",
  },
  {
    id: 5,
    firstName: "Pedro",
    lastName: "Martins",
    cpf: "567.890.123-45",
    email: "pedro.martins@email.com",
    phone: "(41) 97766-5544",
  },
];

const emptyClient: Client = {
  id: null,
  firstName: "",
  lastName: "",
  cpf: "",
  email: "",
  phone: "",
};

// --- COMPONENTE MODAL GENÉRICO ---
const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
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

const ManageClientsScreen = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [filteredClients, setFilteredClients] =
    useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isAddModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  const [selectedClient, setSelectedClient] = useState<Client>(emptyClient);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = clients.filter(
      (client) =>
        client.firstName.toLowerCase().includes(lowercasedTerm) ||
        client.lastName.toLowerCase().includes(lowercasedTerm) ||
        client.email.toLowerCase().includes(lowercasedTerm) ||
        client.cpf.includes(searchTerm)
    );
    setFilteredClients(results);
  }, [searchTerm, clients]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    clientData: Client,
    setClientData: React.Dispatch<React.SetStateAction<Client>>
  ) => {
    const { name, value } = e.target;
    setClientData({ ...clientData, [name]: value });
  };

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClients([...clients, { ...selectedClient, id: Date.now() }]);
    setAddModalOpen(false);
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setEditModalOpen(true);
  };

  const handleEditClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClients(
      clients.map((client) =>
        client.id === selectedClient.id ? selectedClient : client
      )
    );
    setEditModalOpen(false);
  };

  const openDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setDeleteModalOpen(true);
  };

  const handleDeleteClient = () => {
    setClients(clients.filter((client) => client.id !== selectedClient.id));
    setDeleteModalOpen(false);
  };

  return (
    <div className="manage-clients-screen">
      <ManagementNavBar />
      <main className="clients-main-content">
        <div className="container">
          <aside className="clients-actions">
            <h1 className="clients-title">Gerenciar clientes</h1>
            <button
              className="action-btn add-btn"
              onClick={() => {
                setSelectedClient(emptyClient);
                setAddModalOpen(true);
              }}
            >
              Adicionar Cliente +
            </button>
            <div className="search-container">
              <label htmlFor="search">Pesquisar Cliente</label>
              <input
                type="text"
                id="search"
                className="search-input"
                placeholder="Nome, email, CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="pagination-info">
              Mostrando {filteredClients.length} de {clients.length} clientes
            </p>
          </aside>

          <section className="clients-table-section">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Último Nome</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Celular</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.firstName}</td>
                    <td>{client.lastName}</td>
                    <td>{client.cpf}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td className="action-icons">
                      <button
                        className="icon-btn"
                        aria-label="Editar cliente"
                        onClick={() => openEditModal(client)}
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        className="icon-btn"
                        aria-label="Deletar cliente"
                        onClick={() => openDeleteModal(client)}
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

      {/* --- MODAIS --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Adicionar Novo Cliente"
      >
        <form onSubmit={handleAddClient} className="modal-form">
          <input
            name="firstName"
            value={selectedClient.firstName}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Nome"
            required
          />
          <input
            name="lastName"
            value={selectedClient.lastName}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Último Nome"
            required
          />
          <input
            name="cpf"
            value={selectedClient.cpf}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="CPF"
            required
          />
          <input
            name="email"
            type="email"
            value={selectedClient.email}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Email"
            required
          />
          <input
            name="phone"
            value={selectedClient.phone}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Celular"
            required
          />
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setAddModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Cliente"
      >
        <form onSubmit={handleEditClient} className="modal-form">
          <input
            name="firstName"
            value={selectedClient.firstName}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Nome"
            required
          />
          <input
            name="lastName"
            value={selectedClient.lastName}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Último Nome"
            required
          />
          <input
            name="cpf"
            value={selectedClient.cpf}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="CPF"
            required
          />
          <input
            name="email"
            type="email"
            value={selectedClient.email}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Email"
            required
          />
          <input
            name="phone"
            value={selectedClient.phone}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Celular"
            required
          />
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Atualizar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <p>
          Tem certeza que deseja excluir o cliente{" "}
          <strong>
            {selectedClient?.firstName} {selectedClient?.lastName}
          </strong>
          ?
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
            onClick={handleDeleteClient}
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageClientsScreen;
