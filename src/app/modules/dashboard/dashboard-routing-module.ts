import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { ResumenGeneral } from './resumen-general/resumen-general';

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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }