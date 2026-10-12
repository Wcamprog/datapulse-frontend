import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaisesRoutingModule } from './paises-routing-module';
import { ListaPaises } from './lista-paises/lista-paises';
import { DetallePais } from './detalle-pais/detalle-pais';

import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared/shared-module';
import { IndicadoresModalComponent } from './indicadores-modal/indicadores-modal';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CrearPais } from './crear-pais/crear-pais';


@NgModule({
  declarations: [
    ListaPaises,
    DetallePais,
    IndicadoresModalComponent,
    CrearPais
  ],
  imports: [
    CommonModule,
    PaisesRoutingModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    SharedModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule
  ]
})
export class PaisesModule { }