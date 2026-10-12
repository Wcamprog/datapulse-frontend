import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loading } from './core/services/loading';
import { SharedModule } from './shared/shared-module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor(public loadingService: Loading) {}
  protected readonly title = signal('frontend-app');
}
