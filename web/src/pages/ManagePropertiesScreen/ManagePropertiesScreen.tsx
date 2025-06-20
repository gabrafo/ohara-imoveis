import { useState, useEffect, useRef } from "react";
import type { FC, ReactNode } from "react";
import { Pencil, Trash2, X, Star, UploadCloud } from "lucide-react";
import ManagementNavBar from "../../components/ManagementNavBar/ManagementNavBar";
import "./ManagePropertiesScreen.css";

// --- INTERFACES DE TIPAGEM ATUALIZADAS ---
interface Image {
  id: string;
  url: string;
  isMain: boolean;
}

interface Property {
  id: number | null;
  title: string;
  owner: string;
  type: "Venda" | "Aluguel";
  price: number | "";
  area: number | "";
  bedrooms: number | "";
  bathrooms: number | "";
  status: "Disponível" | "Reservado" | "Vendido" | "Alugado";
  images: Image[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// --- DADOS INICIAIS ATUALIZADOS ---
const initialProperties: Property[] = [
  {
    id: 1,
    title: "Apartamento Luxo no Centro",
    owner: "João Silva",
    type: "Aluguel",
    price: 3500,
    area: 120,
    bedrooms: 3,
    bathrooms: 2,
    status: "Disponível",
    images: [
      {
        id: "img1",
        url: "https://via.placeholder.com/400x300.png/0000FF/FFFFFF?Text=Sala",
        isMain: true,
      },
      {
        id: "img2",
        url: "https://via.placeholder.com/400x300.png/FF0000/FFFFFF?Text=Cozinha",
        isMain: false,
      },
    ],
  },
  {
    id: 2,
    title: "Casa com Piscina no Bairro Nobre",
    owner: "Maria Oliveira",
    type: "Venda",
    price: 850000,
    area: 300,
    bedrooms: 4,
    bathrooms: 4,
    status: "Vendido",
    images: [
      {
        id: "img3",
        url: "https://via.placeholder.com/400x300.png/008000/FFFFFF?Text=Fachada",
        isMain: true,
      },
    ],
  },
];

const emptyProperty: Property = {
  id: null,
  title: "",
  owner: "",
  type: "Venda",
  price: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  status: "Disponível",
  images: [],
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

const ManagePropertiesScreen: FC = () => {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [filteredProperties, setFilteredProperties] =
    useState<Property[]>(initialProperties);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<Property>(emptyProperty);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = properties.filter(
      (prop) =>
        prop.title.toLowerCase().includes(lowercasedTerm) ||
        prop.owner.toLowerCase().includes(lowercasedTerm) ||
        prop.status.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredProperties(results);
  }, [searchTerm, properties]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSelectedProperty({ ...selectedProperty, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newImages: Image[] = files.map((file) => ({
      id: `local-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      isMain: false,
    }));
    if (selectedProperty.images.length === 0 && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    setSelectedProperty({
      ...selectedProperty,
      images: [...selectedProperty.images, ...newImages],
    });
  };

  const setMainImage = (imageId: string) => {
    const updatedImages = selectedProperty.images.map((img) => ({
      ...img,
      isMain: img.id === imageId,
    }));
    setSelectedProperty({ ...selectedProperty, images: updatedImages });
  };

  const removeImage = (imageId: string) => {
    const remainingImages = selectedProperty.images.filter(
      (img) => img.id !== imageId
    );
    const wasMain = selectedProperty.images.find(
      (img) => img.id === imageId
    )?.isMain;
    if (wasMain && remainingImages.length > 0) {
      remainingImages[0].isMain = true;
    }
    setSelectedProperty({ ...selectedProperty, images: remainingImages });
  };

  const handleAddProperty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProperties([...properties, { ...selectedProperty, id: Date.now() }]);
    setAddModalOpen(false);
  };

  const openEditModal = (property: Property) => {
    setSelectedProperty(property);
    setEditModalOpen(true);
  };

  const handleEditProperty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProperties(
      properties.map((p) =>
        p.id === selectedProperty.id ? selectedProperty : p
      )
    );
    setEditModalOpen(false);
  };

  const openDeleteModal = (property: Property) => {
    setSelectedProperty(property);
    setDeleteModalOpen(true);
  };

  const handleDeleteProperty = () => {
    setProperties(properties.filter((p) => p.id !== selectedProperty.id));
    setDeleteModalOpen(false);
  };

  return (
    <div className="manage-properties-screen">
      <ManagementNavBar />
      <main className="properties-main-content">
        <div className="container">
          <aside className="properties-actions">
            <h1 className="properties-title">Gerenciar imóveis</h1>
            <button
              className="action-btn add-btn"
              onClick={() => {
                setSelectedProperty(emptyProperty);
                setAddModalOpen(true);
              }}
            >
              Adicionar Imóvel +
            </button>
            <div className="search-container">
              <label htmlFor="search">Pesquisar Imóvel</label>
              <input
                type="text"
                id="search"
                className="search-input"
                placeholder="Título, proprietário, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="pagination-info">
              Mostrando {filteredProperties.length} de {properties.length}{" "}
              imóveis
            </p>
          </aside>

          <section className="properties-table-section">
            <table className="properties-table">
              <thead>
                <tr>
                  <th>Capa</th>
                  <th>Título</th>
                  <th>Proprietário</th>
                  <th>Tipo</th>
                  <th>Preço</th>
                  <th>Área (m²)</th>
                  <th>Quartos</th>
                  <th>Banheiros</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((prop) => {
                  const mainImage =
                    prop.images.find((img) => img.isMain) || prop.images[0];
                  return (
                    <tr key={prop.id}>
                      <td>
                        <img
                          src={
                            mainImage
                              ? mainImage.url
                              : "https://via.placeholder.com/80x60.png/CCCCCC/FFFFFF?Text=Sem+Foto"
                          }
                          alt="Capa do imóvel"
                          className="table-thumbnail"
                        />
                      </td>
                      <td data-label="Título">{prop.title}</td>
                      <td data-label="Proprietário">{prop.owner}</td>
                      <td data-label="Tipo">{prop.type}</td>
                      <td data-label="Preço">
                        {typeof prop.price === "number"
                          ? prop.price.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "N/A"}
                      </td>
                      <td data-label="Área (m²)">{prop.area}</td>
                      <td data-label="Quartos">{prop.bedrooms}</td>
                      <td data-label="Banheiros">{prop.bathrooms}</td>
                      <td data-label="Status">
                        <span
                          className={`status-badge status-${prop.status
                            .toLowerCase()
                            .replace("í", "i")}`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td className="action-icons">
                        <button
                          className="icon-btn"
                          aria-label="Editar imóvel"
                          onClick={() => openEditModal(prop)}
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          className="icon-btn"
                          aria-label="Deletar imóvel"
                          onClick={() => openDeleteModal(prop)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      {/* --- MODAL DE ADICIONAR/EDITAR ATUALIZADO --- */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
        }}
        title={isAddModalOpen ? "Adicionar Novo Imóvel" : "Editar Imóvel"}
      >
        <form
          onSubmit={isAddModalOpen ? handleAddProperty : handleEditProperty}
          className="modal-form"
        >
          <input
            name="title"
            value={selectedProperty.title}
            onChange={handleInputChange}
            placeholder="Título do Imóvel"
            required
          />
          <input
            name="owner"
            value={selectedProperty.owner}
            onChange={handleInputChange}
            placeholder="Nome do Proprietário"
            required
          />
          <div className="form-grid">
            <select
              name="type"
              value={selectedProperty.type}
              onChange={handleInputChange}
            >
              <option value="Venda">Venda</option>
              <option value="Aluguel">Aluguel</option>
            </select>
            <select
              name="status"
              value={selectedProperty.status}
              onChange={handleInputChange}
            >
              <option value="Disponível">Disponível</option>
              <option value="Reservado">Reservado</option>
              <option value="Vendido">Vendido</option>
              <option value="Alugado">Alugado</option>
            </select>
          </div>
          <div className="form-grid">
            <input
              name="price"
              type="number"
              value={selectedProperty.price}
              onChange={handleInputChange}
              placeholder="Preço (R$)"
              required
            />
            <input
              name="area"
              type="number"
              value={selectedProperty.area}
              onChange={handleInputChange}
              placeholder="Área (m²)"
              required
            />
          </div>

          {/* --- ALTERAÇÃO AQUI: Adicionado labels para Quartos e Banheiros --- */}
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="bedrooms">Quartos</label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                value={selectedProperty.bedrooms}
                onChange={handleInputChange}
                placeholder="Ex: 3"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="bathrooms">Banheiros</label>
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                value={selectedProperty.bathrooms}
                onChange={handleInputChange}
                placeholder="Ex: 2"
                required
              />
            </div>
          </div>

          <div className="image-manager">
            <h4>Imagens do Imóvel</h4>
            <div className="image-preview-grid">
              {selectedProperty.images.map((image) => (
                <div
                  key={image.id}
                  className={`image-preview-item ${image.isMain ? "main" : ""}`}
                >
                  <img src={image.url} alt="Preview" />
                  <div className="image-overlay">
                    <button
                      type="button"
                      title="Remover"
                      onClick={() => removeImage(image.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                    {!image.isMain && (
                      <button
                        type="button"
                        title="Definir como principal"
                        onClick={() => setMainImage(image.id)}
                      >
                        <Star size={16} />
                      </button>
                    )}
                  </div>
                  {image.isMain && (
                    <div className="main-image-badge">
                      <Star size={12} /> Principal
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="upload-box"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={24} />
                <span>Adicionar Imagens</span>
              </button>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>

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
              {isAddModalOpen ? "Salvar" : "Atualizar"}
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
          Tem certeza que deseja excluir o imóvel{" "}
          <strong>{selectedProperty?.title}</strong>?
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
            onClick={handleDeleteProperty}
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManagePropertiesScreen;
