import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { Portafolio as PortafolioService, PortafolioDTO } from '../../../core/services/portafolio';
import { Alerta as AlertaService } from '../../../core/services/alerta';
import { AuthService } from '../../../core/auth/services/auth';
@Component({
  selector: 'app-lista',
  templateUrl: './lista.html',
  styleUrls: ['./lista.css'],
  standalone: false
})
export class Lista implements OnInit {
  displayedColumns: string[] = ['nombre', 'descripcion', 'tipo', 'posiciones', 'estado', 'acciones'];
  portafolios: PortafolioDTO[] = [];
  isLoading: boolean = true;
  currentUserId: number | null = null;

  totalItems: number = 0;
  pageSize: number = 20;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [10, 20, 50];

  isConfirmDialogOpen: boolean = false;
  portafolioAEliminar: PortafolioDTO | null = null;
  isDeleting: boolean = false;

  isModalOpen: boolean = false;
  portafolioSeleccionado: PortafolioDTO | null = null;

  constructor(
    private portafolioService: PortafolioService,
    private alerta: AlertaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.obtenerUsuarioActual();
    await this.cargarPortafolios();
  }

  private obtenerUsuarioActual(): void {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  async cargarPortafolios(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const res = await this.portafolioService.getPortafolios(this.pageIndex + 1, this.pageSize);
      this.portafolios = res.results || [];
      this.totalItems = res.count || 0;
    } catch (error) {
      this.alerta.show('Error al cargar la lista de portafolios.', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarPortafolios();
  }

  esPropio(portafolio: PortafolioDTO): boolean {
    if (!this.currentUserId || !portafolio.usuario) return true;
    return portafolio.usuario == this.currentUserId;
  }

  verDetalle(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/dashboard/listar-portafolios', id]);
    }
  }

  confirmarEliminacion(portafolio: PortafolioDTO): void {
    this.portafolioAEliminar = portafolio;
    this.isConfirmDialogOpen = true;
  }

  cancelarEliminacion(): void {
    this.portafolioAEliminar = null;
    this.isConfirmDialogOpen = false;
  }

  async ejecutarEliminacion(): Promise<void> {
    if (!this.portafolioAEliminar?.id) return;
    this.isDeleting = true;
    try {
      await this.portafolioService.eliminarPortafolio(this.portafolioAEliminar.id);
      this.alerta.show('Portafolio eliminado correctamente.', 'success');
      this.cancelarEliminacion();
      await this.cargarPortafolios();
    } catch (error) {
      this.alerta.show('No se pudo eliminar el portafolio.', 'error');
    } finally {
      this.isDeleting = false;
      this.cdr.detectChanges();
    }
  }

  abrirCrear(): void {
    this.portafolioSeleccionado = null;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  abrirEditar(p: PortafolioDTO): void {
    this.portafolioSeleccionado = p;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  onModalPortafolioClosed(recargar: boolean): void {
    this.isModalOpen = false;
    this.portafolioSeleccionado = null;
    this.cdr.detectChanges();
    if (recargar) {
      this.cargarPortafolios();
    }
  }
}