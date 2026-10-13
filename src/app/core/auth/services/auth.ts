import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Api } from '../../services/api';

export interface TokenPayload {
  user_id: number;
  email?: string;
  rol?: 'ADMIN' | 'ANALISTA' | 'VIEWER';
  is_superuser?: boolean;
  exp?: number;
  [key: string]: any;
}

export interface LoginResponse {
  access: string;
  refresh?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<boolean>(this.hasToken());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: Api) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('auth/login/', { email, password });

    if (response && response.access) {
      localStorage.setItem('token', response.access);

      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh);
      }

      this.currentUserSubject.next(true);
    }

    return response;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(false);
  }


  getDecodedToken(): TokenPayload | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload) as TokenPayload;
    } catch (error) {
      console.error('Error al decodificar el token JWT:', error);
      return null;
    }
  }

  getUserRole(): string | null {
    const payload = this.getDecodedToken();
    return payload?.rol || null;
  }

  isAdmin(): boolean {
    const payload = this.getDecodedToken();
    if (!payload) return false;

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }

    return payload.rol === 'ADMIN' || payload.is_superuser === true;
  }
}