import { Injectable, signal, OnDestroy } from '@angular/core';
import { Api } from './api';
import {
  Subscription,
  timer,
  switchMap,
  EMPTY,
  from,
  catchError
} from 'rxjs';

import { AuthService } from '../auth/services/auth';

export interface AlertaDTO {
  id: number;
  tipo: string;
  severidad: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion?: string;
  created_at?: string;
  pais?: string;
}

export interface AlertasFiltros {
  tipo_alerta?: string;
  severidad?: string;
  leida?: boolean | string;
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
export class AlertasService implements OnDestroy {

  public unreadCount = signal<number>(0);

  private pollingSub: Subscription | null = null;
  private authSub: Subscription | null = null;

  constructor(
    private api: Api,
    private authService: AuthService
  ) {

    this.authSub = this.authService.currentUser$.subscribe(
      (autenticado) => {
        if (autenticado && this.authService.isAuthenticated()) {
          this.iniciarPollingNoLeidas();

        } else {

          this.detenerPolling();
          this.unreadCount.set(0);
        }
      }
    );
  }

  async getAlertas(
    page: number = 1,
    pageSize: number = 20,
    filtros?: AlertasFiltros
  ): Promise<PaginatedResponse<AlertaDTO>> {

    if (!this.authService.isAuthenticated()) {
      return {
        count: 0,
        results: []
      };
    }

    const params = new URLSearchParams();

    params.append('page', String(page));
    params.append('page_size', String(pageSize));

    if (filtros) {
      if (filtros.tipo_alerta) {
        params.append('tipo_alerta', filtros.tipo_alerta);
      }
      if (filtros.severidad) {
        params.append('severidad', filtros.severidad);
      }
      if (filtros.leida !== undefined && filtros.leida !== '') {
        params.append('leida', String(filtros.leida));
      }
    }

    const res = await this.api.get<any>(
      `alertas/?${params.toString()}`
    );
    if (res && typeof res === 'object' && 'results' in res) {
      return res as PaginatedResponse<AlertaDTO>;
    }
    const lista = Array.isArray(res) ? res : [];
    return {
      count: lista.length,
      results: lista
    };
  }

  async marcarComoLeida(id: number): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    await this.api.put(`alertas/${id}/leer/`, {});
    await this.actualizarConteoNoLeidas();
  }

  async marcarTodasComoLeidas(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    await this.api.put('alertas/leer-todas/', {});

    this.unreadCount.set(0);
  }

  async actualizarConteoNoLeidas(): Promise<void> {

    if (!this.authService.isAuthenticated()) {
      this.unreadCount.set(0);
      return;
    }
    try {
      const res = await this.getAlertas(1, 1,
        { leida: false }
      );

      if (this.authService.isAuthenticated()) {
        this.unreadCount.set(res.count);
      }

    } catch (error) {
      console.error('Error consultando alertas:', error);
    }
  }
  iniciarPollingNoLeidas(): void {

    if (this.pollingSub) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.pollingSub = timer(0, 30000)
      .pipe(
        switchMap(() => {
          if (!this.authService.isAuthenticated()) {
            this.detenerPolling();
            this.unreadCount.set(0);
            return EMPTY;
          }
          return from(
            this.getAlertas(1, 1, { leida: false })
          ).pipe(
            catchError((error) => {
              console.error(
                'Error en polling de alertas:',
                error
              );
              return EMPTY;
            })
          );
        })
      )
      .subscribe({
        next: (res) => {

          if (this.authService.isAuthenticated()) {
            this.unreadCount.set(res.count);
          }
        }
      });
  }

  detenerPolling(): void {

    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
  }

  ngOnDestroy(): void {

    this.detenerPolling();

    if (this.authSub) {
      this.authSub.unsubscribe();
      this.authSub = null;
    }
  }
}