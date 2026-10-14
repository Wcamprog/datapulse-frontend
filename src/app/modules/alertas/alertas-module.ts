import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlertasRoutingModule } from './alertas-routing-module';
import { PanelAlertas } from './panel-alertas/panel-alertas';
import { AlertaBadge } from './alerta-badge/alerta-badge';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [
    PanelAlertas,
    AlertaBadge
  ],
  imports: [
    CommonModule,
    FormsModule,
    AlertasRoutingModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  exports: [
    AlertaBadge 
  ]
})
export class AlertasModule {}