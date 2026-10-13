import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';

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
export class Paises {

  constructor(private api: Api) { }

  async getPaises(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Paises>> {
    return await this.api.get<PaginatedResponse<Paises>>(`paises/?page=${page}&page_size=${pageSize}`);
  }

  sincronizarIndicadores(): Promise<any> {
    return this.api.post<any>('paises/sync-indicadores/', {});
  }

  async consultarPaisExterno(query: string): Promise<any> {
    return await this.api.get(`paises/consultar-externo/?query=${encodeURIComponent(query)}`);
  }

  async crearPais(payload: any): Promise<any> {
    return await this.api.post('paises/', payload);
  }

  async getPaisByIso(codigoIso: string): Promise<any> {
    return await this.api.get(`paises/${codigoIso}/`);
  }

  async getHistoricoTipoCambio(codigoIso: string): Promise<any> {
    const res = await this.api.get<any>(`paises/${codigoIso}/tipo-cambio/`);
    return Array.isArray(res) ? res : (res?.results || []);
  }

  async getHistoricoRiesgo(codigoIso: string): Promise<any[]> {
    try {
      const res = await this.api.get<any>(`riesgo/historico/${codigoIso}/`);
      return Array.isArray(res) ? res : (res?.results || []);
    } catch (error) {
      console.error('Error al obtener histórico de riesgo:', error);
      return [];
    }
  }

  async recalcularIndices(): Promise<any> {
    return await this.api.post('riesgo/calcular/', {});
  }
}