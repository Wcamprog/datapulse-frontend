import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { ResumenGeneral } from './resumen-general/resumen-general';
import { adminGuard } from '../../core/guards/admin-guard';

const routes: Routes = [
  {
    path: '',
    component: Dashboard, 
    children: [
      {
        path: '',
        component: ResumenGeneral 
      },
      {
        path: 'listar-paises',
        loadChildren: () => import('../paises/paises-module').then(m => m.PaisesModule)
      },
      {
        path: 'listar-portafolios',
        loadChildren: () => import('../portafolios/portafolios-module').then(m => m.PortafoliosModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('../usuarios/usuarios-module').then(m => m.UsuariosModule),
        canActivate: [adminGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }