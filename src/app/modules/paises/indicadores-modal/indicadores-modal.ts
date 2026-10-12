import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-indicadores-modal',
  templateUrl: './indicadores-modal.html',
  styleUrls: ['./indicadores-modal.css'],
  standalone: false
})
export class IndicadoresModalComponent {
  @Input() isOpen: boolean = false;
  @Input() pais: any | null = null;
  @Output() closeModal = new EventEmitter<void>();

  cerrar(): void {
    this.closeModal.emit();
  }
}