import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; 
  
  private currentUserSubject = new BehaviorSubject<boolean>(this.hasToken());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login/`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.access) {
            localStorage.setItem('token', response.access);
            if (response.refresh) {
              localStorage.setItem('refresh_token', response.refresh);
            }
            this.currentUserSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(false);
  }
}