import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Riesgo as RiesgoService, DashboardResumen } from '../../../core/services/riesgo';

export interface KpiItem {
  id: string;
  label: string;
  value: number | string;
  suffix?: string;
  subtitle: string;
  icon: string;
  colorClass?: string;
  customColor?: string;
}

@Component({
  selector: 'app-kpi-cards',
  templateUrl: './kpi-cards.html',
  styleUrls: ['./kpi-cards.css'],
  standalone: false
})
export class KpiCards implements OnInit {
  public kpiItems: KpiItem[] = [];
  public isLoading: boolean = true;

  constructor(
    private riesgoService: RiesgoService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarKPIs();
  }

  async cargarKPIs(): Promise<void> {
    try {
      this.isLoading = true;
      const data: DashboardResumen = await this.riesgoService.getResumen();
      this.generarKpis(data);
    } catch (error) {
      console.error('Error al cargar KPIs del dashboard:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private generarKpis(data: DashboardResumen): void {
    const irpcColor = data.promedio_irpc === null
      ? '#64748b'
      : this.obtenerColorIRPC(data.promedio_irpc);

    this.kpiItems = [
      {
        id: 'paises',
        label: 'Países Monitoreados',
        value: data.total_paises,
        subtitle: 'Latinoamérica',
        icon: 'public',
        colorClass: 'blue'
      },
      {
        id: 'alertas',
        label: 'Alertas Activas',
        value: data.alertas_activas,
        subtitle: 'Pendientes de revisión',
        icon: 'notifications_active',
        colorClass: 'orange'
      },
      {
        id: 'portafolios',
        label: 'Mis Portafolios',
        value: data.total_portafolios,
        subtitle: 'Estrategias activas',
        icon: 'pie_chart',
        colorClass: 'purple'
      },
      {
        id: 'irpc',
        label: 'Promedio IRPC Región',
        value: data.promedio_irpc ?? 'Sin datos',
        suffix: data.promedio_irpc === null ? undefined : '/ 100',
        subtitle: 'Índice de riesgo',
        icon: 'speed',
        customColor: irpcColor
      }
    ];
  }

  private obtenerColorIRPC(promedio: number): string {
    if (promedio >= 75) return '#10b981';
    if (promedio >= 50) return '#f59e0b';
    if (promedio >= 25) return '#f97316';
    return '#ef4444';
  }
}