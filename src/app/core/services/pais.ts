import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';

@Injectable({
  providedIn: 'root'
})
export class Paises {

  constructor(private api: Api) { }

  getPaises(): Promise<any> {
    return this.api.get<any>('paises/');
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
}