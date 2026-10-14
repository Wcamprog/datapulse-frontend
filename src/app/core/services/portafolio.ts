import { Injectable } from '@angular/core';
import { Api } from './api';

export type TipoActivo = 'RENTA_FIJA' | 'RENTA_VARIABLE' | 'COMMODITIES' | 'MONEDA';

export interface PosicionDTO {
  id?: number;
  portafolio?: number;
  pais: string;                    // Código ISO (ej. 'CO')
  pais_nombre?: string;
  tipo_activo: TipoActivo | string;
  monto_inversion_usd: number;
  fecha_entrada: string;
  fecha_salida?: string | null;
  notas?: string;
}

export interface PortafolioDTO {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  es_publico: boolean;
  usuario?: number;
  posiciones?: PosicionDTO[];
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface DistribucionItem {
  tipo_activo?: string;
  pais__nombre?: string;
  total: number;
  cantidad?: number;
}

export interface ResumenPortafolioDTO {
  portafolio: string;
  total_invertido_usd: number;
  distribucion_activos: DistribucionItem[];
  distribucion_paises: DistribucionItem[];
  riesgo_ponderado?: number;
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
  providedIn: 'root',
})
export class Portafolio {
  private readonly endpoint = 'portafolios/';

  constructor(private api: Api) {}

  async getPortafolios(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<PortafolioDTO>> {
  const cleanEndpoint = this.endpoint.startsWith('/') ? this.endpoint.slice(1) : this.endpoint;
  return await this.api.get<PaginatedResponse<PortafolioDTO>>(
    `${cleanEndpoint}?page=${page}&page_size=${pageSize}`
  );
}

  async getPortafolio(id: number): Promise<PortafolioDTO> {
    return await this.api.get<PortafolioDTO>(`${this.endpoint}${id}/`);
  }

  async crearPortafolio(data: Partial<PortafolioDTO>): Promise<PortafolioDTO> {
    return await this.api.post<PortafolioDTO>(this.endpoint, data);
  }

  async actualizarPortafolio(id: number, data: Partial<PortafolioDTO>): Promise<PortafolioDTO> {
    return await this.api.put<PortafolioDTO>(`${this.endpoint}${id}/`, data);
  }

  async eliminarPortafolio(id: number): Promise<void> {
    return await this.api.delete(`${this.endpoint}${id}/`);
  }

  async agregarPosicion(portafolioId: number, posicion: PosicionDTO): Promise<PosicionDTO> {
    return await this.api.post<PosicionDTO>(`${this.endpoint}${portafolioId}/posiciones/`, posicion);
  }

  async actualizarPosicion(
    portafolioId: number,
    posicionId: number,
    posicion: Partial<PosicionDTO>
  ): Promise<PosicionDTO> {
    return await this.api.put<PosicionDTO>(
      `${this.endpoint}${portafolioId}/posiciones/${posicionId}/`,
      posicion
    );
  }

  async cerrarPosicion(portafolioId: number, posicionId: number): Promise<void> {
    return await this.api.delete(`${this.endpoint}${portafolioId}/posiciones/${posicionId}/`);
  }

  async getResumen(portafolioId: number): Promise<ResumenPortafolioDTO> {
    return await this.api.get<ResumenPortafolioDTO>(`${this.endpoint}${portafolioId}/resumen/`);
  }

  async descargarPdf(portafolioId: number, nombreArchivo = `reporte_${portafolioId}.pdf`): Promise<void> {
    const blob = await this.api.getBlob(`${this.endpoint}${portafolioId}/export/pdf/`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}