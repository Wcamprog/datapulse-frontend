// En src/app/core/services/riesgo.ts
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
  promedio_irpc: number;
}

@Injectable({
  providedIn: 'root'
})
export class Riesgo {
  constructor(private api: Api) { }

  async getDatosMapa(): Promise<PaisMapa[]> {
    return await this.api.get<PaisMapa[]>('dashboard/mapa/');
  }

  async getResumen(): Promise<DashboardResumen> {
    return await this.api.get<DashboardResumen>('dashboard/resumen/');
  }

}