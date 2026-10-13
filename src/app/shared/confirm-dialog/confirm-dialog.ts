import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.css'],
  standalone: false
})
export class ConfirmDialog {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirmar acción';
  @Input() message: string = '¿Estás seguro de que deseas continuar?';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() confirmColor: 'primary' | 'warn' | 'accent' = 'warn';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}