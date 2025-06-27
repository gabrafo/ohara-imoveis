import { useState, useEffect } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import ManagementNavBar from "../../components/ManagementNavBar/ManagementNavBar";
import "./ManageClientesScreen.css";
import ClientsService from '../../services/clients.service';

// --- TIPOS ---
interface Client {
  id: number | null;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

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
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isAddModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  const [selectedClient, setSelectedClient] = useState<Client>({
    id: null,
    name: "",
    cpf: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    // Carregar clientes da API ao montar
    const fetchClients = async () => {
      try {
        const apiClients = await ClientsService.getAll();
        // Adaptar para o formato esperado pela tabela
        const mappedClients: Client[] = apiClients.map((c) => {
          const [firstName, ...rest] = c.name.split(' ');
          return {
            id: c.userId,
            name: c.name,
            cpf: c.cpf || '',
            email: c.email,
            phone: c.phone,
            password: '', // Senha não é retornada pela API de listagem
          };
        });
        setClients(mappedClients);
        setFilteredClients(mappedClients);
      } catch (err) {
        setClients([]);
        setFilteredClients([]);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowercasedTerm) ||
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

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const createData = {
        name: selectedClient.name,
        email: selectedClient.email,
        password: selectedClient.password,
        phone: selectedClient.phone,
        birthDate: '01-01-1990', // Data padrão
        role: 'customer', // Role obrigatório
      };
      
      await ClientsService.create(createData);
      
      // Recarregar a lista de clientes
      const apiClients = await ClientsService.getAll();
      const mappedClients: Client[] = apiClients.map((c) => {
        const [firstName, ...rest] = c.name.split(' ');
        return {
          id: c.userId,
          name: c.name,
          cpf: c.cpf || '',
          email: c.email,
          phone: c.phone,
          password: '', // Senha não é retornada pela API de listagem
        };
      });
      setClients(mappedClients);
      setFilteredClients(mappedClients);
      setAddModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
    }
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setEditModalOpen(true);
  };

  const handleEditClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient.id) return;
    
    try {
      // Testar com apenas o nome primeiro
      const updateData: any = {
        name: selectedClient.name,
      };
      
      console.log('Editando cliente ID:', selectedClient.id);
      console.log('Dados sendo enviados:', updateData);
      
      await ClientsService.update(selectedClient.id, updateData);
      
      console.log('Cliente atualizado com sucesso');
      
      // Recarregar a lista de clientes
      const apiClients = await ClientsService.getAll();
      const mappedClients: Client[] = apiClients.map((c) => {
        return {
          id: c.userId,
          name: c.name,
          cpf: c.cpf || '',
          email: c.email,
          phone: c.phone,
          password: '', // Senha não é retornada pela API de listagem
        };
      });
      setClients(mappedClients);
      setFilteredClients(mappedClients);
      setEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao editar cliente:', error);
      console.error('Detalhes do erro:', (error as any).response?.data);
      console.error('Status do erro:', (error as any).response?.status);
    }
  };

  const openDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setDeleteModalOpen(true);
  };

  const handleDeleteClient = async () => {
    if (!selectedClient.id) return;
    
    try {
      await ClientsService.delete(selectedClient.id);
      
      // Recarregar a lista de clientes
      const apiClients = await ClientsService.getAll();
      const mappedClients: Client[] = apiClients.map((c) => {
        const [firstName, ...rest] = c.name.split(' ');
        return {
          id: c.userId,
          name: c.name,
          cpf: c.cpf || '',
          email: c.email,
          phone: c.phone,
          password: '', // Senha não é retornada pela API de listagem
        };
      });
      setClients(mappedClients);
      setFilteredClients(mappedClients);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
    }
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
                setSelectedClient({
                  id: null,
                  name: "",
                  cpf: "",
                  email: "",
                  phone: "",
                  password: "",
                });
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
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Celular</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
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
            name="name"
            value={selectedClient.name}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Nome"
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
            name="password"
            type="password"
            value={selectedClient.password}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Senha"
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
            name="name"
            value={selectedClient.name}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Nome"
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
            name="password"
            type="password"
            value={selectedClient.password}
            onChange={(e) =>
              handleInputChange(e, selectedClient, setSelectedClient)
            }
            placeholder="Nova senha (deixe em branco para manter a atual)"
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
            {selectedClient?.name}
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
