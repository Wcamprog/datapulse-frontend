import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Loading } from './loading';
@Injectable({
  providedIn: 'root'
})
export class Api {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private loading: Loading
  ) {}

  private async toPromise<T>(obs$: Observable<any>): Promise<T> {
    const mapped$= obs$.pipe(
      map(response => response?.data ?? response)
    );
    return firstValueFrom(mapped$);
  }

  get<T>(endpoint: string): Promise<T> {
    return this.toPromise<T>(this.http.get<any>(`${this.baseUrl}/${endpoint}`));
  }
  
  post<T>(endpoint: string, body: any = {}): Promise<T> {
    return this.toPromise<T>(this.http.post<any>(`${this.baseUrl}/${endpoint}`, body));
  }

  put<T>(endpoint: string, body: any): Promise<T> {
    return this.toPromise<T>(this.http.put<any>(`${this.baseUrl}/${endpoint}`, body));
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.toPromise<T>(this.http.delete<any>(`${this.baseUrl}/${endpoint}`));
  }
}