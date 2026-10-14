import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AlertasService, AlertaDTO } from '../../../core/services/alertas';
import { Alerta as ToastService } from '../../../core/services/alerta';

@Component({
  selector: 'app-panel-alertas',
  templateUrl: './panel-alertas.html',
  styleUrls: ['./panel-alertas.css'],
  standalone: false
})
export class PanelAlertas implements OnInit {
  alertas: AlertaDTO[] = [];
  isLoading: boolean = false;
  isProcessingMassive: boolean = false;

  totalItems: number = 0;
  pageSize: number = 20;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [10, 20, 50];

  filtroTipo: string = '';
  filtroSeveridad: string = '';
  filtroEstado: string = ''; 

  tiposDisponibles: string[] = ['INDICADOR', 'TIPO_CAMBIO', 'RIESGO'];
  severidadesDisponibles: string[] = ['INFO', 'WARNING', 'CRITICAL'];

  constructor(
    private alertasService: AlertasService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarAlertas();
  }

  async cargarAlertas(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const res = await this.alertasService.getAlertas(
        this.pageIndex + 1,
        this.pageSize,
        {
          tipo_alerta: this.filtroTipo || undefined,
          severidad: this.filtroSeveridad || undefined,
          leida: this.filtroEstado !== '' ? this.filtroEstado : undefined
        }
      );

      this.alertas = res.results;
      this.totalItems = res.count;
    } catch {
      this.toast.show('Error al cargar la lista de alertas.', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarAlertas();
  }

  onFiltroChange(): void {
    this.pageIndex = 0; 
    this.cargarAlertas();
  }

  limpiarFiltros(): void {
    this.filtroTipo = '';
    this.filtroSeveridad = '';
    this.filtroEstado = '';
    this.pageIndex = 0;
    this.cargarAlertas();
  }

  async marcarIndividual(alerta: AlertaDTO): Promise<void> {
    if (alerta.leida) return;

    try {
      await this.alertasService.marcarComoLeida(alerta.id);
      alerta.leida = true;
      this.toast.show('Alerta marcada como leída.', 'success');
      this.cdr.detectChanges();
    } catch {
      this.toast.show('No se pudo marcar la alerta como leída.', 'error');
    }
  }

  async marcarTodas(): Promise<void> {
    this.isProcessingMassive = true;
    this.cdr.detectChanges();

    try {
      await this.alertasService.marcarTodasComoLeidas();
      this.toast.show('Todas las alertas han sido marcadas como leídas.', 'success');
      await this.cargarAlertas();
    } catch {
      this.toast.show('Error al actualizar las alertas masivamente.', 'error');
    } finally {
      this.isProcessingMassive = false;
      this.cdr.detectChanges();
    }
  }

  get pendientesCount(): number {
    return this.alertas.filter(alerta => !alerta.leida).length; 
  }

  getSeveridadIcon(severidad: string): string {
    switch (severidad) {
      case 'CRITICA': return 'dangerous';
      case 'ALTA': return 'warning';
      case 'MEDIA': return 'info';
      case 'BAJA':
      default: return 'check_circle';
    }
  }
}