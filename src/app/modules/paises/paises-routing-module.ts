import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaPaises } from './lista-paises/lista-paises';
import { DetallePais } from './detalle-pais/detalle-pais';

const routes: Routes = [
  {
    path: '', 
    component: ListaPaises
  },
  {
    path: ':codigo_iso',
    component: DetallePais
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaisesRoutingModule { }