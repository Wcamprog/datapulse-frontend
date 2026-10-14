import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Lista } from './lista/lista';
import { Detalle } from './detalle/detalle';

const routes: Routes = [
  { path: '', component: Lista },
  { path: ':id', component: Detalle }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortafoliosRoutingModule {}