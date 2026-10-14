import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard'; 
import { NotFound } from './shared/not-found/not-found';
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard-module').then(m => m.DashboardModule),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  { 
    path: '**', 
    component: NotFound 
  }
];