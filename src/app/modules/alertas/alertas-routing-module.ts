import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelAlertas } from './panel-alertas/panel-alertas';

const routes: Routes = [
  {
    path: '',
    component: PanelAlertas
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertasRoutingModule {}