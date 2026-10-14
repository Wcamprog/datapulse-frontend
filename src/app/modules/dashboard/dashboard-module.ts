import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard/dashboard';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { PaisesModule } from '../paises/paises-module';
import { TablaRanking } from './tabla-ranking/tabla-ranking';
import { MapaRiesgo } from './mapa-riesgo/mapa-riesgo';
import { MatCardModule } from '@angular/material/card';

import { Alerta } from '../alerta/alerta';
import { ResumenGeneral } from './resumen-general/resumen-general';
import { KpiCards } from './kpi-cards/kpi-cards';
import { GraficoTendencias } from './grafico-tendencias/grafico-tendencias';
import { AlertasModule } from '../alertas/alertas-module';
@NgModule({
  declarations: [
    Dashboard,
    ResumenGeneral,
    KpiCards,
    MapaRiesgo,
    TablaRanking,
    GraficoTendencias,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    PaisesModule,
    Alerta,
    MatCardModule,
    AlertasModule
  ]
})
export class DashboardModule { }