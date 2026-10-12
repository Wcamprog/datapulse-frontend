import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.html',
  styleUrls: ['./loading-spinner.css'],
  standalone: false // <--- Tradicional
})
export class LoadingSpinner {
  @Input() diameter: number = 40;
  @Input() message: string = '';
  @Input() overlay: boolean = false;
}