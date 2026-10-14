import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertasService } from '../../../core/services/alertas';

@Component({
  selector: 'app-alerta-badge',
  templateUrl: './alerta-badge.html',
  styleUrls: ['./alerta-badge.css'],
  standalone: false
})
export class AlertaBadge implements OnInit {
  constructor(
    public alertasService: AlertasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.alertasService.iniciarPollingNoLeidas();
  }

  irAPanel(): void {
    this.router.navigate(['/dashboard/alertas']);
  }
}