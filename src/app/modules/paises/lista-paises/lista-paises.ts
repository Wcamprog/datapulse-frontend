import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Paises as PaisService } from '../../../core/services/pais';
import { Alerta as AlertaService } from '../../../core/services/alerta';

@Component({
  selector: 'app-lista-paises',
  templateUrl: './lista-paises.html',
  styleUrls: ['./lista-paises.css'],
  standalone: false
})
export class ListaPaises implements OnInit {
  paises: any[] = [];
  displayedColumns: string[] = ['codigo_iso', 'nombre', 'moneda', 'region', 'acciones'];

  isLoading: boolean = false;
  isSyncing: boolean = false;

  totalItems: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [5, 10, 25];

  isModalOpen: boolean = false;
  paisSeleccionado: any | null = null;
  isCrearPaisOpen: boolean = false;

  constructor(
    private paisesService: PaisService,
    private alerta: AlertaService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    await this.cargarPaises();
  }

  async cargarPaises(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const res = await this.paisesService.getPaises(this.pageIndex + 1, this.pageSize);
      this.paises = res.results;
      this.totalItems = res.count;
    } catch (err) {
      this.alerta.show('Error al cargar la lista de países.', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarPaises();
  }

  abrirCrearPais(): void {
    this.isCrearPaisOpen = true;
    this.cdr.detectChanges();
  }

  onModalCrearPaisClosed(recargar: boolean): void {
    this.isCrearPaisOpen = false;
    this.cdr.detectChanges();
    if (recargar) {
      this.cargarPaises();
    }
  }

  verIndicadores(pais: any): void {
    this.paisSeleccionado = pais;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.paisSeleccionado = null;
    this.cdr.detectChanges();
  }

  async sincronizar(): Promise<void> {
    this.isSyncing = true;
    this.cdr.detectChanges();

    const [resSync, resCalculo] = await Promise.allSettled([
      this.paisesService.sincronizarIndicadores(),
      this.paisesService.recalcularIndices()
    ]);

    let huboExito = false;

    if (resSync.status === 'fulfilled') {
      this.alerta.show('Indicadores sincronizados exitosamente.', 'success');
      huboExito = true;
    } else {
      const errorMsg = this.extraerError(resSync.reason, 'Error al sincronizar indicadores');
      this.alerta.show(`Sincronización: ${errorMsg}`, 'error');
    }

    if (resCalculo.status === 'fulfilled') {
      this.alerta.show('Índices recalculados exitosamente.', 'success');
      huboExito = true;
    } else {
      const errorMsg = this.extraerError(resCalculo.reason, 'Error al recalcular índices');
      this.alerta.show(`Cálculo de Índices: ${errorMsg}`, 'error');
    }

    if (huboExito) {
      await this.cargarPaises();
    }

    this.isSyncing = false;
    this.cdr.detectChanges();
  }

  private extraerError(err: any, fallback: string): string {
    if (err?.error?.detail) return err.error.detail;
    if (err?.error?.error) return err.error.error;
    if (err?.detail) return err.detail;
    if (err?.message) return err.message;
    return fallback;
  }
}