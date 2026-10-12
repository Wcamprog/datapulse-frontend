import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'warning' | 'error';

export interface AlertMessage {
  text: string;
  type: AlertType;
}

@Injectable({
  providedIn: 'root'
})
export class Alerta {
  public currentAlert = signal<AlertMessage | null>(null);
  private timeoutId: any;

  show(text: string, type: AlertType = 'success', duration: number = 6000): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.currentAlert.set({ text, type });

    this.timeoutId = setTimeout(() => {
      this.clear();
    }, duration);
  }

  clear(): void {
    console.log('Limpiando alerta...');
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.currentAlert.set(null);
  }
}