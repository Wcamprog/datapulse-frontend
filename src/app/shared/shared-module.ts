import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon'; // <--- Importar
import { MatButtonModule } from '@angular/material/button'; // <--- Importar
import { MatTableModule } from '@angular/material/table';
import { LoadingSpinner } from './loading-spinner/loading-spinner';
import { Modal } from './modal/modal';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';

@NgModule({
  declarations: [
    LoadingSpinner,
    Modal,
    ConfirmDialog
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,  
    MatButtonModule,
    MatTableModule 
  ],
  exports: [
    LoadingSpinner,
    Modal,
    MatIconModule,  
    MatButtonModule,
    MatTableModule,
    ConfirmDialog
  ]
})
export class SharedModule {}