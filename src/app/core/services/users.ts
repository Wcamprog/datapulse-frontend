import { Injectable } from '@angular/core';
import { Api } from './api';

export interface Usuario {
  id?: number;
  email: string;
  nombre_completo: string;
  rol: 'ADMIN' | 'ANALISTA' | 'VIEWER';
  activo: boolean;
  fecha_creacion?: string;
  password?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  total_pages?: number;
  current_page?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class Users {
  private readonly endpoint = 'auth/usuarios/';

  constructor(private api: Api) {}

  async getUsuarios(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Usuario>> {
    return await this.api.get<PaginatedResponse<Usuario>>(
      `${this.endpoint}?page=${page}&page_size=${pageSize}`
    );
  }

  async crearUsuario(usuario: Usuario): Promise<Usuario> {
    return await this.api.post(this.endpoint, usuario);
  }

  async actualizarUsuario(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    return await this.api.patch(`${this.endpoint}${id}/`, usuario);
  }

  async eliminarUsuario(id: number): Promise<void> {
    return await this.api.delete(`${this.endpoint}${id}/`);
  }
}