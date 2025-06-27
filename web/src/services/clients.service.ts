import api from './api';

export interface Client {
  userId: number;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  role: string;
}

export interface CreateClientDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  birthDate: string;
  role: string;
  cpf?: string;
}

export interface UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
  password?: string;
}

const ClientsService = {
  async getAll(): Promise<Client[]> {
    const res = await api.get<Client[]>('/users');
    return res.data;
  },
  async create(data: CreateClientDto): Promise<Client> {
    const res = await api.post<Client>('/users', data);
    return res.data;
  },
  async update(id: number, data: UpdateClientDto): Promise<Client> {
    const res = await api.put<Client>(`/users/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

export default ClientsService; 