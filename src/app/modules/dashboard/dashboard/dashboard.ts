import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: false,
})
export class Dashboard implements OnInit {

  columns: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.construirMenu();
  }

  private construirMenu(): void {
    const menuBase: MenuItem[] = [
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
      },
      {
        title: 'Alertas',
        icon: 'notifications_active',
        route: '/dashboard/alertas'
      }
    ];

    if (this.authService.isAdmin()) {
      menuBase.push({
        title: 'Usuarios',
        icon: 'people',
        route: '/dashboard/usuarios'
      });
    }

    this.columns = menuBase;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}