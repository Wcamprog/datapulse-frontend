import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Modules necesarios
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';

import { SharedModule } from '../../shared/shared-module';

import { UsuariosRoutingModule } from './usuarios-routing-module';
import { Usuarios } from './usuarios/usuarios';
import { UsuarioModal } from './components/usuario-modal/usuario-modal';

@NgModule({
  declarations: [
    Usuarios,
    UsuarioModal,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsuariosRoutingModule,
    SharedModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ]
})
export class UsuariosModule {}