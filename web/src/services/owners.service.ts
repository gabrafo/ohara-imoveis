import api from './api';

export interface Owner {
  ownerId: number;
  name: string;
  contactPhone: string;
  cpf?: string;
}

export interface CreateOwnerDto {
  name: string;
  contactPhone: string;
  cpf?: string;
}

export interface UpdateOwnerDto {
  name?: string;
  contactPhone?: string;
  cpf?: string;
}

const OwnersService = {
  async getAll(): Promise<Owner[]> {
    const res = await api.get<Owner[]>('/owners');
    return res.data;
  },
  async create(data: CreateOwnerDto): Promise<Owner> {
    const res = await api.post<Owner>('/owners', data);
    return res.data;
  },
  async update(id: number, data: UpdateOwnerDto): Promise<Owner> {
    const res = await api.put<Owner>(`/owners/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/owners/${id}`);
  },
};

export default OwnersService; 