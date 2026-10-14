import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PortafoliosRoutingModule } from './portafolios-routing-module';
import { Lista } from './lista/lista';
import { Detalle } from './detalle/detalle';
import { PosicionForm } from './posicion-form/posicion-form';
import { DistribucionChart } from './distribucion-chart/distribucion-chart'; // <-- Descomentado
import { PortafolioModal } from './portafolio-modal/portafolio-modal';

// Angular Material (únicamente Módulos)
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; // <-- Sin MatLabel aquí
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';

import { SharedModule } from '../../shared/shared-module';

@NgModule({
  declarations: [
    Lista,
    Detalle,
    PosicionForm,
    DistribucionChart,
    PortafolioModal
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PortafoliosRoutingModule,
    SharedModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule
  ]
})
export class PortafoliosModule {}