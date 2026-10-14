import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.css'],   
  standalone: false 
})
export class NotFound {
  constructor(private router: Router) {}

  irAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}