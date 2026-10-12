import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrls: ['./modal.css'],
  standalone: false, 
})
export class Modal {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() icon: string = 'info';
  @Input() maxWidth: string = '600px';
  
  @Output() onClose = new EventEmitter<void>();

  close(): void {
    this.onClose.emit();
  }
}