import { Injectable } from '@angular/core';
import { Api } from './api';

export interface PaisMapa {
  codigo_iso: string;
  nombre: string;
  region: string;
  latitud: number;
  longitud: number;
  irpc: number | null;
  nivel: string;
  color: string;
}

export interface DashboardResumen {
  total_paises: number;
  alertas_activas: number;
  total_portafolios: number;
  promedio_irpc: number | null;
}

export type TipoIndicador =
  | 'PIB' | 'INFLACION' | 'DESEMPLEO'
  | 'DEUDA_PIB' | 'PIB_PERCAPITA' | 'BALANZA_COMERCIAL';

export interface SerieTendencia {
  codigo_iso: string;
  nombre: string;
  valores: (number | null)[];
}

export interface TendenciasResponse {
  indicador: string;
  anios: number[];
  series: SerieTendencia[];
}

@Injectable({ providedIn: 'root' })
export class Riesgo {
  constructor(private api: Api) {}

  getDatosMapa(): Promise<PaisMapa[]> {
    return this.api.get<PaisMapa[]>('dashboard/mapa/');
  }

  getResumen(): Promise<DashboardResumen> {
    return this.api.get<DashboardResumen>('dashboard/resumen/');
  }

  getTendencias(tipo: TipoIndicador, paises: string[]): Promise<TendenciasResponse> {
    const params = new URLSearchParams();
    params.set('tipo', tipo);
    params.set('paises', paises.join(','));
    return this.api.get<TendenciasResponse>(`dashboard/tendencias/?${params.toString()}`);
  }
}
