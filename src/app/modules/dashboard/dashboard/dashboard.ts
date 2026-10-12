import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: false,
})
export class Dashboard {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  columns = [
    {
      title: 'Resumen General',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      title: 'Países',
      icon: 'public',
      route: '/dashboard/listar-paises'
    },
    {
      title: 'Portafolios',
      icon: 'pie_chart',
      route: '/dashboard/listar-portafolios'
    }
  ];


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}