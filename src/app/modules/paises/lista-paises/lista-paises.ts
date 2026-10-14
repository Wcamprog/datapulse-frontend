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
  pageSize: number = 20;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [10, 20, 50];

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
    if (this.isSyncing) return;

    this.isSyncing = true;
    this.cdr.detectChanges();

    try {
      const resp: any = await this.paisesService.sincronizarIndicadores();

      const mensajeExito = resp?.mensaje || 'Sincronización en segundo plano iniciada correctamente.';
      this.alerta.show(mensajeExito, 'success');

      await this.cargarPaises();
    } catch (error: any) {
      const errorMsg = error?.error?.mensaje
        || error?.error?.detail
        || error?.error?.error
        || this.extraerError(error, 'Error al sincronizar indicadores');

      this.alerta.show(errorMsg, 'error');
    } finally {
      this.isSyncing = false;
      this.cdr.detectChanges();
    }
  }

  private extraerError(err: any, fallback: string): string {
    if (err?.error?.detail) return err.error.detail;
    if (err?.error?.error) return err.error.error;
    if (err?.detail) return err.detail;
    if (err?.message) return err.message;
    return fallback;
  }
}