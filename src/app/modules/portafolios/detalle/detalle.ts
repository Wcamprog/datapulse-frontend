import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Portafolio as PortafolioService, PortafolioDTO, PosicionDTO, ResumenPortafolioDTO } from '../../../core/services/portafolio';
import { Paises as PaisesService } from '../../../core/services/pais';
import { AuthService } from '../../../core/auth/services/auth';
import { Alerta as AlertaService } from '../../../core/services/alerta';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.html',
  styleUrls: ['./detalle.css'],
  standalone: false
})
export class Detalle implements OnInit {
  portafolioId!: number;
  portafolio: PortafolioDTO | null = null;
  resumen: ResumenPortafolioDTO | null = null;
  isLoading: boolean = true;
  isExportingPdf: boolean = false;
  currentUserId: number | null = null;

  totalInvertidoUsd: number = 0;
  riesgoPromedioPonderado: number = 0;

  displayedColumns: string[] = ['pais', 'tipo_activo', 'monto', 'fecha_entrada', 'fecha_salida', 'estado', 'acciones'];

  isPosicionModalOpen: boolean = false;
  posicionSeleccionada: PosicionDTO | null = null;

  isPortafolioModalOpen: boolean = false;

  isConfirmCerrarOpen: boolean = false;
  posicionACerrar: PosicionDTO | null = null;
  isClosing: boolean = false;

  paisesMap: Map<string, any> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portafolioService: PortafolioService,
    private paisesService: PaisesService,
    private authService: AuthService,
    private alerta: AlertaService,
    private cdr: ChangeDetectorRef
  ) {}

  get esPropietario(): boolean {
    if (!this.portafolio || !this.currentUserId) return true;
    return this.portafolio.usuario == this.currentUserId;
  }

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.authService.getCurrentUserId();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.volver();
      return;
    }
    this.portafolioId = Number(idParam);
    await this.cargarDatos();
  }


  async cargarDatos(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const paisesData = await this.paisesService.getPaises();
      const paisesList = Array.isArray(paisesData) ? paisesData : (paisesData?.results || []);
      this.paisesMap.clear();
      paisesList.forEach((p: any) => this.paisesMap.set(p.codigo_iso, p));

      this.portafolio = await this.portafolioService.getPortafolio(this.portafolioId);

      try {
        this.resumen = await this.portafolioService.getResumen(this.portafolioId);
      } catch {
        this.resumen = null;
      }

      this.calcularKpisLocales();
    } catch (error) {
      this.alerta.show('No se pudo cargar la información del portafolio.', 'error');
      this.volver();
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  calcularKpisLocales(): void {
    if (!this.portafolio?.posiciones) {
      this.totalInvertidoUsd = 0;
      this.riesgoPromedioPonderado = 0;
      return;
    }

    const posicionesActivas = this.portafolio.posiciones.filter(p => !p.fecha_salida);

    this.totalInvertidoUsd = posicionesActivas.reduce((acc, p) => acc + Number(p.monto_inversion_usd), 0);

    if (this.totalInvertidoUsd === 0) {
      this.riesgoPromedioPonderado = 0;
      return;
    }

    let sumaRiesgoPonderado = 0;
    posicionesActivas.forEach(pos => {
      const pais = this.paisesMap.get(pos.pais);
      const scorePais = pais?.ultimo_irpc ?? pais?.indice_riesgo ?? 50;
      sumaRiesgoPonderado += Number(pos.monto_inversion_usd) * Number(scorePais);
    });

    this.riesgoPromedioPonderado = Math.round((sumaRiesgoPonderado / this.totalInvertidoUsd) * 100) / 100;
  }

  getNombrePais(codigoIso: string): string {
    return this.paisesMap.get(codigoIso)?.nombre || codigoIso;
  }

  abrirCrearPosicion(): void {
    this.posicionSeleccionada = null;
    this.isPosicionModalOpen = true;
    this.cdr.detectChanges();
  }

  abrirEditarPosicion(pos: PosicionDTO): void {
    this.posicionSeleccionada = pos;
    this.isPosicionModalOpen = true;
    this.cdr.detectChanges();
  }

  onPosicionModalClosed(guardado: boolean): void {
    this.isPosicionModalOpen = false;
    this.posicionSeleccionada = null;
    this.cdr.detectChanges();
    if (guardado) {
      this.cargarDatos();
    }
  }

  confirmarCerrarPosicion(pos: PosicionDTO): void {
    this.posicionACerrar = pos;
    this.isConfirmCerrarOpen = true;
  }

  cancelarCerrarPosicion(): void {
    this.posicionACerrar = null;
    this.isConfirmCerrarOpen = false;
  }

async ejecutarCerrarPosicion(): Promise<void> {
    if (!this.posicionACerrar?.id) return;
    this.isClosing = true;

    try {
      await this.portafolioService.cerrarPosicion(this.portafolioId, this.posicionACerrar.id);
      this.alerta.show('Posición cerrada exitosamente.', 'success');
      this.cancelarCerrarPosicion();
      await this.cargarDatos();
    } catch (err: any) {
      this.cancelarCerrarPosicion();
      const mensajeBackend = 
        err?.error?.error || 
        (typeof err?.error === 'string' ? err.error : null) || 
        err?.message || 
        'Ocurrió un error al intentar cerrar la posición.';
      this.alerta.show(mensajeBackend, 'error');
    } finally {
      this.isClosing = false;
      this.cdr.detectChanges();
    }
  }

  abrirEditarPortafolio(): void {
    this.isPortafolioModalOpen = true;
    this.cdr.detectChanges();
  }

  onPortafolioModalClosed(guardado: boolean): void {
    this.isPortafolioModalOpen = false;
    this.cdr.detectChanges();
    if (guardado) {
      this.cargarDatos();
    }
  }

  async exportarPdf(): Promise<void> {
    this.isExportingPdf = true;
    this.cdr.detectChanges();
    try {
      await this.portafolioService.descargarPdf(
        this.portafolioId,
        `Reporte_${this.portafolio?.nombre?.replace(/\s+/g, '_') || this.portafolioId}.pdf`
      );
      this.alerta.show('PDF generado y descargado con éxito.', 'success');
    } catch (error) {
      this.alerta.show('Error al generar la exportación a PDF.', 'error');
    } finally {
      this.isExportingPdf = false;
      this.cdr.detectChanges();
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard/listar-portafolios']);
  }
}