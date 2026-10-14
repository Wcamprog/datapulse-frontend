import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { PosicionDTO, ResumenPortafolioDTO } from '../../../core/services/portafolio';

Chart.register(...registerables);

@Component({
  selector: 'app-distribucion-chart',
  templateUrl: './distribucion-chart.html',
  styleUrls: ['./distribucion-chart.css'],
  standalone: false
})
export class DistribucionChart implements OnChanges, AfterViewInit, OnDestroy {
  @Input() posiciones: PosicionDTO[] = [];
  @Input() resumen: ResumenPortafolioDTO | null = null;

  @ViewChild('piePaisCanvas') piePaisCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutActivoCanvas') donutActivoCanvas!: ElementRef<HTMLCanvasElement>;

  private pieChartInstance: Chart | null = null;
  private donutChartInstance: Chart | null = null;

  private isViewInitialized = false;

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.renderGraficos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['posiciones'] || changes['resumen']) && this.isViewInitialized) {
      this.renderGraficos();
    }
  }

  ngOnDestroy(): void {
    this.destruirGraficos();
  }

  private destruirGraficos(): void {
    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
      this.pieChartInstance = null;
    }
    if (this.donutChartInstance) {
      this.donutChartInstance.destroy();
      this.donutChartInstance = null;
    }
  }

  renderGraficos(): void {
    this.destruirGraficos();

    if (!this.posiciones || this.posiciones.length === 0) {
      return;
    }

    const activas = this.posiciones.filter(p => !p.fecha_salida);
    if (activas.length === 0) return;

    // 1. Agrupar montos por país
    const paisesTotales: Record<string, number> = {};
    activas.forEach(p => {
      const pais = p.pais || 'Otros';
      paisesTotales[pais] = (paisesTotales[pais] || 0) + Number(p.monto_inversion_usd);
    });

    // 2. Agrupar montos por tipo de activo
    const activosTotales: Record<string, number> = {};
    activas.forEach(p => {
      const activo = p.tipo_activo || 'Otros';
      activosTotales[activo] = (activosTotales[activo] || 0) + Number(p.monto_inversion_usd);
    });

    const paletaColores = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
      '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'
    ];

    if (this.piePaisCanvas?.nativeElement) {
      this.pieChartInstance = new Chart(this.piePaisCanvas.nativeElement, {
        type: 'pie',
        data: {
          labels: Object.keys(paisesTotales),
          datasets: [{
            data: Object.values(paisesTotales),
            backgroundColor: paletaColores,
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    if (this.donutActivoCanvas?.nativeElement) {
      this.donutChartInstance = new Chart(this.donutActivoCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(activosTotales),
          datasets: [{
            data: Object.values(activosTotales),
            backgroundColor: paletaColores,
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  }
}