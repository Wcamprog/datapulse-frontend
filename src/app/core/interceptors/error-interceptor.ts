import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/services/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient); 

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          return http.post<any>(`${environment.apiUrl}/auth/refresh/`, { refresh: refreshToken }).pipe(
            switchMap((res: any) => {
              localStorage.setItem('token', res.access);
              
              const clonedRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.access}`
                }
              });
              
              return next(clonedRequest);
            }),
            catchError((refreshError) => {
              authService.logout();
              router.navigate(['/auth/login']);
              return throwError(() => refreshError);
            })
          );
        } else {
          authService.logout();
          router.navigate(['/auth/login']);
        }
      }

      return throwError(() => error);
    })
  );
};